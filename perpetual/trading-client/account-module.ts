import { Decimal } from 'decimal.js';
import { BaseModule } from './base-module';
import { BalanceModel } from '../balances';
import { PositionModel, PositionHistoryModel, PositionSide } from '../positions';
import { OpenOrderModel, OrderSide, OrderType } from '../orders';
import { AccountTradeModel, TradeType } from '../trades';
import { TradingFeeModel } from '../fees';
import { AccountLeverage } from '../accounts';
import { WrappedApiResponse } from '../../utils/http';

export class AccountModule extends BaseModule {
  async getBalance(): Promise<WrappedApiResponse<BalanceModel>> {
    const url = this.buildUrl('/user/balance');
    return await this.httpClient.get<BalanceModel>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async getPositions(options?: {
    marketNames?: string[];
    positionSide?: PositionSide;
  }): Promise<WrappedApiResponse<PositionModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (options?.marketNames) queryParams.market = options.marketNames;
    if (options?.positionSide) queryParams.side = options.positionSide;
    
    const url = this.buildUrl('/user/positions', undefined, queryParams);
    return await this.httpClient.get<PositionModel[]>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async getPositionsHistory(options?: {
    marketNames?: string[];
    positionSide?: PositionSide;
    limit?: number;
    cursor?: number;
  }): Promise<WrappedApiResponse<PositionHistoryModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (options?.marketNames) queryParams.market = options.marketNames;
    if (options?.positionSide) queryParams.side = options.positionSide;
    if (options?.limit !== undefined) queryParams.limit = options.limit;
    if (options?.cursor !== undefined) queryParams.cursor = options.cursor;
    
    const url = this.buildUrl('/user/positions/history', undefined, queryParams);
    return await this.httpClient.get<PositionHistoryModel[]>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async getOpenOrders(options?: {
    marketNames?: string[];
    orderSide?: OrderSide;
    orderType?: OrderType;
    limit?: number;
    cursor?: number;
  }): Promise<WrappedApiResponse<OpenOrderModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (options?.marketNames) queryParams.market = options.marketNames;
    if (options?.orderSide) queryParams.side = options.orderSide;
    if (options?.orderType) queryParams.type = options.orderType;
    if (options?.limit !== undefined) queryParams.limit = options.limit;
    if (options?.cursor !== undefined) queryParams.cursor = options.cursor;
    
    const url = this.buildUrl('/user/orders', undefined, queryParams);
    return await this.httpClient.get<OpenOrderModel[]>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async getAccountTrades(options?: {
    marketNames?: string[];
    orderSide?: OrderSide;
    tradeType?: TradeType;
    limit?: number;
    cursor?: number;
    startTime?: number;
    endTime?: number;
  }): Promise<WrappedApiResponse<AccountTradeModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (options?.marketNames) queryParams.market = options.marketNames;
    if (options?.orderSide) queryParams.side = options.orderSide;
    if (options?.tradeType) queryParams.tradeType = options.tradeType;
    if (options?.limit !== undefined) queryParams.limit = options.limit;
    if (options?.cursor !== undefined) queryParams.cursor = options.cursor;
    if (options?.startTime !== undefined) queryParams.startTime = options.startTime;
    if (options?.endTime !== undefined) queryParams.endTime = options.endTime;
    
    const url = this.buildUrl('/user/trades', undefined, queryParams);
    return await this.httpClient.get<AccountTradeModel[]>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async getTradingFees(marketNames?: string[]): Promise<WrappedApiResponse<TradingFeeModel[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (marketNames) queryParams.market = marketNames;
    
    const url = this.buildUrl('/user/trading_fees', undefined, queryParams);
    return await this.httpClient.get<TradingFeeModel[]>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async setLeverage(market: string, leverage: Decimal): Promise<WrappedApiResponse<AccountLeverage>> {
    const url = this.buildUrl('/user/leverage');
    const requestData = {
      market,
      leverage: leverage.toString(),
    };
    return await this.httpClient.patch<AccountLeverage>(url, requestData, {
      apiKey: this.getApiKey(),
    });
  }

  async getLeverage(marketNames?: string[]): Promise<WrappedApiResponse<AccountLeverage[]>> {
    const queryParams: Record<string, string | string[] | number | boolean> = {};
    if (marketNames) queryParams.market = marketNames;
    
    const url = this.buildUrl('/user/leverage', undefined, queryParams);
    return await this.httpClient.get<AccountLeverage[]>(url, {
      apiKey: this.getApiKey(),
    });
  }
}