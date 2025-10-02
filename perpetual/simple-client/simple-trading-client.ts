import { Decimal } from 'decimal.js';
import { PerpetualTradingClient } from '../trading-client/trading-client';
import { EndpointConfig } from '../../config';
import { StarkPerpetualAccount } from '../accounts';
import { OrderSide, PlacedOrderModel } from '../orders';
import { WrappedApiResponse } from '../../utils/http';
import { getLogger } from '../../utils/log';

const logger = getLogger('SimpleTradingClient');

export class SimpleTradingClient {
  private tradingClient: PerpetualTradingClient;

  constructor(config: EndpointConfig, account: StarkPerpetualAccount) {
    this.tradingClient = new PerpetualTradingClient(config, account);
  }

  async buyMarket(
    market: string,
    amount: Decimal,
    maxPrice?: Decimal
  ): Promise<WrappedApiResponse<PlacedOrderModel>> {
    try {
      // Get current market price if maxPrice not specified
      const currentPrice = maxPrice || await this.getCurrentPrice(market);
      
      // Add some slippage protection (1% above current price)
      const buyPrice = currentPrice.mul(1.01);

      return await this.tradingClient.placeOrder({
        marketName: market,
        amountOfSynthetic: amount,
        price: buyPrice,
        side: OrderSide.BUY,
        postOnly: false,
      });
    } catch (error) {
      logger.error('Failed to place buy market order', error);
      throw error;
    }
  }

  async sellMarket(
    market: string,
    amount: Decimal,
    minPrice?: Decimal
  ): Promise<WrappedApiResponse<PlacedOrderModel>> {
    try {
      // Get current market price if minPrice not specified
      const currentPrice = minPrice || await this.getCurrentPrice(market);
      
      // Add some slippage protection (1% below current price)
      const sellPrice = currentPrice.mul(0.99);

      return await this.tradingClient.placeOrder({
        marketName: market,
        amountOfSynthetic: amount,
        price: sellPrice,
        side: OrderSide.SELL,
        postOnly: false,
      });
    } catch (error) {
      logger.error('Failed to place sell market order', error);
      throw error;
    }
  }

  async buyLimit(
    market: string,
    amount: Decimal,
    price: Decimal,
    postOnly: boolean = true
  ): Promise<WrappedApiResponse<PlacedOrderModel>> {
    return await this.tradingClient.placeOrder({
      marketName: market,
      amountOfSynthetic: amount,
      price,
      side: OrderSide.BUY,
      postOnly,
    });
  }

  async sellLimit(
    market: string,
    amount: Decimal,
    price: Decimal,
    postOnly: boolean = true
  ): Promise<WrappedApiResponse<PlacedOrderModel>> {
    return await this.tradingClient.placeOrder({
      marketName: market,
      amountOfSynthetic: amount,
      price,
      side: OrderSide.SELL,
      postOnly,
    });
  }

  async cancelOrder(orderId: number): Promise<void> {
    await this.tradingClient.orders.cancelOrder(orderId);
  }

  async cancelAllOrders(market?: string): Promise<void> {
    if (market) {
      await this.tradingClient.orders.massCancel({
        markets: [market],
        cancelAll: false,
      });
    } else {
      await this.tradingClient.orders.massCancel({
        cancelAll: true,
      });
    }
  }

  async getBalance() {
    return await this.tradingClient.account.getBalance();
  }

  async getPositions(market?: string) {
    if (market) {
      return await this.tradingClient.account.getPositions({
        marketNames: [market],
      });
    }
    return await this.tradingClient.account.getPositions();
  }

  async getOpenOrders(market?: string) {
    if (market) {
      return await this.tradingClient.account.getOpenOrders({
        marketNames: [market],
      });
    }
    return await this.tradingClient.account.getOpenOrders();
  }

  private async getCurrentPrice(market: string): Promise<Decimal> {
    const ticker = await this.tradingClient.markets.getTicker(market);
    if (!ticker.data) {
      throw new Error(`Failed to get current price for ${market}`);
    }
    return new Decimal(ticker.data.price);
  }

  get client(): PerpetualTradingClient {
    return this.tradingClient;
  }
}