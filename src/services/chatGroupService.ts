import { supabase } from '@/lib/supabaseClient';
import type { PaginatedResult } from '@/types/chat';
import type {
  GroupConversation,
  GroupParticipant,
  GroupMessage,
  GroupMessageAttachment,
} from '@/types/chatGroup';

const GROUP_CONVERSATIONS_TABLE = 'group_conversations';
const GROUP_PARTICIPANTS_TABLE = 'group_participants';
const GROUP_MESSAGES_TABLE = 'group_messages';
const GROUP_ATTACHMENTS_TABLE = 'group_message_attachments';
const ATTACHMENTS_BUCKET = 'chat-attachments'; // reuse existing bucket

export class ChatGroupService {
  // Create a new group with initial participants. The creator will be set as owner if included.
  static async createGroup(
    title: string,
    creatorId: string,
    participantIds: string[]
  ): Promise<{ conversation: GroupConversation; participants: GroupParticipant[] }> {
    // 1) Create group row
    const { data: group, error: gErr } = await supabase
      .from(GROUP_CONVERSATIONS_TABLE)
      .insert({ title })
      .select('*')
      .single();
    if (gErr) throw new Error(`Failed to create group: ${gErr.message}`);

    const groupId = group.id as string;

    // 2) Insert creator as owner first (ensures admin rights for subsequent inserts under RLS)
    const { error: ownerErr } = await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .insert({ group_id: groupId, user_id: creatorId, role: 'owner' }, { returning: 'minimal' } as any);
    if (ownerErr && !/duplicate key/i.test(ownerErr.message)) {
      throw new Error(`Failed to add group owner: ${ownerErr.message}`);
    }

    // 3) Insert remaining participants (deduped, exclude creator)
    const remaining = Array.from(new Set(participantIds.filter((id) => id !== creatorId)));
    if (remaining.length > 0) {
      const rows = remaining.map((uid) => ({ group_id: groupId, user_id: uid, role: 'member' as const }));
      const { error: membersErr } = await supabase
        .from(GROUP_PARTICIPANTS_TABLE)
        .insert(rows, { returning: 'minimal' } as any);
      if (membersErr) throw new Error(`Failed to add participants: ${membersErr.message}`);
    }

    // Fetch participants after insert
    const { data: participants2, error: sErr } = await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .select('*')
      .eq('group_id', groupId);
    if (sErr) throw new Error(`Failed to fetch participants: ${sErr.message}`);

    return { conversation: group as GroupConversation, participants: (participants2 || []) as GroupParticipant[] };
  }

  // List groups a user belongs to, newest activity first
  static async listGroupsForUser(
    userId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<GroupConversation>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // First get group IDs where user is a participant
    const { data: participantData, error: participantError } = await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .select('group_id')
      .eq('user_id', userId);

    if (participantError) {
      // If table doesn't exist yet, return empty result
      if (participantError.message.includes('does not exist') || participantError.code === '42P01') {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
        };
      }
      throw new Error(`Failed to get participant groups: ${participantError.message}`);
    }

    const groupIds = participantData?.map((r: any) => r.group_id) || [];
    
