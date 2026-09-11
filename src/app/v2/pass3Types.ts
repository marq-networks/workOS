import type { OrganizationScope } from './types';

export interface Conversation { id:string;organizationId:string;kind:string;title:string|null;projectId:string|null;milestoneId:string|null;taskId:string|null;updatedAt:string }
export interface Message { id:string;organizationId:string;conversationId:string;authorMembershipId:string|null;body:string;kind:'user'|'system';createdAt:string;pinnedAt:string|null }
export interface FileMetadata { id:string;organizationId:string;fileName:string;mimeType:string;sizeBytes:number;projectId:string|null;taskId:string|null;messageId:string|null;createdAt:string }
export interface Evidence { id:string;organizationId:string;taskId:string;subtaskId:string|null;kind:string;status:string;summary:string|null;uri:string|null;createdAt:string }
export interface AutomationRule { id:string;organizationId:string;name:string;status:'draft'|'active'|'paused'|'archived';trigger:Record<string,unknown>;condition:Record<string,unknown>;action:Record<string,unknown>;requiresApproval:boolean;revision:number }
export interface SearchResult { entityType:string;entityId:string;title:string;subtitle:string;href:string }
export interface AgentConfig { id:string;organizationId:string;agentType:string;enabled:boolean;authority:'read'|'draft'|'execute';projectId:string|null;revision:number;lastRunAt:string|null;lastStatus:string|null;lastSummary:string|null }
export interface AiState { status:'configuration_required'|'ready'|'running'|'failed';message:string }
export interface UploadRequest { fileName:string;mimeType:string;sizeBytes:number;context:{projectId?:string;taskId?:string;messageId?:string} }
export type UploadPreparation={status:'ready';uploadUrl:string;headers:Record<string,string>;storagePath:string}|{status:'configuration_required';message:string};

export interface Pass3Repository {
 listConversations(scope:OrganizationScope):Promise<Conversation[]>;
 listMessages(scope:OrganizationScope,conversationId:string,cursor?:string,limit?:number):Promise<{items:Message[];nextCursor:string|null}>;
 createConversation(scope:OrganizationScope,input:{kind:string;title:string;participants:string[];projectId?:string;milestoneId?:string;taskId?:string;departmentId?:string}):Promise<Conversation>;
 postMessage(scope:OrganizationScope,conversationId:string,body:string,mentions?:string[]):Promise<Message>;
 setReaction(messageId:string,emoji:string,active:boolean):Promise<void>;
 setMessagePin(messageId:string,pinned:boolean):Promise<Message>;
 listFiles(scope:OrganizationScope,context:{projectId?:string;taskId?:string;messageId?:string}):Promise<FileMetadata[]>;
 archiveFile(file:FileMetadata):Promise<void>;
 prepareUpload(scope:OrganizationScope,request:UploadRequest):Promise<UploadPreparation>;
 listEvidence(scope:OrganizationScope,taskId:string):Promise<Evidence[]>;
 submitLinkEvidence(scope:OrganizationScope,input:{taskId:string;subtaskId?:string;kind:string;uri:string;summary?:string}):Promise<Evidence>;
 listAutomationRules(scope:OrganizationScope):Promise<AutomationRule[]>;
 saveAutomationRule(scope:OrganizationScope,actorId:string,input:Partial<AutomationRule>&{name:string}):Promise<AutomationRule>;
 executeAutomation(rule:AutomationRule):Promise<string>;
 search(scope:OrganizationScope,query:string,limit?:number):Promise<SearchResult[]>;
 listAgentConfigs(scope:OrganizationScope):Promise<AgentConfig[]>;
 saveAgentConfig(scope:OrganizationScope,actorId:string,input:Partial<AgentConfig>&{agentType:string}):Promise<AgentConfig>;
 getAiState(scope:OrganizationScope):Promise<AiState>;
}
