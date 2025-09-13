import { Decimal } from 'decimal.js';

export enum ExitType {
  TRADE = 'TRADE',
  LIQUIDATION = 'LIQUIDATION',
  ADL = 'ADL',
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

export interface PositionModel {
  id: number;
  accountId: number;
  market: string;
  side: PositionSide;
  leverage: Decimal;
  size: Decimal;
  value: Decimal;
  openPrice: Decimal;
  markPrice: Decimal;
  liquidationPrice?: Decimal;
  unrealisedPnl: Decimal;
  realisedPnl: Decimal;
  tpPrice?: Decimal;
  slPrice?: Decimal;
  adl?: number;
  createdAt: number;
  updatedAt: number;
}

export interface PositionHistoryModel {
  id: number;
  accountId: number;
  market: string;
  side: PositionSide;
  leverage: Decimal;
  size: Decimal;
  openPrice: Decimal;
  exitType?: ExitType;
  exitPrice?: Decimal;
  realisedPnl: Decimal;
  createdTime: number;
  closedTime?: number;
}