import { HttpClient } from '../../utils/http';
import { EndpointConfig } from '../../config';
import { buildUrl } from '../../utils/http';

export abstract class BaseModule {
  protected httpClient: HttpClient;
  protected config: EndpointConfig;
  protected apiKey?: string;

  constructor(config: EndpointConfig, apiKey?: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.httpClient = new HttpClient(config.apiBaseUrl);
  }

  protected buildUrl(
    template: string,
    pathParams?: Record<string, string | number>,
    queryParams?: Record<string, string | string[] | number | boolean>
  ): string {
    return buildUrl(template, pathParams, queryParams);
  }

  protected getApiKey(): string {
    if (!this.apiKey) {
      throw new Error('API key is required for this operation');
    }
    return this.apiKey;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}