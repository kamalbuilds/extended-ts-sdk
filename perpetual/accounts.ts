import { Decimal } from 'decimal.js';
import { sign } from '@scure/starknet';
import { isHexString } from '../utils/string';
import { SigningError } from '../errors';
import { TradingFeeModel } from './fees';
import { BalanceModel } from './balances';
import { OpenOrderModel } from './orders';
import { PositionModel } from './positions';
import { AccountTradeModel } from './trades';

export class StarkPerpetualAccount {
  private vault: number;
  private privateKey: bigint;
  private publicKey: bigint;
  private apiKey: string;
  private tradingFee: Map<string, TradingFeeModel>;

  constructor(vault: number | string, privateKey: string, publicKey: string, apiKey: string) {
    if (!isHexString(privateKey)) {
      throw new SigningError('Private key must be a valid hex string');
    }
    if (!isHexString(publicKey)) {
      throw new SigningError('Public key must be a valid hex string');
    }

    if (typeof vault === 'string') {
      this.vault = parseInt(vault, 10);
    } else if (typeof vault === 'number') {
      this.vault = vault;
    } else {
      throw new Error('Invalid vault type');
    }

    this.privateKey = BigInt(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
    this.publicKey = BigInt(publicKey.startsWith('0x') ? publicKey : `0x${publicKey}`);
    this.apiKey = apiKey;
    this.tradingFee = new Map();
  }

  get vaultId(): number {
    return this.vault;
  }

  get publicKeyHex(): string {
    return '0x' + this.publicKey.toString(16);
  }

  get apiKeyValue(): string {
    return this.apiKey;
  }

  get tradingFees(): Map<string, TradingFeeModel> {
    return this.tradingFee;
  }

  sign(msgHash: bigint): [bigint, bigint] {
    try {
      const signature = sign(this.privateKey, msgHash);
      return [signature.r, signature.s];
    } catch (error) {
      throw new SigningError(`Failed to sign message: ${error}`);
    }
  }
}

export interface AccountStreamDataModel {
  orders?: OpenOrderModel[];
  positions?: PositionModel[];
  trades?: AccountTradeModel[];
  balance?: BalanceModel;
}

export interface AccountLeverage {
  market: string;
  leverage: Decimal;
}

export interface AccountModel {
  id: number;
  description: string;
  accountIndex: number;
  status: string;
  l2Key: string;
  l2Vault: number;
  apiKeys?: string[];
}

export interface ApiKeyResponseModel {
  key: string;
}

export interface ApiKeyRequestModel {
  description: string;
}