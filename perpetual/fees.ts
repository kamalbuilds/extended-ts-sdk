import { Decimal } from 'decimal.js';

export interface TradingFeeModel {
  market: string;
  makerFeeRate: Decimal;
  takerFeeRate: Decimal;
  builderFeeRate: Decimal;
}

export const DEFAULT_FEES: TradingFeeModel = {
  market: 'BTC-USD',
  makerFeeRate: new Decimal(2).div(10000),
  takerFeeRate: new Decimal(5).div(10000),
  builderFeeRate: new Decimal(0),
};