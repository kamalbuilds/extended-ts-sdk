/**
 * Resilient WebSocket client with automatic reconnection
 * @module modules/websocket/resilient-websocket
 */

import { EventEmitter } from 'eventemitter3';
import { IWebSocketConfig } from '../../types/core.interfaces';
import { logger } from '../../utils/logger';
import { ExponentialBackoff } from '../../utils/exponential-backoff';

export enum WebSocketState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  FAILED = 'FAILED'
}

export interface WebSocketEvents {
  open: (event: Event) => void;
  close: (event: CloseEvent) => void;
  error: (event: Event) => void;
  message: (data: any) => void;
  stateChange: (state: WebSocketState) => void;
  reconnecting: (attempt: number) => void;
  reconnected: () => void;
}

export class ResilientWebSocket extends EventEmitter<WebSocketEvents> {
  private ws: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private backoff: ExponentialBackoff;
  private isDestroyed = false;
  private lastPongReceived = Date.now();

  constructor(
    private url: string,
    private config: IWebSocketConfig
  ) {
    super();
    this.backoff = new ExponentialBackoff({
      initialDelay: config.reconnectInterval || 1000,
      maxDelay: 30000,
      factor: 2,
      jitter: true
    });
    this.connect();
  }

  /**
   * Current WebSocket state
   */
  public get currentState(): WebSocketState {
    return this.state;
  }

  /**
   * Check if WebSocket is connected
   */
  public get isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED && 
           this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    if (this.isDestroyed) return;

    this.setState(WebSocketState.CONNECTING);
    
    try {
      if (typeof window !== 'undefined') {
        // Browser environment
        this.ws = new WebSocket(this.url, this.config.protocols);
      } else {
        // Node.js environment
        const WS = require('ws');
        this.ws = new WS(this.url, {
          protocols: this.config.protocols,
          handshakeTimeout: 10000,
          perMessageDeflate: true
        });
      }

      this.setupEventHandlers();
    } catch (error) {
      logger.error('Failed to create WebSocket', error);
      this.handleError(error as Event);
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      logger.info('WebSocket connected');
      this.handleOpen(event);
    };

    this.ws.onclose = (event) => {
      logger.info(`WebSocket closed: ${event.code} - ${event.reason}`);
      this.handleClose(event);
    };

    this.ws.onerror = (event) => {
      logger.error('WebSocket error', event);
      this.handleError(event);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(event: Event): void {
    this.setState(WebSocketState.CONNECTED);
    this.reconnectAttempts = 0;
    this.backoff.reset();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Flush message queue
    this.flushMessageQueue();
    
    // Emit events
    this.emit('open', event);
    
    if (this.reconnectAttempts > 0) {
      this.emit('reconnected');
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();
    this.ws = null;
    
    this.emit('close', event);
    
    // Check if we should reconnect
    if (!this.isDestroyed && this.shouldReconnect(event)) {
      this.scheduleReconnect();
    } else {
      this.setState(WebSocketState.FAILED);
    }
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    this.emit('error', event);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = this.parseMessage(event.data);
      
      // Handle heartbeat pong
      if (data.type === 'pong') {
        this.lastPongReceived = Date.now();
        return;
      }
      
      this.emit('message', data);
    } catch (error) {
      logger.error('Failed to parse WebSocket message', error);
    }
  }

  /**
   * Parse WebSocket message
   */
  private parseMessage(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return { type: 'text', data };
      }
    }
    return data;
  }

  /**
   * Check if we should attempt reconnection
   */
  private shouldReconnect(event: CloseEvent): boolean {
    // Don't reconnect for normal closure or if max attempts reached
    if (event.code === 1000 || event.code === 1001) return false;
    
    const maxAttempts = this.config.maxReconnectAttempts || 10;
    return this.reconnectAttempts < maxAttempts;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;
    
    const delay = this.backoff.nextDelay();
    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.emit('reconnecting', this.reconnectAttempts);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval) return;
    
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected) {
        this.stopHeartbeat();
        return;
      }
      
      // Check if we've received a pong recently
      const timeSinceLastPong = Date.now() - this.lastPongReceived;
      if (timeSinceLastPong > this.config.heartbeatInterval! * 2) {
        logger.warn('Heartbeat timeout, closing connection');
        this.ws?.close(4000, 'Heartbeat timeout');
        return;
      }
      
      // Send ping
      this.send({ type: 'ping', timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send data through WebSocket
   */
  public send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (this.isConnected) {
      try {
        this.ws!.send(message);
      } catch (error) {
        logger.error('Failed to send WebSocket message', error);
        this.messageQueue.push(message);
      }
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      try {
        this.ws!.send(message);
      } catch (error) {
        logger.error('Failed to send queued message', error);
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Set WebSocket state
   */
  private setState(state: WebSocketState): void {
    if (this.state !== state) {
      this.state = state;
      this.emit('stateChange', state);
    }
  }

  /**
   * Close WebSocket connection
   */
  public close(code = 1000, reason = 'Normal closure'): void {
    this.isDestroyed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
    
    this.setState(WebSocketState.DISCONNECTED);
    this.removeAllListeners();
  }

  /**
   * Destroy the WebSocket client
   */
  public destroy(): void {
    this.close();
    this.messageQueue = [];
  }
}