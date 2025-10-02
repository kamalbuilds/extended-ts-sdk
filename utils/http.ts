import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { RateLimitException, NotAuthorizedException, X10Error } from '../errors';
import { DEFAULT_REQUEST_TIMEOUT_SECONDS, USER_AGENT } from '../config';
import { getLogger } from './log';

const logger = getLogger('http');

export enum RequestHeader {
  ACCEPT = 'Accept',
  API_KEY = 'X-Api-Key',
  CONTENT_TYPE = 'Content-Type',
  USER_AGENT = 'User-Agent',
}

export enum ResponseStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}

export interface ResponseError {
  code: number;
  message: string;
  debugInfo?: string;
}

export interface Pagination {
  cursor?: number;
  count: number;
}

export interface WrappedApiResponse<T> {
  status: ResponseStatus;
  data?: T;
  error?: ResponseError;
  pagination?: Pagination;
}

export enum StreamDataType {
  UNKNOWN = 'UNKNOWN',
  BALANCE = 'BALANCE',
  DELTA = 'DELTA',
  DEPOSIT = 'DEPOSIT',
  ORDER = 'ORDER',
  POSITION = 'POSITION',
  SNAPSHOT = 'SNAPSHOT',
  TRADE = 'TRADE',
  TRANSFER = 'TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
}

export interface WrappedStreamResponse<T> {
  type?: StreamDataType;
  data?: T;
  error?: string;
  ts: number;
  seq: number;
}

export class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string, timeout: number = DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000) {
    this.client = axios.create({
      ...(baseURL && { baseURL }),
      timeout,
      headers: {
        [RequestHeader.ACCEPT]: 'application/json',
        [RequestHeader.CONTENT_TYPE]: 'application/json',
        [RequestHeader.USER_AGENT]: USER_AGENT,
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleHttpError(error);
        return Promise.reject(error);
      }
    );
  }

  private getHeaders(apiKey?: string, additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      [RequestHeader.ACCEPT]: 'application/json',
      [RequestHeader.CONTENT_TYPE]: 'application/json',
      [RequestHeader.USER_AGENT]: USER_AGENT,
    };

    if (apiKey) {
      headers[RequestHeader.API_KEY] = apiKey;
    }

    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    return headers;
  }

  private handleHttpError(error: any): void {
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url || 'unknown';

      if (status === 401) {
        logger.error(`Unauthorized response from ${url}: ${JSON.stringify(data)}`);
        throw new NotAuthorizedException(`Unauthorized response from ${url}: ${JSON.stringify(data)}`);
      }

      if (status === 429) {
        logger.error(`Rate limited response from ${url}: ${JSON.stringify(data)}`);
        throw new RateLimitException(`Rate limited response from ${url}: ${JSON.stringify(data)}`);
      }

      if (status > 299) {
        logger.error(`Error response from ${url}: status ${status} - ${JSON.stringify(data)}`);
        throw new X10Error(`Error response from ${url}: status ${status} - ${JSON.stringify(data)}`);
      }
    }
  }

  private parseResponse<T>(response: AxiosResponse): WrappedApiResponse<T> {
    return response.data as WrappedApiResponse<T>;
  }

  async get<T>(
    url: string,
    config?: {
      apiKey?: string;
      headers?: Record<string, string>;
      params?: Record<string, unknown>;
    }
  ): Promise<WrappedApiResponse<T>> {
    const headers = this.getHeaders(config?.apiKey, config?.headers);
    logger.debug(`Sending GET ${url}`);

    const response = await this.client.get(url, {
      headers,
      params: config?.params,
    });

    return this.parseResponse<T>(response);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: {
      apiKey?: string;
      headers?: Record<string, string>;
    }
  ): Promise<WrappedApiResponse<T>> {
    const headers = this.getHeaders(config?.apiKey, config?.headers);
    logger.debug(`Sending POST ${url}, headers=${JSON.stringify(headers)}`);

    const response = await this.client.post(url, data, { headers });
    const responseModel = this.parseResponse<T>(response);

    if (responseModel.status !== ResponseStatus.OK || responseModel.error) {
      logger.error(`Error response from POST ${url}: ${JSON.stringify(responseModel.error)}`);
      throw new X10Error(`Error response from POST ${url}: ${JSON.stringify(responseModel.error)}`);
    }

    return responseModel;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: {
      apiKey?: string;
      headers?: Record<string, string>;
    }
  ): Promise<WrappedApiResponse<T>> {
    const headers = this.getHeaders(config?.apiKey, config?.headers);
    logger.debug(`Sending PATCH ${url}, headers=${JSON.stringify(headers)}, data=${JSON.stringify(data)}`);

    const response = await this.client.patch(url, data, { headers });
    
    if (response.data === '') {
      logger.error(`Empty HTTP ${response.status} response from PATCH ${url}`);
      response.data = { status: 'OK' };
    }

    return this.parseResponse<T>(response);
  }

  async delete<T>(
    url: string,
    config?: {
      apiKey?: string;
      headers?: Record<string, string>;
    }
  ): Promise<WrappedApiResponse<T>> {
    const headers = this.getHeaders(config?.apiKey, config?.headers);
    logger.debug(`Sending DELETE ${url}, headers=${JSON.stringify(headers)}`);

    const response = await this.client.delete(url, { headers });
    return this.parseResponse<T>(response);
  }
}

export function buildUrl(
  template: string,
  pathParams?: Record<string, string | number>,
  queryParams?: Record<string, string | string[] | number | boolean>
): string {
  let url = template;

  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      const placeholder = `<${key}>`;
      const optionalPlaceholder = `<${key}?>`;
      
      if (url.includes(optionalPlaceholder)) {
        url = url.replace(optionalPlaceholder, value ? String(value) : '');
      } else if (url.includes(placeholder)) {
        url = url.replace(placeholder, String(value));
      }
    }
  }

  url = url.replace(/\/+$/, '');

  if (queryParams) {
    const queryParts: string[] = [];
    
    for (const [key, value] of Object.entries(queryParams)) {
      if (value === undefined || value === null) continue;
      
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            queryParts.push(`${key}=${encodeURIComponent(String(item))}`);
          }
        }
      } else {
        queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    
    if (queryParts.length > 0) {
      url += '?' + queryParts.join('&');
    }
  }

  return url;
}