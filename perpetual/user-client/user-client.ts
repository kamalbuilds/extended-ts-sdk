import { ethers } from 'ethers';
import { HttpClient } from '../../utils/http';
import { EndpointConfig } from '../../config';
import { getLogger } from '../../utils/log';
import {
  OnboardedClientModel,
  StarkKeyPair,
  deriveL2KeysFromL1Account,
  createOnboardingPayload,
  createSubAccountOnboardingPayload,
  onboardingPayloadToJson,
  subAccountPayloadToJson,
} from './onboarding';
import { AccountModel, ApiKeyRequestModel, ApiKeyResponseModel } from '../accounts';

const logger = getLogger('UserClient');

export class UserClient {
  private httpClient: HttpClient;
  private config: EndpointConfig;

  constructor(config: EndpointConfig) {
    this.config = config;
    this.httpClient = new HttpClient(config.onboardingUrl);
  }

  async onboardUser(
    wallet: ethers.Wallet,
    host: string,
    referralCode?: string
  ): Promise<OnboardedClientModel> {
    try {
      const keyPair = await deriveL2KeysFromL1Account(wallet, 0, this.config.signingDomain);
      const payload = await createOnboardingPayload(
        wallet,
        this.config.signingDomain,
        keyPair,
        host,
        undefined,
        referralCode
      );

      const response = await this.httpClient.post<AccountModel>(
        '/v1/onboard',
        onboardingPayloadToJson(payload)
      );

      if (!response.data) {
        throw new Error('Failed to onboard user: no account data returned');
      }

      return {
        l1Address: wallet.address,
        defaultAccount: response.data,
      };
    } catch (error) {
      logger.error('Failed to onboard user', error);
      throw error;
    }
  }

  async createSubAccount(
    l1Address: string,
    keyPair: StarkKeyPair,
    description: string,
    host: string,
    accountIndex: number
  ): Promise<AccountModel> {
    try {
      const payload = createSubAccountOnboardingPayload(
        accountIndex,
        l1Address,
        keyPair,
        description,
        host
      );

      const response = await this.httpClient.post<AccountModel>(
        '/v1/sub_accounts',
        subAccountPayloadToJson(payload)
      );

      if (!response.data) {
        throw new Error('Failed to create sub account: no account data returned');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to create sub account', error);
      throw error;
    }
  }

  async createApiKey(
    description: string,
    apiKey: string
  ): Promise<ApiKeyResponseModel> {
    try {
      const request: ApiKeyRequestModel = { description };
      
      const response = await this.httpClient.post<ApiKeyResponseModel>(
        '/v1/api_keys',
        request,
        { apiKey }
      );

      if (!response.data) {
        throw new Error('Failed to create API key: no key data returned');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to create API key', error);
      throw error;
    }
  }

  async getAccount(accountId: number, apiKey: string): Promise<AccountModel> {
    try {
      const response = await this.httpClient.get<AccountModel>(
        `/v1/accounts/${accountId}`,
        { apiKey }
      );

      if (!response.data) {
        throw new Error('Failed to get account: no account data returned');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to get account', error);
      throw error;
    }
  }

  async listAccounts(apiKey: string): Promise<AccountModel[]> {
    try {
      const response = await this.httpClient.get<AccountModel[]>(
        '/v1/accounts',
        { apiKey }
      );

      return response.data || [];
    } catch (error) {
      logger.error('Failed to list accounts', error);
      throw error;
    }
  }

  getDerivedKeyPair(wallet: ethers.Wallet, accountIndex: number = 0): Promise<StarkKeyPair> {
    return deriveL2KeysFromL1Account(wallet, accountIndex, this.config.signingDomain);
  }
}