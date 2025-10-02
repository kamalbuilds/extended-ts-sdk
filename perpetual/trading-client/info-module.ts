import { BaseModule } from './base-module';
import { WrappedApiResponse } from '../../utils/http';

export interface SystemStatusModel {
  status: string;
  message?: string;
  timestamp: number;
}

export interface ServerTimeModel {
  timestamp: number;
  iso: string;
}

export class InfoModule extends BaseModule {
  async getSystemStatus(): Promise<WrappedApiResponse<SystemStatusModel>> {
    const url = this.buildUrl('/info/status');
    return await this.httpClient.get<SystemStatusModel>(url);
  }

  async getServerTime(): Promise<WrappedApiResponse<ServerTimeModel>> {
    const url = this.buildUrl('/info/time');
    return await this.httpClient.get<ServerTimeModel>(url);
  }

  async ping(): Promise<WrappedApiResponse<{ message: string }>> {
    const url = this.buildUrl('/info/ping');
    return await this.httpClient.get<{ message: string }>(url);
  }
}