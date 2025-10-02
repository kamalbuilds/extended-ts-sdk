import { BaseModule } from './base-module';
import { PerpetualOrderModel, PlacedOrderModel } from '../orders';
import { WrappedApiResponse } from '../../utils/http';
import { getLogger } from '../../utils/log';

const logger = getLogger('OrderManagementModule');

export interface MassCancelRequest {
  orderIds?: number[];
  externalOrderIds?: string[];
  markets?: string[];
  cancelAll?: boolean;
}

export interface EmptyResponse {
  // Empty response model
}

export class OrderManagementModule extends BaseModule {
  async placeOrder(order: PerpetualOrderModel): Promise<WrappedApiResponse<PlacedOrderModel>> {
    logger.debug(`Placing an order: id=${order.id}`);

    const url = this.buildUrl('/user/order');
    const orderData = this.convertOrderToApiRequest(order);

    return await this.httpClient.post<PlacedOrderModel>(url, orderData, {
      apiKey: this.getApiKey(),
    });
  }

  async cancelOrder(orderId: number): Promise<WrappedApiResponse<EmptyResponse>> {
    const url = this.buildUrl('/user/order/<orderId>', { orderId });
    
    return await this.httpClient.delete<EmptyResponse>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async cancelOrderByExternalId(orderExternalId: string): Promise<WrappedApiResponse<EmptyResponse>> {
    const url = this.buildUrl('/user/order', undefined, { externalId: orderExternalId });
    
    return await this.httpClient.delete<EmptyResponse>(url, {
      apiKey: this.getApiKey(),
    });
  }

  async massCancel(request: MassCancelRequest): Promise<WrappedApiResponse<EmptyResponse>> {
    const url = this.buildUrl('/user/order/massCancel');
    
    const requestData = {
      orderIds: request.orderIds,
      externalOrderIds: request.externalOrderIds,
      markets: request.markets,
      cancelAll: request.cancelAll || false,
    };

    return await this.httpClient.post<EmptyResponse>(url, requestData, {
      apiKey: this.getApiKey(),
    });
  }

  private convertOrderToApiRequest(order: PerpetualOrderModel): Record<string, unknown> {
    return {
      id: order.id,
      market: order.market,
      type: order.type,
      side: order.side,
      qty: order.qty.toString(),
      price: order.price.toString(),
      reduceOnly: order.reduceOnly || false,
      postOnly: order.postOnly || false,
      timeInForce: order.timeInForce,
      expiryEpochMillis: order.expiryEpochMillis,
      fee: order.fee.toString(),
      nonce: order.nonce.toString(),
      selfTradeProtectionLevel: order.selfTradeProtectionLevel,
      cancelId: order.cancelId,
      settlement: order.settlement ? {
        signature: {
          r: order.settlement.signature.r.toHex(),
          s: order.settlement.signature.s.toHex(),
        },
        starkKey: order.settlement.starkKey.toHex(),
        collateralPosition: order.settlement.collateralPosition.toString(),
      } : undefined,
      trigger: order.trigger,
      tpSlType: order.tpSlType,
      takeProfit: order.takeProfit,
      stopLoss: order.stopLoss,
      debuggingAmounts: order.debuggingAmounts ? {
        collateralAmount: order.debuggingAmounts.collateralAmount.toString(),
        feeAmount: order.debuggingAmounts.feeAmount.toString(),
        syntheticAmount: order.debuggingAmounts.syntheticAmount.toString(),
      } : undefined,
      builderFee: order.builderFee?.toString(),
      builderId: order.builderId,
    };
  }
}