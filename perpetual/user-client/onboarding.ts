import { ethers } from 'ethers';
import { getPublicKey, sign as starkSign } from '@scure/starknet';
import { pedersen } from '@scure/starknet';
import { AccountModel } from '../accounts';
import { formatDateToISO } from '../../utils/date';

export const REGISTER_ACTION = 'REGISTER';
export const SUB_ACCOUNT_ACTION = 'CREATE_SUB_ACCOUNT';

export interface OnboardedClientModel {
  l1Address: string;
  defaultAccount: AccountModel;
}

export interface StarkKeyPair {
  private: bigint;
  public: bigint;
  publicHex: string;
  privateHex: string;
}

export interface AccountRegistration {
  accountIndex: number;
  wallet: string;
  tosAccepted: boolean;
  time: Date;
  action: string;
  host: string;
  timeString: string;
}

export interface SubAccountOnboardingPayload {
  l2Key: bigint;
  l2R: bigint;
  l2S: bigint;
  accountRegistration: AccountRegistration;
  description: string;
}

export interface OnboardingPayload {
  l1Signature: string;
  l2Key: bigint;
  l2R: bigint;
  l2S: bigint;
  accountRegistration: AccountRegistration;
  referralCode?: string;
}

export function createStarkKeyPair(privateKey: bigint): StarkKeyPair {
  const publicKey = getPublicKey(privateKey);
  return {
    private: privateKey,
    public: BigInt(publicKey),
    publicHex: '0x' + BigInt(publicKey).toString(16),
    privateHex: '0x' + privateKey.toString(16),
  };
}

export function createAccountRegistration(
  accountIndex: number,
  address: string,
  timestamp: Date,
  action: string,
  host: string
): AccountRegistration {
  return {
    accountIndex,
    wallet: address,
    tosAccepted: true,
    time: timestamp,
    action,
    host,
    timeString: formatDateToISO(timestamp),
  };
}

export function createSignableMessage(registration: AccountRegistration, signingDomain: string): string {
  const domain = {
    name: signingDomain,
  };

  const types = {
    EIP712Domain: [{ name: 'name', type: 'string' }],
    AccountRegistration: [
      { name: 'accountIndex', type: 'int8' },
      { name: 'wallet', type: 'address' },
      { name: 'tosAccepted', type: 'bool' },
      { name: 'time', type: 'string' },
      { name: 'action', type: 'string' },
      { name: 'host', type: 'string' },
    ],
  };

  const message = {
    accountIndex: registration.accountIndex,
    wallet: registration.wallet,
    tosAccepted: registration.tosAccepted,
    time: registration.timeString,
    action: registration.action,
    host: registration.host,
  };

  const typedData = {
    types,
    domain,
    primaryType: 'AccountRegistration',
    message,
  };

  return JSON.stringify(typedData);
}

export function createKeyDerivationMessage(
  accountIndex: number,
  address: string,
  signingDomain: string
): string {
  const domain = {
    name: signingDomain,
  };

  const types = {
    EIP712Domain: [{ name: 'name', type: 'string' }],
    AccountCreation: [
      { name: 'accountIndex', type: 'int8' },
      { name: 'wallet', type: 'address' },
      { name: 'tosAccepted', type: 'bool' },
    ],
  };

  const message = {
    accountIndex,
    wallet: address,
    tosAccepted: true,
  };

  const typedData = {
    types,
    domain,
    primaryType: 'AccountCreation',
    message,
  };

  return JSON.stringify(typedData);
}

export async function deriveL2KeysFromL1Account(
  wallet: ethers.Wallet,
  accountIndex: number,
  signingDomain: string
): Promise<StarkKeyPair> {
  const typedData = createKeyDerivationMessage(accountIndex, wallet.address, signingDomain);
  const signature = await wallet._signTypedData(
    JSON.parse(typedData).domain,
    JSON.parse(typedData).types,
    JSON.parse(typedData).message
  );

  const privateKey = BigInt(signature);
  const publicKey = getPublicKey(privateKey);

  return createStarkKeyPair(privateKey);
}

export async function createOnboardingPayload(
  wallet: ethers.Wallet,
  signingDomain: string,
  keyPair: StarkKeyPair,
  host: string,
  time?: Date,
  referralCode?: string
): Promise<OnboardingPayload> {
  const timestamp = time || new Date();

  const registration = createAccountRegistration(0, wallet.address, timestamp, REGISTER_ACTION, host);

  const typedData = createSignableMessage(registration, signingDomain);
  const l1Signature = await wallet._signTypedData(
    JSON.parse(typedData).domain,
    JSON.parse(typedData).types,
    JSON.parse(typedData).message
  );

  const l2Message = pedersen(BigInt(wallet.address), keyPair.public);
  const [l2R, l2S] = starkSign(keyPair.private, l2Message);

  return {
    l1Signature,
    l2Key: keyPair.public,
    l2R,
    l2S,
    accountRegistration: registration,
    referralCode,
  };
}

export function createSubAccountOnboardingPayload(
  accountIndex: number,
  l1Address: string,
  keyPair: StarkKeyPair,
  description: string,
  host: string,
  time?: Date
): SubAccountOnboardingPayload {
  const timestamp = time || new Date();

  const registration = createAccountRegistration(
    accountIndex,
    l1Address,
    timestamp,
    SUB_ACCOUNT_ACTION,
    host
  );

  const l2Message = pedersen(BigInt(l1Address), keyPair.public);
  const [l2R, l2S] = starkSign(keyPair.private, l2Message);

  return {
    l2Key: keyPair.public,
    l2R,
    l2S,
    accountRegistration: registration,
    description,
  };
}

export function onboardingPayloadToJson(payload: OnboardingPayload): Record<string, unknown> {
  return {
    l1Signature: payload.l1Signature,
    l2Key: '0x' + payload.l2Key.toString(16),
    l2Signature: {
      r: '0x' + payload.l2R.toString(16),
      s: '0x' + payload.l2S.toString(16),
    },
    accountCreation: {
      accountIndex: payload.accountRegistration.accountIndex,
      wallet: payload.accountRegistration.wallet,
      tosAccepted: payload.accountRegistration.tosAccepted,
      time: payload.accountRegistration.timeString,
      action: payload.accountRegistration.action,
      host: payload.accountRegistration.host,
    },
    referralCode: payload.referralCode,
  };
}

export function subAccountPayloadToJson(payload: SubAccountOnboardingPayload): Record<string, unknown> {
  return {
    l2Key: '0x' + payload.l2Key.toString(16),
    l2Signature: {
      r: '0x' + payload.l2R.toString(16),
      s: '0x' + payload.l2S.toString(16),
    },
    accountCreation: {
      accountIndex: payload.accountRegistration.accountIndex,
      wallet: payload.accountRegistration.wallet,
      tosAccepted: payload.accountRegistration.tosAccepted,
      time: payload.accountRegistration.timeString,
      action: payload.accountRegistration.action,
      host: payload.accountRegistration.host,
    },
    description: payload.description,
  };
}