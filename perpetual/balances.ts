import { Decimal } from 'decimal.js';

export interface BalanceModel {
  collateralName: string;
  balance: Decimal;
  equity: Decimal;
  availableForTrade: Decimal;
  availableForWithdrawal: Decimal;
  unrealisedPnl: Decimal;
  initialMargin: Decimal;
  marginRatio: Decimal;
  updatedTime: number;
}