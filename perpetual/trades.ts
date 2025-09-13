import { Decimal } from 'decimal.js';
import { OrderSide } from './orders';

export enum TradeType {
  TRADE = 'TRADE',
  LIQUIDATION = 'LIQUIDATION',
  DELEVERAGE = 'DELEVERAGE',
}

export interface PublicTradeModel {
  id: number;
  market: string;
  side: OrderSide;
  tradeType: TradeType;
  timestamp: number;
  price: Decimal;
  qty: Decimal;
}

export interface AccountTradeModel {
  id: number;
  accountId: number;
  market: string;
  orderId: number;
  side: OrderSide;
  price: Decimal;
  qty: Decimal;
  value: Decimal;
  fee: Decimal;
  isTaker: boolean;
  tradeType: TradeType;
  createdTime: number;
}