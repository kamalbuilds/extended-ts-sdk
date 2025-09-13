import { Decimal } from 'decimal.js';
import { HexValue, SettlementSignatureModel } from '../utils/model';

export enum TimeInForce {
  GTT = 'GTT',
  IOC = 'IOC',
  FOK = 'FOK',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  CONDITIONAL = 'CONDITIONAL',
  MARKET = 'MARKET',
  TPSL = 'TPSL',
}

export enum OrderTpslType {
  ORDER = 'ORDER',
  POSITION = 'POSITION',
}

export enum OrderStatus {
  UNKNOWN = 'UNKNOWN',
  NEW = 'NEW',
  UNTRIGGERED = 'UNTRIGGERED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum OrderStatusReason {
  UNKNOWN = 'UNKNOWN',
  NONE = 'NONE',
  UNKNOWN_MARKET = 'UNKNOWN_MARKET',
  DISABLED_MARKET = 'DISABLED_MARKET',
  NOT_ENOUGH_FUNDS = 'NOT_ENOUGH_FUNDS',
  NO_LIQUIDITY = 'NO_LIQUIDITY',
  INVALID_FEE = 'INVALID_FEE',
  INVALID_QTY = 'INVALID_QTY',
  INVALID_PRICE = 'INVALID_PRICE',
  INVALID_VALUE = 'INVALID_VALUE',
  UNKNOWN_ACCOUNT = 'UNKNOWN_ACCOUNT',
  SELF_TRADE_PROTECTION = 'SELF_TRADE_PROTECTION',
  POST_ONLY_FAILED = 'POST_ONLY_FAILED',
  REDUCE_ONLY_FAILED = 'REDUCE_ONLY_FAILED',
  INVALID_EXPIRE_TIME = 'INVALID_EXPIRE_TIME',
  POSITION_TPSL_CONFLICT = 'POSITION_TPSL_CONFLICT',
  INVALID_LEVERAGE = 'INVALID_LEVERAGE',
  PREV_ORDER_NOT_FOUND = 'PREV_ORDER_NOT_FOUND',
  PREV_ORDER_TRIGGERED = 'PREV_ORDER_TRIGGERED',
  TPSL_OTHER_SIDE_FILLED = 'TPSL_OTHER_SIDE_FILLED',
  PREV_ORDER_CONFLICT = 'PREV_ORDER_CONFLICT',
  ORDER_REPLACED = 'ORDER_REPLACED',
  POST_ONLY_MODE = 'POST_ONLY_MODE',
  REDUCE_ONLY_MODE = 'REDUCE_ONLY_MODE',
  TRADING_OFF_MODE = 'TRADING_OFF_MODE',
}

export enum OrderTriggerPriceType {
  UNKNOWN = 'UNKNOWN',
  MARK = 'MARK',
  INDEX = 'INDEX',
  LAST = 'LAST',
}

export enum OrderTriggerDirection {
  UNKNOWN = 'UNKNOWN',
  UP = 'UP',
  DOWN = 'DOWN',
}

export enum OrderPriceType {
  UNKNOWN = 'UNKNOWN',
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

export enum SelfTradeProtectionLevel {
  DISABLED = 'DISABLED',
  ACCOUNT = 'ACCOUNT',
  CLIENT = 'CLIENT',
}

export interface StarkSettlementModel {
  signature: SettlementSignatureModel;
  starkKey: HexValue;
  collateralPosition: Decimal;
}

export interface StarkDebuggingOrderAmountsModel {
  collateralAmount: Decimal;
  feeAmount: Decimal;
  syntheticAmount: Decimal;
}

export interface CreateOrderConditionalTriggerModel {
  triggerPrice: Decimal;
  triggerPriceType: OrderTriggerPriceType;
  direction: OrderTriggerDirection;
  executionPriceType: OrderPriceType;
}

export interface CreateOrderTpslTriggerModel {
  triggerPrice: Decimal;
  triggerPriceType: OrderTriggerPriceType;
  price: Decimal;
  priceType: OrderPriceType;
  settlement: StarkSettlementModel;
  debuggingAmounts?: StarkDebuggingOrderAmountsModel;
}

export interface PerpetualOrderModel {
  id: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  qty: Decimal;
  price: Decimal;
  reduceOnly?: boolean;
  postOnly?: boolean;
  timeInForce: TimeInForce;
  expiryEpochMillis: number;
  fee: Decimal;
  nonce: Decimal;
  selfTradeProtectionLevel: SelfTradeProtectionLevel;
  cancelId?: string;
  settlement?: StarkSettlementModel;
  trigger?: CreateOrderConditionalTriggerModel;
  tpSlType?: OrderTpslType;
  takeProfit?: CreateOrderTpslTriggerModel;
  stopLoss?: CreateOrderTpslTriggerModel;
  debuggingAmounts?: StarkDebuggingOrderAmountsModel;
  builderFee?: Decimal;
  builderId?: number;
}

export interface PlacedOrderModel {
  id: number;
  externalId: string;
}

export interface OpenOrderModel {
  id: number;
  accountId: number;
  externalId: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  statusReason?: OrderStatusReason;
  price: Decimal;
  averagePrice?: Decimal;
  qty: Decimal;
  filledQty?: Decimal;
  reduceOnly: boolean;
  postOnly: boolean;
  payedFee?: Decimal;
  createdTime: number;
  updatedTime: number;
  expiryTime?: number;
}