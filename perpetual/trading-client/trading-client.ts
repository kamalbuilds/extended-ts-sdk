import { Decimal } from 'decimal.js';
import { EndpointConfig } from '../../config';
import { StarkPerpetualAccount } from '../accounts';
import { OrderSide, TimeInForce, SelfTradeProtectionLevel, PlacedOrderModel } from '../orders';
import { WrappedApiResponse } from '../../utils/http';
import { AccountModule } from './account-module';
import { OrderManagementModule } from './order-management-module';
import { InfoModule } from './info-module';
import { MarketsInformationModule } from './markets-information-module';
import { createOrderObject } from '../order-object';
import { MarketModel } from '../markets';
// import { getLogger } from '../../utils/log';
// const logger = getLogger('PerpetualTradingClient');

export class PerpetualTradingClient {
  private starkAccount?: StarkPerpetualAccount;
  private endpointConfig: EndpointConfig;
  private marketsCache?: Map<string, MarketModel>;

  private infoModule: InfoModule;
  private marketsInfoModule: MarketsInformationModule;
  private accountModule: AccountModule;
  private orderManagementModule: OrderManagementModule;

  constructor(endpointConfig: EndpointConfig, starkAccount?: StarkPerpetualAccount) {
    this.endpointConfig = endpointConfig;
    this.starkAccount = starkAccount;

    const apiKey = starkAccount?.apiKeyValue;

    this.infoModule = new InfoModule(endpointConfig, apiKey);
    this.marketsInfoModule = new MarketsInformationModule(endpointConfig, apiKey);
    this.accountModule = new AccountModule(endpointConfig, apiKey);
    this.orderManagementModule = new OrderManagementModule(endpointConfig, apiKey);
  }

  async placeOrder(options: {
    marketName: string;
    amountOfSynthetic: Decimal;
    price: Decimal;
    side: OrderSide;
    postOnly?: boolean;
    previousOrderId?: string;
    expireTime?: Date;
    timeInForce?: TimeInForce;
    selfTradeProtectionLevel?: SelfTradeProtectionLevel;
    externalId?: string;
    builderFee?: Decimal;
    builderId?: number;
  }): Promise<WrappedApiResponse<PlacedOrderModel>> {
    if (!this.starkAccount) {
      throw new Error('Stark account is not set');
    }

    if (!this.marketsCache) {
      const marketsResponse = await this.marketsInfoModule.getMarkets();
      if (!marketsResponse.data) {
        throw new Error('Failed to fetch markets');
      }
      this.marketsCache = new Map(marketsResponse.data.map(m => [m.name, m]));
    }

    const market = this.marketsCache.get(options.marketName);
    if (!market) {
      throw new Error(`Market ${options.marketName} not found`);
    }

    const expireTime = options.expireTime || new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    const order = await createOrderObject({
      account: this.starkAccount,
      market,
      amountOfSynthetic: options.amountOfSynthetic,
      price: options.price,
      side: options.side,
      postOnly: options.postOnly || false,
      previousOrderExternalId: options.previousOrderId,
      expireTime,
      timeInForce: options.timeInForce || TimeInForce.GTT,
      selfTradeProtectionLevel: options.selfTradeProtectionLevel || SelfTradeProtectionLevel.ACCOUNT,
      starknetDomain: this.endpointConfig.starknetDomain,
      orderExternalId: options.externalId,
      builderFee: options.builderFee,
      builderId: options.builderId,
    });

    return await this.orderManagementModule.placeOrder(order);
  }

  setStarkAccount(account: StarkPerpetualAccount): void {
    this.starkAccount = account;
    const apiKey = account.apiKeyValue;
    
    this.infoModule.setApiKey(apiKey);
    this.marketsInfoModule.setApiKey(apiKey);
    this.accountModule.setApiKey(apiKey);
    this.orderManagementModule.setApiKey(apiKey);
  }

  get account(): AccountModule {
    return this.accountModule;
  }

  get orders(): OrderManagementModule {
    return this.orderManagementModule;
  }

  get info(): InfoModule {
    return this.infoModule;
  }

  get markets(): MarketsInformationModule {
    return this.marketsInfoModule;
  }

  get config(): EndpointConfig {
    return this.endpointConfig;
  }
}