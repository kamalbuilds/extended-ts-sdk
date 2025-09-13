/**
 * Agent-related interfaces for the HiveMind TypeScript SDK
 * @module types/agent
 */

import { z } from 'zod';
import { AgentId, AgentType, AgentStatus, SwarmId } from './core.interfaces';

// Agent interfaces
export interface IAgent {
  id: AgentId;
  type: AgentType;
  name: string;
  capabilities: string[];
  status: AgentStatus;
  swarmId?: SwarmId;
  metadata: IAgentMetadata;
  resources: IAgentResources;
  metrics: IAgentMetrics;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface IAgentMetadata {
  version: string;
  description?: string;
  tags?: string[];
  custom?: Record<string, any>;
}

export interface IAgentResources {
  cpu: number;
  memory: number;
  gpu?: number;
  storage?: number;
}

export interface IAgentMetrics {
  tasksCompleted: number;
  tasksFailled: number;
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
}

// Agent creation and management
export interface IAgentSpawnOptions {
  type: AgentType;
  name?: string;
  capabilities?: string[];
  resources?: Partial<IAgentResources>;
  metadata?: Partial<IAgentMetadata>;
  autoStart?: boolean;
  swarmId?: SwarmId;
}

export interface IAgentUpdateOptions {
  name?: string;
  capabilities?: string[];
  metadata?: Partial<IAgentMetadata>;
  resources?: Partial<IAgentResources>;
}

export interface IAgentFilter {
  type?: AgentType;
  status?: AgentStatus;
  swarmId?: SwarmId;
  capabilities?: string[];
  tags?: string[];
}

// Agent communication
export interface IAgentMessage {
  from: AgentId;
  to: AgentId;
  type: string;
  payload: any;
  timestamp: Date;
}

export interface IAgentBroadcast {
  from: AgentId;
  type: string;
  payload: any;
  timestamp: Date;
  targetSwarm?: SwarmId;
}

// Agent lifecycle events
export interface IAgentSpawnedEvent {
  agent: IAgent;
  initiator: string;
}

export interface IAgentStatusChangedEvent {
  agentId: AgentId;
  previousStatus: AgentStatus;
  newStatus: AgentStatus;
  reason?: string;
}

export interface IAgentTerminatedEvent {
  agentId: AgentId;
  reason: string;
  graceful: boolean;
}

// Zod schemas for validation
export const AgentResourcesSchema = z.object({
  cpu: z.number().min(0).max(100),
  memory: z.number().min(0),
  gpu: z.number().min(0).optional(),
  storage: z.number().min(0).optional()
});

export const AgentMetadataSchema = z.object({
  version: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom: z.record(z.any()).optional()
});

export const AgentSpawnOptionsSchema = z.object({
  type: z.nativeEnum(AgentType),
  name: z.string().min(1).max(100).optional(),
  capabilities: z.array(z.string()).optional(),
  resources: AgentResourcesSchema.partial().optional(),
  metadata: AgentMetadataSchema.partial().optional(),
  autoStart: z.boolean().optional(),
  swarmId: z.string().optional()
});

export const AgentFilterSchema = z.object({
  type: z.nativeEnum(AgentType).optional(),
  status: z.nativeEnum(AgentStatus).optional(),
  swarmId: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

// Agent capability definitions
export const AGENT_CAPABILITIES = {
  [AgentType.RESEARCHER]: [
    'web-search',
    'data-analysis',
    'pattern-recognition',
    'information-synthesis'
  ],
  [AgentType.CODER]: [
    'code-generation',
    'code-review',
    'refactoring',
    'testing',
    'debugging'
  ],
  [AgentType.ANALYST]: [
    'data-processing',
    'statistical-analysis',
    'visualization',
    'reporting'
  ],
  [AgentType.OPTIMIZER]: [
    'performance-analysis',
    'resource-optimization',
    'cost-reduction',
    'efficiency-improvement'
  ],
  [AgentType.COORDINATOR]: [
    'task-distribution',
    'resource-allocation',
    'workflow-management',
    'conflict-resolution'
  ],
  [AgentType.TESTER]: [
    'unit-testing',
    'integration-testing',
    'performance-testing',
    'security-testing'
  ],
  [AgentType.REVIEWER]: [
    'code-review',
    'quality-assurance',
    'best-practices',
    'documentation-review'
  ]
} as const;

// Agent service interface
export interface IAgentService {
  spawn(options: IAgentSpawnOptions): Promise<IAgent>;
  get(id: AgentId): Promise<IAgent>;
  list(filter?: IAgentFilter): Promise<IAgent[]>;
  update(id: AgentId, options: IAgentUpdateOptions): Promise<IAgent>;
  terminate(id: AgentId, reason?: string): Promise<void>;
  sendMessage(message: IAgentMessage): Promise<void>;
  broadcast(broadcast: IAgentBroadcast): Promise<void>;
}

// Agent repository interface
export interface IAgentRepository {
  find(id: AgentId): Promise<IAgent | undefined>;
  findAll(filter?: IAgentFilter): Promise<IAgent[]>;
  create(agent: Omit<IAgent, 'id'>): Promise<IAgent>;
  update(id: AgentId, updates: Partial<IAgent>): Promise<IAgent>;
  delete(id: AgentId): Promise<void>;
  exists(id: AgentId): Promise<boolean>;
}

// Type predicates
export function isAgentSpawnedEvent(event: any): event is IAgentSpawnedEvent {
  return event?.agent && event?.initiator;
}

export function isAgentStatusChangedEvent(event: any): event is IAgentStatusChangedEvent {
  return event?.agentId && event?.previousStatus && event?.newStatus;
}

export function isAgentTerminatedEvent(event: any): event is IAgentTerminatedEvent {
  return event?.agentId && event?.reason !== undefined && typeof event?.graceful === 'boolean';
}