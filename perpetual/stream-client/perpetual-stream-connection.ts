import { StreamClient, StreamSubscription } from './stream-client';
import { EndpointConfig } from '../../config';
import { AccountStreamDataModel } from '../accounts';
import { BalanceModel } from '../balances';
import { OpenOrderModel } from '../orders';
import { PositionModel } from '../positions';
import { AccountTradeModel, PublicTradeModel } from '../trades';
import { getLogger } from '../../utils/log';

const logger = getLogger('PerpetualStreamConnection');

export interface PerpetualStreamEvents {
  balance: (data: BalanceModel) => void;
  order: (data: OpenOrderModel) => void;
  position: (data: PositionModel) => void;
  trade: (data: AccountTradeModel) => void;
  publicTrade: (data: PublicTradeModel) => void;
  snapshot: (data: AccountStreamDataModel) => void;
  connected: () => void;
  disconnected: (code: number, reason: string) => void;
  error: (error: Error) => void;
}

export class PerpetualStreamConnection extends StreamClient {
  constructor(config: EndpointConfig) {
    super(config, {
      autoReconnect: true,
      maxReconnectAttempts: 10,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 15000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('balance', (data: BalanceModel) => {
      logger.debug('Received balance update', data);
    });

    this.on('order', (data: OpenOrderModel) => {
      logger.debug('Received order update', data);
    });

    this.on('position', (data: PositionModel) => {
      logger.debug('Received position update', data);
    });

    this.on('trade', (data: AccountTradeModel) => {
      logger.debug('Received trade update', data);
    });

    this.on('snapshot', (data: AccountStreamDataModel) => {
      logger.debug('Received account snapshot', data);
    });

    this.on('error', (error: Error) => {
      logger.error('Stream error', error);
    });

    this.on('connected', () => {
      logger.info('Perpetual stream connected');
    });

    this.on('disconnected', (code: number, reason: string) => {
      logger.info(`Perpetual stream disconnected: ${code} ${reason}`);
    });
  }

  subscribeToAccount(accountId: number): void {
    const subscription: StreamSubscription = {
      channel: 'account',
      filters: { accountId },
    };
    this.subscribe(subscription);
  }

  subscribeToMarketTrades(market: string): void {
    const subscription: StreamSubscription = {
      channel: 'trades',
      filters: { market },
    };
    this.subscribe(subscription);
  }

  subscribeToOrderbook(market: string): void {
    const subscription: StreamSubscription = {
      channel: 'orderbook',
      filters: { market },
    };
    this.subscribe(subscription);
  }

  subscribeToCandles(market: string, interval: string = '1m'): void {
    const subscription: StreamSubscription = {
      channel: 'candles',
      filters: { market, interval },
    };
    this.subscribe(subscription);
  }

  unsubscribeFromAccount(accountId: number): void {
    const subscription: StreamSubscription = {
      channel: 'account',
      filters: { accountId },
    };
    this.unsubscribe(subscription);
  }

  unsubscribeFromMarketTrades(market: string): void {
    const subscription: StreamSubscription = {
      channel: 'trades',
      filters: { market },
    };
    this.unsubscribe(subscription);
  }

  unsubscribeFromOrderbook(market: string): void {
    const subscription: StreamSubscription = {
      channel: 'orderbook',
      filters: { market },
    };
    this.unsubscribe(subscription);
  }

  unsubscribeFromCandles(market: string, interval: string = '1m'): void {
    const subscription: StreamSubscription = {
      channel: 'candles',
      filters: { market, interval },
    };
    this.unsubscribe(subscription);
  }
}