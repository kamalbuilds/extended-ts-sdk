import { Decimal } from 'decimal.js';

export interface MarketModel {
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  tickSize: Decimal;
  stepSize: Decimal;
  minOrderSize: Decimal;
  maxOrderSize: Decimal;
  maxLeverage: Decimal;
  marginRequirement: Decimal;
  maintenanceMargin: Decimal;
  makerFee: Decimal;
  takerFee: Decimal;
  indexPrice: Decimal;
  markPrice: Decimal;
  fundingRate: Decimal;
  nextFundingTime: number;
  openInterest: Decimal;
  volume24h: Decimal;
  high24h: Decimal;
  low24h: Decimal;
  priceChange24h: Decimal;
  priceChangePercent24h: Decimal;
  isActive: boolean;
  lastTradePrice: Decimal;
  lastTradeTime: number;
}