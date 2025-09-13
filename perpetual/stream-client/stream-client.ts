import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { getLogger } from '../../utils/log';
import { WrappedStreamResponse, StreamDataType } from '../../utils/http';
import { EndpointConfig } from '../../config';

const logger = getLogger('StreamClient');

export interface StreamSubscription {
  channel: string;
  filters?: Record<string, unknown>;
}

export interface StreamClientConfig {
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
}

export class StreamClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: EndpointConfig;
  private clientConfig: StreamClientConfig;
  private subscriptions: Set<string> = new Set();
  private isConnecting = false;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;

  constructor(config: EndpointConfig, clientConfig: StreamClientConfig = {}) {
    super();
    this.config = config;
    this.clientConfig = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      ...clientConfig,
    };
  }

  async connect(apiKey?: string): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const url = new URL(this.config.streamUrl);
      if (apiKey) {
        url.searchParams.append('api_key', apiKey);
      }

      this.ws = new WebSocket(url.toString());
      
      this.connectionTimer = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          logger.error('Connection timeout');
          this.ws.terminate();
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, this.clientConfig.connectionTimeout);

      this.ws.on('open', () => {
        logger.info('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.clearConnectionTimer();
        this.startHeartbeat();
        this.emit('connected');
        
        // Re-subscribe to all channels
        this.resubscribeAll();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString()) as WrappedStreamResponse<unknown>;
          this.handleMessage(message);
        } catch (error) {
          logger.error('Failed to parse message', error);
          this.emit('error', error);
        }
      });

      this.ws.on('close', (code: number, reason: Buffer) => {
        logger.info(`WebSocket closed: ${code} ${reason.toString()}`);
        this.cleanup();
        this.emit('disconnected', code, reason.toString());
        
        if (this.clientConfig.autoReconnect && this.shouldReconnect(code)) {
          this.scheduleReconnect();
        }
      });

      this.ws.on('error', (error: Error) => {
        logger.error('WebSocket error', error);
        this.handleConnectionError(error);
      });

    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  private handleConnectionError(error: Error): void {
    this.cleanup();
    this.emit('error', error);
    
    if (this.clientConfig.autoReconnect) {
      this.scheduleReconnect();
    }
  }

  private shouldReconnect(code: number): boolean {
    // Don't reconnect on authentication failures or other permanent errors
    return code !== 1000 && code !== 1001 && code !== 1002 && code !== 1003;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.clientConfig.maxReconnectAttempts || 5)) {
      logger.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = Math.min(
      this.clientConfig.reconnectDelay! * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    setTimeout(() => {
      this.connect().catch(error => {
        logger.error('Reconnection failed', error);
      });
    }, delay);
  }

  private cleanup(): void {
    this.isConnecting = false;
    this.clearConnectionTimer();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private startHeartbeat(): void {
    if (this.clientConfig.heartbeatInterval) {
      this.heartbeatTimer = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.ping();
        }
      }, this.clientConfig.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(message: WrappedStreamResponse<unknown>): void {
    this.emit('message', message);
    
    if (message.error) {
      this.emit('error', new Error(message.error));
      return;
    }

    if (message.type && message.data) {
      this.emit(message.type.toLowerCase(), message.data, message);
    }
  }

  private resubscribeAll(): void {
    for (const subscription of this.subscriptions) {
      this.sendMessage(JSON.parse(subscription));
    }
  }

  subscribe(subscription: StreamSubscription): void {
    const message = {
      method: 'subscribe',
      params: subscription,
    };

    const subscriptionKey = JSON.stringify(message);
    this.subscriptions.add(subscriptionKey);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    }
  }

  unsubscribe(subscription: StreamSubscription): void {
    const message = {
      method: 'unsubscribe',
      params: subscription,
    };

    const subscriptionKey = JSON.stringify({
      method: 'subscribe',
      params: subscription,
    });
    this.subscriptions.delete(subscriptionKey);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    }
  }

  private sendMessage(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logger.warn('Attempted to send message while not connected');
    }
  }

  disconnect(): void {
    this.clientConfig.autoReconnect = false;
    this.subscriptions.clear();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
    }
    
    this.cleanup();
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}