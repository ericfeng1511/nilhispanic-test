// Chat-related TypeScript interfaces for conversations and messages
// These interfaces are intentionally conservative to avoid tight coupling
// with any single migration. Optional fields accommodate schema evolution.

export type UserRole = 'admin' | 'athlete' | 'high_school_athlete' | 'family_friend' | 'alumni';
export type ParticipantType = 'athlete' | 'high_school_athlete' | 'family_friend' | 'alumni';

export interface Conversation {
  id: string; // uuid
  admin_id: string; // uuid of admin profile/user
  participant_id: string; // uuid of participant profile/user (was athlete_id)
  participant_type?: ParticipantType; // discriminator; null treated as 'athlete' for legacy rows
  created_at: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  last_message_at?: string; // ISO timestamp of most recent message
  // Optional display helpers (not stored in DB)
  admin_name?: string;
  athlete_name?: string; // display name for the participant (kept generic for UI reuse)
}

export interface Message {
  id: string; // uuid
  conversation_id: string; // uuid
  sender_id: string; // uuid of sender (admin or athlete)
  sender_role?: UserRole; // derived client-side if not stored in DB
  content: string;
  created_at: string; // ISO timestamp
  read_at?: string | null; // ISO timestamp when read
  // Structured attachments (joined from `message_attachments`)
  attachments?: MessageAttachment[];
}

export interface CreateConversationInput {
  admin_id: string;
  participant_id: string;
  participant_type: ParticipantType;
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

// Structured attachment type (mirrors public.message_attachments)
export interface MessageAttachment {
  id: string; // uuid
  message_id: string; // uuid
  storage_path: string; // e.g. chat-attachments/<conversationId>/<messageId>/<filename>
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string; // ISO timestamp
  // Runtime-only helpers (not stored in DB)
  signed_url?: string; // resolved at render-time for private buckets
}

// Input for sending a message that may include multiple attachments.
export interface SendMessageWithAttachmentsInput {
  conversation_id: string;
  sender_id: string;
  content?: string; // optional caption/text
  files: File[]; // browser File objects selected by the user
}
