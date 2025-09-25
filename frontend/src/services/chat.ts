import { request } from '@umijs/max';

// ---- Legacy (kept for compatibility, not used after integration) ----
export interface ChatSendParams {
  roleId: string;
  message: string;
  sessionId?: string;
}

export interface ChatSendResp {
  reply: string;
  sessionId: string;
}

export interface ChatRole {
  id: string;
  name: string;
}

export async function sendChat(params: ChatSendParams) {
  return request<ChatSendResp>('/api/chat', {
    method: 'POST',
    data: params,
  });
}


export async function queryChatRoleList() {
  return request<ChatRole[]>('/api/roles/all/name', {
    method: 'GET',
  });
}

// ---- New APIs aligned with backend ChatController ----
export interface ChatMessageDTO {
  user: string; // sender identifier
  content: string;
  createdAt: string; // ISO timestamp
}

export interface ChatResponseDTO {
  sessionId: string;
  conversationId: number;
  messages: ChatMessageDTO[];
}

export interface SendMessageParams {
  roleId: string; // stringified role id
  message: string;
  conversationId?: string | number;
}

export async function sendMessage(params: SendMessageParams) {
  return request<ChatResponseDTO>('/api/chat/send', {
    method: 'POST',
    data: params,
  });
}

export type ConversationListItem = Record<string, any>;

export async function listConversations(roleId: string | number) {
  return request<ConversationListItem[]>(`/api/chat/conversations/${roleId}`, {
    method: 'GET',
  });
}

export type ConversationMessagesResp = Record<string, any> & {
  messages?: ChatMessageDTO[];
};

export async function getConversationMessages(id: string | number) {
  return request<ConversationMessagesResp>(`/api/chat/conversations/${id}/messages`, {
    method: 'GET',
  });
}

export interface CreateConversationParams {
  roleId: string;
}

export async function createConversation(params: CreateConversationParams) {
  return request<ChatResponseDTO>('/api/chat/createConversation', {
    method: 'POST',
    data: params,
  });
}

// ---- Voice Chat Upload ----

export interface VoiceChatResponse {
  sessionId?: string;
  userText?: string;
  aiText?: string;
  audioUrl?: string; // AI 生成语音
}

export async function uploadVoiceChat(file: Blob, conversationId?: number, roleId?: string) {
  const form = new FormData();

  // 使用时间戳生成文件名，确保后缀 wav
  const filename = `${Date.now()}.wav`;
  form.append('file', file, filename);

  if (roleId) form.append('roleId', roleId);
  if (conversationId !== undefined && conversationId !== null) {
    form.append('conversationId', String(conversationId));
  }

  return request<VoiceChatResponse>('/api/voice/chat', {
    method: 'POST',
    data: form,
  });
}




