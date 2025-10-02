import { BaseModule } from './base-module';
import { MarketModel } from '../markets';
import { PublicTradeModel } from '../trades';
import { WrappedApiResponse } from '../../utils/http';

export interface OrderBookLevel {
  price: string;
  qty: string;
}

export interface OrderBookModel {
  market: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export interface CandleModel {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  timestamp: number;
}

export interface TickerModel {
  market: string;
  price: string;
  priceChange24h: string;
  priceChangePercent24h: string;
  volume24h: string;
  high24h: string;
  low24h: string;
  timestamp: number;
}

export class MarketsInformationModule extends BaseModule {
  async getMarkets(): Promise<WrappedApiResponse<MarketModel[]>> {
    const url = this.buildUrl('/markets');
    return await this.httpClient.get<MarketModel[]>(url);
  }

  async getMarket(marketName: string): Promise<WrappedApiResponse<MarketModel>> {
    const url = this.buildUrl('/markets/<market>', { market: marketName });
    return await this.httpClient.get<MarketModel>(url);
  }

  async getOrderBook(marketName: string, depth?: number): Promise<WrappedApiResponse<OrderBookModel>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (depth !== undefined) queryParams.depth = depth;
    
    const url = this.buildUrl('/markets/<market>/orderbook', { market: marketName }, queryParams);
    return await this.httpClient.get<OrderBookModel>(url);
  }

  async getTrades(marketName: string, options?: {
    limit?: number;
    cursor?: number;
  }): Promise<WrappedApiResponse<PublicTradeModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (options?.limit !== undefined) queryParams.limit = options.limit;
    if (options?.cursor !== undefined) queryParams.cursor = options.cursor;
    
    const url = this.buildUrl('/markets/<market>/trades', { market: marketName }, queryParams);
    return await this.httpClient.get<PublicTradeModel[]>(url);
  }

  async getCandles(marketName: string, options?: {
    interval?: string;
    limit?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<WrappedApiResponse<CandleModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {
      interval: options?.interval || '1m'
    };
    if (options?.limit !== undefined) queryParams.limit = options.limit;
    if (options?.startTime !== undefined) queryParams.startTime = options.startTime;
    if (options?.endTime !== undefined) queryParams.endTime = options.endTime;
    
    const url = this.buildUrl('/markets/<market>/candles', { market: marketName }, queryParams);
    return await this.httpClient.get<CandleModel[]>(url);
  }

  async getTicker(marketName: string): Promise<WrappedApiResponse<TickerModel>> {
    const url = this.buildUrl('/markets/<market>/ticker', { market: marketName });
    return await this.httpClient.get<TickerModel>(url);
  }

  async getAllTickers(): Promise<WrappedApiResponse<TickerModel[]>> {
    const url = this.buildUrl('/markets/tickers');
    return await this.httpClient.get<TickerModel[]>(url);
  }
}