    if (groupIds.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
      };
    }

    // Then get the actual group conversations
    const { data, error, count } = await supabase
      .from(GROUP_CONVERSATIONS_TABLE)
      .select('*', { count: 'exact' })
      .in('id', groupIds)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) throw new Error(`Failed to list groups: ${error.message}`);

    return {
      data: (data || []) as GroupConversation[],
      total: count || 0,
      page,
      pageSize,
    };
  }

  // Fetch messages in a group (ascending by time) and join attachments client-side
  static async fetchGroupMessages(
    groupId: string,
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResult<GroupMessage>> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .select('*', { count: 'exact' })
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw new Error(`Failed to fetch group messages: ${error.message}`);

    const messages = (data || []) as GroupMessage[];

    if (messages.length > 0) {
      const ids = messages.map((m) => m.id);
      const { data: atts, error: aErr } = await supabase
        .from(GROUP_ATTACHMENTS_TABLE)
        .select('*')
        .in('message_id', ids);
      if (!aErr && atts) {
        const byMsg: Record<string, GroupMessageAttachment[]> = {};
        for (const a of atts as GroupMessageAttachment[]) {
          if (!byMsg[a.message_id]) byMsg[a.message_id] = [];
          byMsg[a.message_id].push(a);
        }
        for (const m of messages) m.attachments = byMsg[m.id] || [];
      }
    }

    return { data: messages, total: count || 0, page, pageSize };
  }

  // Send a text-only message to a group
  static async sendGroupMessage(
    groupId: string,
    senderId: string,
    content: string | null
  ): Promise<GroupMessage> {
    const { data, error } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .insert({ group_id: groupId, sender_id: senderId, content })
      .select('*')
      .single();
    if (error) throw new Error(`Failed to send group message: ${error.message}`);

    // Best-effort: update last_message_at (RLS may block; ignore error)
    await supabase
      .from(GROUP_CONVERSATIONS_TABLE)
      .update({ last_message_at: (data as any).created_at })
      .eq('id', groupId);

    return data as GroupMessage;
  }

  // Upload multiple attachments, then return the full message with attachments
  static async sendGroupMessageWithAttachments(
    groupId: string,
    senderId: string,
    files: File[],
    content?: string | null
  ): Promise<GroupMessage> {
    // 1) Create message first (like direct messages)
    const { data: msg, error: mErr } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .insert({ group_id: groupId, sender_id: senderId, content: content ?? '' })
      .select('*')
      .single();
    if (mErr) throw new Error(`Failed to send group message: ${mErr.message}`);

    // 2) Upload files + create attachment rows
    const atts: GroupMessageAttachment[] = [];
    try {
      for (const f of files) {
        const att = await this.uploadGroupAttachment(f, groupId, (msg as any).id);
        atts.push(att);
      }
    } catch (e) {
      // Prevent a blank message when uploads fail: delete the created message
      try {
        await supabase
          .from(GROUP_MESSAGES_TABLE)
          .delete()
          .eq('id', (msg as any).id);
      } catch {}
      throw e;
    }

    // 3) Update last_message_at (ignore errors)
    await supabase
      .from(GROUP_CONVERSATIONS_TABLE)
      .update({ last_message_at: (msg as any).created_at })
      .eq('id', groupId);

    return { ...(msg as GroupMessage), attachments: atts };
  }

  private static async uploadGroupAttachment(
    file: File,
    groupId: string,
    messageId: string
  ): Promise<GroupMessageAttachment> {
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ts = Date.now();
    // Match direct messages path scheme to avoid storage issues
    const path = `${groupId}/${messageId}/${ts}-${safe}`;

    const { error: upErr } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    const payload = {
      message_id: messageId,
      storage_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
    };

    const { data, error } = await supabase
      .from(GROUP_ATTACHMENTS_TABLE)
      .insert(payload)
      .select('*')
      .single();
    if (error) throw new Error(`Failed to create attachment row: ${error.message}`);

    return data as GroupMessageAttachment;
  }

  static async getSignedUrlForPath(storagePath: string, expiresInSeconds = 60 * 60) {
    const { data, error } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);
    if (error) throw new Error(`Failed to sign URL: ${error.message}`);
    return data.signedUrl;
  }

  // Mark group read for a user using per-message receipts or last_read_at; here we upsert receipts in bulk
  static async markGroupRead(groupId: string, userId: string): Promise<void> {
    // Fetch unread messages (not sent by the user) and upsert reads
    const { data: msgs, error } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .select('id, sender_id')
      .eq('group_id', groupId)
      .neq('sender_id', userId);
    if (error) throw new Error(`Failed to fetch messages for read: ${error.message}`);

    if (!msgs || msgs.length === 0) return;

    const reads = msgs.map((m: any) => ({ message_id: m.id, user_id: userId }));
    // Upsert via insert; RLS policy allows insert by the same user
    const { error: rErr } = await supabase.from('group_message_reads').upsert(reads, {
      onConflict: 'message_id, user_id',
      ignoreDuplicates: true,
    } as any);
    if (rErr) throw new Error(`Failed to mark group read: ${rErr.message}`);

    // Also bump last_read_at for participant (best effort)
    await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .update({ last_read_at: new Date().toISOString() })
      .eq('group_id', groupId)
      .eq('user_id', userId);
  }

  // Fetch group participants with full details (name, role, photo)
  static async getGroupParticipantsWithDetails(groupId: string): Promise<Array<{
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    full_name: string;
    photo?: string;
    profile_role: 'admin' | 'athlete' | 'high_school_athlete' | 'family_friend' | 'brand';
  }>> {
    try {
      // Get participants with roles
      const { data: participants, error: participantError } = await supabase
        .from(GROUP_PARTICIPANTS_TABLE)
        .select('user_id, role')
        .eq('group_id', groupId);

      if (participantError || !participants) {
        console.warn('Failed to fetch group participants:', participantError?.message);
        return [];
      }

      const userIds = participants.map((p: any) => p.user_id as string);
      if (userIds.length === 0) return [];

      // Get profile details
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', userIds);

      if (profileError || !profiles) {
        console.warn('Failed to fetch participant profiles:', profileError?.message);
        return [];
      }

      // Get photos for athletes
      const { data: athletes, error: athleteError } = await supabase
        .from('student_athletes')
        .select('profile_id, photo')
        .in('profile_id', userIds);

      const photoMap: Record<string, string> = {};
      if (!athleteError && athletes) {
        for (const a of athletes) {
          const url = (a as any).photo;
          if (url && String(url).trim() !== '') {
            photoMap[(a as any).profile_id] = String(url);
          }
        }
      }

      // Combine all data
      return participants.map((p: any) => {
        const profile = profiles.find((prof: any) => prof.id === p.user_id);
        return {
          user_id: p.user_id,
          role: p.role,
          full_name: profile?.full_name || 'Unknown',
          photo: photoMap[p.user_id],
          profile_role: profile?.role || 'athlete'
        };
      });
    } catch (error) {
      console.error('Failed to fetch group participants with details:', error);
      return [];
    }
  }

  // Fetch group participants with their profile photos
  static async getGroupParticipantsWithPhotos(groupId: string): Promise<Record<string, string | undefined>> {
    try {
      // First get participant user IDs
      const { data: participants, error: participantError } = await supabase
        .from(GROUP_PARTICIPANTS_TABLE)
        .select('user_id')
        .eq('group_id', groupId);

      if (participantError || !participants) {
        console.warn('Failed to fetch group participants:', participantError?.message);
        return {};
      }

      const partIds = participants.map((p: any) => p.user_id as string);

      // Also include distinct senders from messages (participants can select messages even if they can't see all participants)
      const { data: senders, error: sErr } = await supabase
        .from(GROUP_MESSAGES_TABLE)
        .select('sender_id')
        .eq('group_id', groupId)
        .not('sender_id', 'is', null);
      if (sErr) {
        console.warn('Failed to fetch message senders for avatars:', sErr.message);
      }
      const senderIds = (senders || []).map((r: any) => r.sender_id as string);

      const userIds = Array.from(new Set([...partIds, ...senderIds]));
      if (userIds.length === 0) return {};

      // Fetch photos from student_athletes and implicitly skip non-athletes (e.g., admins)
      const { data: athletes, error: athleteErr } = await supabase
        .from('student_athletes')
        .select('profile_id, photo')
        .in('profile_id', userIds);

      if (athleteErr) {
        console.warn('Failed to fetch student_athletes for avatars:', athleteErr.message);
        return {};
      }

      const photoMap: Record<string, string | undefined> = {};
      for (const a of athletes || []) {
        const url = (a as any).photo;
        if (url && String(url).trim() !== '') {
          photoMap[(a as any).profile_id] = String(url);
        }
      }

      return photoMap;
    } catch (error) {
      console.warn('Error fetching group participant photos:', error);
      return {};
    }
  }

  // Update group title (admin/owner only) and post a system message so everyone sees the change
  static async updateGroupTitle(groupId: string, newTitle: string, updaterId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(GROUP_CONVERSATIONS_TABLE)
        .update({ title: newTitle })
        .eq('id', groupId);

      if (error) {
        throw new Error(`Failed to update group title: ${error.message}`);
      }

      // Post a system message announcing the name change
      const systemText = `[system] Group chat name changed to "${newTitle}"`;
      const { data: msg, error: mErr } = await supabase
        .from(GROUP_MESSAGES_TABLE)
        .insert({ group_id: groupId, sender_id: updaterId, content: systemText })
        .select('*')
        .single();
      if (mErr) {
        // Non-fatal; log and continue
        console.warn('Failed to insert system message for title change:', mErr.message);
      } else if (msg) {
        // Best-effort bump of last_message_at so lists reorder correctly
        await supabase
          .from(GROUP_CONVERSATIONS_TABLE)
          .update({ last_message_at: (msg as any).created_at })
          .eq('id', groupId);
      }
    } catch (error) {
      console.error('Error updating group title:', error);
      throw error;
    }
  }

  // Check if current user is admin/owner of a group
  static async isGroupAdmin(groupId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(GROUP_PARTICIPANTS_TABLE)
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();
      if (error) {
        console.warn('Failed to check group admin status:', error.message);
        return false;
      }
      return data?.role === 'admin' || data?.role === 'owner';
    } catch (error) {
      console.warn('Error checking group admin status:', error);
      return false;
    }
  }

  // Remove a participant (admin/owner only). Blocks removing the last athlete when only two members (owner + athlete) remain.
  static async removeGroupParticipant(
    groupId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    // Ensure requester is admin/owner
    const isAdmin = await this.isGroupAdmin(groupId, requesterId);
    if (!isAdmin) {
      throw new Error('Only group admins can remove members');
    }

    // Load members with details to evaluate constraints
    const members = await this.getGroupParticipantsWithDetails(groupId);
    const target = members.find((m) => m.user_id === targetUserId);
    if (!target) throw new Error('Member not found');

    // Cannot remove the group owner
    if (target.role === 'owner') {
      throw new Error('Cannot remove the group owner');
    }

    // Block removing the last non-owner member when only two members remain
    if (members.length === 2) {
      throw new Error('Cannot remove the last member when only two members remain');
    }

    // Proceed with removal
    const { error: delErr } = await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId);
    if (delErr) throw new Error(`Failed to remove member: ${delErr.message}`);

    // Post a system message to notify removal (best-effort)
    try {
      const systemText = `[system] ${target.full_name || 'A member'} was removed from the group.`;
      const { data: msg } = await supabase
        .from(GROUP_MESSAGES_TABLE)
        .insert({ group_id: groupId, sender_id: requesterId, content: systemText })
        .select('*')
        .single();
      if (msg) {
        await supabase
          .from(GROUP_CONVERSATIONS_TABLE)
          .update({ last_message_at: (msg as any).created_at })
          .eq('id', groupId);
      }
    } catch {}
  }
  static subscribeToGroupMessages(
    groupId: string,
    onInsert: (message: GroupMessage) => void
  ) {
    const name = `group-messages-${groupId}`;
    // Proactively remove any existing channel with the same name (helps in React StrictMode)
    try {
      const existing = (supabase as any).getChannels?.() as any[] | undefined;
      if (existing && existing.length) {
        for (const ch of existing) {
          if ((ch as any).topic === name || (ch as any).name === name) {
            // fire-and-forget; do not return a promise from React cleanup
            void supabase.removeChannel(ch as any);
          }
        }
      }
    } catch {}

    const channel = supabase
      .channel(name)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: GROUP_MESSAGES_TABLE, filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const base = payload.new as GroupMessage;
          if (typeof window !== 'undefined') {
            try { console.debug('[GroupRealtime] INSERT group_message', { groupId, id: (base as any)?.id }); } catch {}
          }
          // Attempt to fetch attachments that may arrive shortly after message insert
          let enriched: GroupMessage = base;
          try {
            // Increase retries and delay to better capture uploads that complete seconds after message insert
            const maxTries = 10; // ~5 seconds total with 500ms delay
            for (let i = 0; i < maxTries; i++) {
              const { data: atts, error: aErr } = await supabase
                .from(GROUP_ATTACHMENTS_TABLE)
                .select('*')
                .eq('message_id', base.id);
              if (!aErr && atts && atts.length > 0) {
                enriched = { ...base, attachments: atts as GroupMessageAttachment[] };
                break;
              }
              // small delay before retry; attachments can be inserted milliseconds after message
              await new Promise((res) => setTimeout(res, 500));
            }
          } catch {
            // fall back to base message
          }
          onInsert(enriched);
        }
      )
      .subscribe();
    // Return a void cleanup function to satisfy React typings
    return () => { void supabase.removeChannel(channel); };
  }

  // Fully delete a group conversation and all associated data (admin/owner only)
  static async deleteGroupFully(groupId: string, requesterId: string): Promise<void> {
    // Ensure requester is admin/owner
    const isAdmin = await this.isGroupAdmin(groupId, requesterId);
    if (!isAdmin) {
      throw new Error('Only group admins can delete this group');
    }

    // 1) Collect all message IDs for the group
    const { data: msgs, error: mErr } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .select('id')
      .eq('group_id', groupId);
    if (mErr) throw new Error(`Failed to fetch group messages: ${mErr.message}`);
    const messageIds = (msgs || []).map((m: any) => m.id as string);

    // 2) Collect all attachment storage paths for those messages
    let attachmentPaths: string[] = [];
    if (messageIds.length > 0) {
      const { data: atts, error: aErr } = await supabase
        .from(GROUP_ATTACHMENTS_TABLE)
        .select('storage_path')
        .in('message_id', messageIds);
      if (aErr) throw new Error(`Failed to fetch attachments: ${aErr.message}`);
      attachmentPaths = (atts || []).map((a: any) => a.storage_path as string);
    }

    // 3) Delete storage files (best-effort, proceed even if some fail)
    if (attachmentPaths.length > 0) {
      try {
        // Supabase storage remove can delete multiple paths at once
        const { error: rmErr } = await supabase.storage
          .from(ATTACHMENTS_BUCKET)
          .remove(attachmentPaths);
        if (rmErr) {
          // Non-fatal: log and proceed to DB cleanup
          console.warn('Failed to delete some storage files:', rmErr.message);
        }
      } catch (e: any) {
        console.warn('Storage deletion error:', e?.message || e);
      }
    }

    // 4) Delete attachment rows
    if (messageIds.length > 0) {
      const { error: daErr } = await supabase
        .from(GROUP_ATTACHMENTS_TABLE)
        .delete()
        .in('message_id', messageIds);
      if (daErr) throw new Error(`Failed to delete attachment rows: ${daErr.message}`);
    }

    // 5) Delete read receipts
    if (messageIds.length > 0) {
      const { error: rrErr } = await supabase
        .from('group_message_reads')
        .delete()
        .in('message_id', messageIds);
      if (rrErr) throw new Error(`Failed to delete read receipts: ${rrErr.message}`);
    }

    // 6) Delete messages
    const { error: dmErr } = await supabase
      .from(GROUP_MESSAGES_TABLE)
      .delete()
      .eq('group_id', groupId);
    if (dmErr) throw new Error(`Failed to delete messages: ${dmErr.message}`);

    // 7) Delete participants
    const { error: dpErr } = await supabase
      .from(GROUP_PARTICIPANTS_TABLE)
      .delete()
      .eq('group_id', groupId);
    if (dpErr) throw new Error(`Failed to delete participants: ${dpErr.message}`);

    // 8) Delete the conversation
    const { error: dcErr } = await supabase
      .from(GROUP_CONVERSATIONS_TABLE)
      .delete()
      .eq('id', groupId);
    if (dcErr) throw new Error(`Failed to delete group: ${dcErr.message}`);
  }
}
