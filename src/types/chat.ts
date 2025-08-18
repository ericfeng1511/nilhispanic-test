// Chat-related TypeScript interfaces for conversations and messages
// These interfaces are intentionally conservative to avoid tight coupling
// with any single migration. Optional fields accommodate schema evolution.

export type UserRole = 'admin' | 'athlete';

export interface Conversation {
  id: string; // uuid
  admin_id: string; // uuid of admin profile/user
  athlete_id: string; // uuid of athlete profile/user
  created_at: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  last_message_at?: string; // ISO timestamp of most recent message
  // Optional display helpers (not stored in DB)
  admin_name?: string;
  athlete_name?: string;
}

export interface Message {
  id: string; // uuid
  conversation_id: string; // uuid
  sender_id: string; // uuid of sender (admin or athlete)
  sender_role?: UserRole; // derived client-side if not stored in DB
  content: string;
  created_at: string; // ISO timestamp
  read_at?: string | null; // ISO timestamp when read
}

export interface CreateConversationInput {
  admin_id: string;
  athlete_id: string;
}

export interface SendMessageInput {
  conversation_id: string;
  sender_id: string;
  content: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
