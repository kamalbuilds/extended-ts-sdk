import { Decimal } from 'decimal.js';
import { StarkPerpetualAccount } from './accounts';
import { MarketModel } from './markets';
import { 
  PerpetualOrderModel, 
  OrderSide, 
  OrderType, 
  TimeInForce, 
  SelfTradeProtectionLevel,
  StarkSettlementModel 
} from './orders';
import { StarknetDomain } from '../config';
import { generateNonce } from '../utils/nonce';
import { HexValueImpl } from '../utils/model';
import { pedersen } from '@scure/starknet';

export interface CreateOrderOptions {
  account: StarkPerpetualAccount;
  market: MarketModel;
  amountOfSynthetic: Decimal;
  price: Decimal;
  side: OrderSide;
  postOnly?: boolean;
  previousOrderExternalId?: string;
  expireTime: Date;
  timeInForce: TimeInForce;
  selfTradeProtectionLevel: SelfTradeProtectionLevel;
  starknetDomain: StarknetDomain;
  orderExternalId?: string;
  builderFee?: Decimal;
  builderId?: number;
}

export async function createOrderObject(options: CreateOrderOptions): Promise<PerpetualOrderModel> {
  const {
    account,
    market,
    amountOfSynthetic,
    price,
    side,
    postOnly = false,
    previousOrderExternalId,
    expireTime,
    timeInForce,
    selfTradeProtectionLevel,
    starknetDomain,
    orderExternalId,
    builderFee,
    builderId,
  } = options;

  const externalId = orderExternalId || generateNonce();
  const nonce = new Decimal(generateNonce());
  const expiryEpochMillis = expireTime.getTime();

  // Calculate fee
  const fee = calculateOrderFee(amountOfSynthetic, price, side, market);

  // Calculate collateral position for settlement
  const collateralPosition = calculateCollateralPosition(amountOfSynthetic, price, side, fee);

  // Create settlement signature
  const settlement = await createStarkSettlement(
    account,
    collateralPosition,
    starknetDomain,
    market
  );

  return {
    id: externalId,
    market: market.name,
    type: OrderType.LIMIT,
    side,
    qty: amountOfSynthetic,
    price,
    reduceOnly: false,
    postOnly,
    timeInForce,
    expiryEpochMillis,
    fee,
    nonce,
    selfTradeProtectionLevel,
    ...(previousOrderExternalId && { cancelId: previousOrderExternalId }),
    settlement,
    ...(builderFee && { builderFee }),
    ...(builderId && { builderId }),
  };
}

function calculateOrderFee(amount: Decimal, price: Decimal, side: OrderSide, market: MarketModel): Decimal {
  const notional = amount.mul(price);
  const feeRate = side === OrderSide.BUY ? market.takerFee : market.makerFee;
  return notional.mul(feeRate);
}

function calculateCollateralPosition(amount: Decimal, price: Decimal, side: OrderSide, fee: Decimal): Decimal {
  const notional = amount.mul(price);
  
  if (side === OrderSide.BUY) {
    return notional.add(fee);
  } else {
    return notional.sub(fee);
  }
}

async function createStarkSettlement(
  account: StarkPerpetualAccount,
  collateralPosition: Decimal,
  starknetDomain: StarknetDomain,
  _market: MarketModel
): Promise<StarkSettlementModel> {
  // Create message hash for signing
  const messageHash = createOrderMessageHash(
    account.vaultId,
    collateralPosition,
    starknetDomain
  );

  // Sign the message
  const [r, s] = account.sign(messageHash);

  return {
    signature: {
      r: new HexValueImpl(r),
      s: new HexValueImpl(s),
    },
    starkKey: new HexValueImpl(BigInt(account.publicKeyHex)),
    collateralPosition,
  };
}

function createOrderMessageHash(
  vaultId: number,
  collateralPosition: Decimal,
  starknetDomain: StarknetDomain
): bigint {
  // This is a simplified message hash creation
  // In a real implementation, this would follow the exact Starknet domain separation standard
  const domainHash = pedersen(
    BigInt(starknetDomain.name.length),
    BigInt(starknetDomain.version.length)
  );
  
  const structHash = pedersen(
    BigInt(vaultId),
    BigInt(collateralPosition.toString())
  );

  return BigInt(pedersen(domainHash, structHash).toString());
}