// Group chat TypeScript interfaces (parallel to 1-1 chat types)
// Designed to align with SQL tables created in add_group_chat.sql

export interface GroupConversation {
  id: string; // uuid
  title: string;
  created_by: string | null; // uuid of creator (profile id) or null
  created_at: string; // ISO timestamp
  last_message_at?: string | null; // ISO timestamp
  // Optional display helpers
  participants?: GroupParticipant[];
}

export type GroupParticipantRole = 'owner' | 'admin' | 'member';

export interface GroupParticipant {
  id: string; // uuid
  group_id: string; // uuid
  user_id: string; // uuid of profile/user
  role: GroupParticipantRole;
  joined_at: string; // ISO timestamp
  last_read_at?: string | null; // ISO timestamp
  // Optional display helpers
  name?: string;
  photo?: string;
}

export interface GroupMessage {
  id: string; // uuid
  group_id: string; // uuid
  sender_id: string; // uuid
  content: string | null; // text content (nullable)
  created_at: string; // ISO timestamp
  // Attachments loaded separately
  attachments?: GroupMessageAttachment[];
}

export interface GroupMessageAttachment {
  id: string; // uuid
  message_id: string; // uuid
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string; // ISO timestamp
  // Runtime-only helpers
  signed_url?: string;
}
