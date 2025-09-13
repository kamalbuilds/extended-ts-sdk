/**
 * Core interfaces for the HiveMind TypeScript SDK
 * @module types/core
 */

import { z } from 'zod';

// Branded types for type safety
export type AgentId = string & { __brand: 'AgentId' };
export type SwarmId = string & { __brand: 'SwarmId' };
export type TaskId = string & { __brand: 'TaskId' };
export type UserId = string & { __brand: 'UserId' };

// Enums
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum AgentType {
  RESEARCHER = 'researcher',
  CODER = 'coder',
  ANALYST = 'analyst',
  OPTIMIZER = 'optimizer',
  COORDINATOR = 'coordinator',
  TESTER = 'tester',
  REVIEWER = 'reviewer'
}

export enum AgentStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  OFFLINE = 'offline',
  ERROR = 'error'
}

export enum SwarmTopology {
  HIERARCHICAL = 'hierarchical',
  MESH = 'mesh',
  RING = 'ring',
  STAR = 'star'
}

export enum SwarmStrategy {
  BALANCED = 'balanced',
  SPECIALIZED = 'specialized',
  ADAPTIVE = 'adaptive'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Core configuration interfaces
export interface IHiveMindConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryConfig?: IRetryConfig;
  webSocketConfig?: IWebSocketConfig;
  blockchainConfig?: IBlockchainConfig;
  logLevel?: LogLevel;
}

export interface IRetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number;
}

export interface IWebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  protocols?: string[];
}

export interface IBlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contractAddresses?: Record<string, string>;
  privateKey?: string;
}

// Zod schemas for runtime validation
export const RetryConfigSchema = z.object({
  maxRetries: z.number().min(0).max(10),
  initialDelay: z.number().min(100).max(10000),
  maxDelay: z.number().min(1000).max(60000),
  factor: z.number().min(1).max(5)
});

export const WebSocketConfigSchema = z.object({
  url: z.string().url().startsWith('wss://'),
  reconnectInterval: z.number().min(1000).optional(),
  maxReconnectAttempts: z.number().min(1).optional(),
  heartbeatInterval: z.number().min(5000).optional(),
  protocols: z.array(z.string()).optional()
});

export const BlockchainConfigSchema = z.object({
  rpcUrl: z.string().url(),
  chainId: z.number().positive(),
  contractAddresses: z.record(z.string()).optional(),
  privateKey: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional()
});

export const HiveMindConfigSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  timeout: z.number().positive().optional(),
  retryConfig: RetryConfigSchema.optional(),
  webSocketConfig: WebSocketConfigSchema.optional(),
  blockchainConfig: BlockchainConfigSchema.optional(),
  logLevel: z.nativeEnum(LogLevel).optional()
});

// Base response interface
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: IApiError;
  metadata?: IResponseMetadata;
}

export interface IApiError {
  code: string;
  message: string;
  details?: any;
}

export interface IResponseMetadata {
  timestamp: Date;
  requestId: string;
  version: string;
}

// Pagination interfaces
export interface IPaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Event interfaces
export interface IEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface IEventHandler<T = any> {
  handle(event: IEvent<T>): void | Promise<void>;
}

// Error types
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AGENT_ERROR = 'AGENT_ERROR',
  SWARM_ERROR = 'SWARM_ERROR',
  TASK_ERROR = 'TASK_ERROR',
  MEMORY_ERROR = 'MEMORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface IHiveMindError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

// Type guards
export function isAgentId(value: string): value is AgentId {
  return typeof value === 'string' && value.startsWith('agent_');
}

export function isSwarmId(value: string): value is SwarmId {
  return typeof value === 'string' && value.startsWith('swarm_');
}

export function isTaskId(value: string): value is TaskId {
  return typeof value === 'string' && value.startsWith('task_');
}

export function isUserId(value: string): value is UserId {
  return typeof value === 'string' && value.startsWith('user_');
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

// Builder pattern interface
export interface IBuilder<T> {
  build(): T;
}

// Repository pattern interface
export interface IRepository<T, ID> {
  find(id: ID): AsyncResult<Optional<T>>;
  findAll(filter?: any): AsyncResult<T[]>;
  create(data: Omit<T, 'id'>): AsyncResult<T>;
  update(id: ID, data: Partial<T>): AsyncResult<T>;
  delete(id: ID): AsyncResult<void>;
}