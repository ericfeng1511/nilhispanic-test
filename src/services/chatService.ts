import { supabase } from '@/lib/supabaseClient';
import type {
  Conversation,
  Message,
  CreateConversationInput,
  SendMessageInput,
  PaginatedResult,
  UserRole,
} from '@/types/chat';

// Table names used by Supabase
const CONVERSATIONS_TABLE = 'conversations';
const MESSAGES_TABLE = 'messages';

export class ChatService {
  // Fetch a single conversation by id
  static async getConversationById(id: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch conversation: ${error.message}`);
    return data as Conversation;
  }

  // Fetch or create a one-to-one conversation between admin and athlete
  static async getOrCreateConversation(input: CreateConversationInput): Promise<Conversation> {
    const { admin_id, athlete_id } = input;

    // First try to find existing
    const { data: existing, error: findError } = await supabase
      .from(CONVERSATIONS_TABLE)
      .select('*')
      .eq('admin_id', admin_id)
      .eq('athlete_id', athlete_id)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 = no rows, safe to ignore
      throw new Error(`Failed to lookup conversation: ${findError.message}`);
    }

    if (existing) return existing as Conversation;

    // Create new (RLS must allow only admins)
    const { data, error } = await supabase
      .from(CONVERSATIONS_TABLE)
      .insert({ admin_id, athlete_id })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create conversation: ${error.message}`);
    return data as Conversation;
  }

  // List conversations for a user, role-aware
  static async listConversationsForUser(
    userId: string,
    role: UserRole,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Conversation>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const query = supabase
      .from(CONVERSATIONS_TABLE)
      .select('*', { count: 'exact' })
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (role === 'admin') {
      query.eq('admin_id', userId);
    } else {
      query.eq('athlete_id', userId);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(`Failed to list conversations: ${error.message}`);

    return {
      data: (data || []) as Conversation[],
      total: count || 0,
      page,
      pageSize,
    };
  }

  // Fetch messages in a conversation (newest last)
  static async fetchMessages(
    conversationId: string,
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResult<Message>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(MESSAGES_TABLE)
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch messages: ${error.message}`);

    return {
      data: (data || []) as Message[],
      total: count || 0,
      page,
      pageSize,
    };
  }

  // Send a message
  static async sendMessage(input: SendMessageInput): Promise<Message> {
    const { conversation_id, sender_id, content } = input;

    const { data, error } = await supabase
      .from(MESSAGES_TABLE)
      .insert({ conversation_id, sender_id, content })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to send message: ${error.message}`);

    // Attempt to update conversation last_message_at (optional, ignore error due to RLS)
    await supabase
      .from(CONVERSATIONS_TABLE)
      .update({ last_message_at: data.created_at })
      .eq('id', conversation_id);

    return data as Message;
  }

  // Mark all messages as read for this user in a conversation (server may restrict to receiver only)
  static async markConversationRead(conversationId: string, userId: string): Promise<void> {
    // This assumes your RLS allows updating read_at for messages not sent by the current user
    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) throw new Error(`Failed to mark as read: ${error.message}`);
  }

  // Real-time subscription for new messages in a conversation
  static subscribeToConversationMessages(
    conversationId: string,
    onInsert: (message: Message) => void
  ) {
    const channel = supabase
      .channel(`messages-conv-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: MESSAGES_TABLE,
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onInsert(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Real-time subscription for new conversations for a user
  static subscribeToUserConversations(
    userId: string,
    role: UserRole,
    onInsert: (conversation: Conversation) => void
  ) {
    const filterColumn = role === 'admin' ? 'admin_id' : 'athlete_id';

    const channel = supabase
      .channel(`conversations-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: CONVERSATIONS_TABLE,
          filter: `${filterColumn}=eq.${userId}`,
        },
        (payload) => {
          onInsert(payload.new as Conversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
