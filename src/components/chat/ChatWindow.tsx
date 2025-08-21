import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatService } from '@/services/chatService';
import { StudentAthleteService } from '@/services/studentAthleteService';
import type { Message } from '@/types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { ArrowLeft, MoreVertical, Phone, Video, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  title?: string;
  onBack?: () => void;
  onMessageSent?: (conversationId: string, createdAt: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  title = 'Conversation',
  onBack,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const [avatars, setAvatars] = useState<Record<string, string | undefined>>({});
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [headerImgErrored, setHeaderImgErrored] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ChatService.fetchMessages(conversationId, page, pageSize);
      setMessages(res.data);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, page]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Load conversation participants to determine avatar photos (athlete only for now)
  useEffect(() => {
    let active = true;
    const loadAvatars = async () => {
      try {
        const convo = await ChatService.getConversationById(conversationId);
        // Track both participant IDs
        if (active) {
          setAthleteId(convo?.athlete_id ?? null);
          setAdminId(convo?.admin_id ?? null);
        }
        // Load athlete avatar
        if (convo?.athlete_id) {
          const athlete = await StudentAthleteService.fetchStudentAthleteByProfileId(convo.athlete_id);
          if (!active) return;
          if (athlete?.photo && athlete.photo.trim() !== '') {
            setAvatars((prev) => ({ ...prev, [convo.athlete_id]: athlete.photo }));
          }
        }

        // Load admin avatar from profiles if available (avatar_url or photo)
        if (convo?.admin_id) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', convo.admin_id)
              .single();
            if (!error && data) {
              const adminPhoto = (data as any)?.avatar_url || (data as any)?.photo || '';
              if (adminPhoto && String(adminPhoto).trim() !== '') {
                setAvatars((prev) => ({ ...prev, [convo.admin_id]: String(adminPhoto) }));
              }
            }
          } catch {}
        }
      } catch (e) {
        // Non-fatal: avatars are optional
      }
    };
    loadAvatars();
    return () => {
      active = false;
    };
  }, [conversationId]);

  // Subscribe to live inserts
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToConversationMessages(conversationId, (msg) => {
      // Ignore echoes of our own messages to prevent duplicates
      if (msg.sender_id === currentUserId) return;
      setMessages((prev) => (prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });
    return unsubscribe;
  }, [conversationId, currentUserId]);

  // Fallback: refresh on tab focus/visibility to recover from transient realtime issues
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        loadMessages();
      }
    };
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [loadMessages]);

  // Mark as read when messages present and user opens
  useEffect(() => {
    if (!messages.length) return;
    ChatService.markConversationRead(conversationId, currentUserId).catch(() => void 0);
  }, [messages.length, conversationId, currentUserId]);

  const onSend = useCallback(
    async (content: string) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
        created_at: new Date().toISOString(),
        read_at: null,
      };
      setMessages((prev) => [...prev, optimistic]);
      try {
        const saved = await ChatService.sendMessage({ conversation_id: conversationId, sender_id: currentUserId, content });
        setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
        // Notify parent for list reordering
        onMessageSent?.(conversationId, saved.created_at);
      } catch (e) {
        // Revert optimistic
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw e;
      }
    },
    [conversationId, currentUserId]
  );

  const onSendWithAttachments = useCallback(
    async (content: string, files: File[]) => {
      const hasText = !!content?.trim();
      const hasFiles = files && files.length > 0;

      // If both text and files are present, send as two separate messages
      if (hasText && hasFiles) {
        // 1) Optimistic text-only message
        const tempTextId = `temp-text-${Date.now()}`;
        const optimisticText: Message = {
          id: tempTextId,
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: content.trim(),
          created_at: new Date().toISOString(),
          read_at: null,
          attachments: [],
        } as Message;
        setMessages((prev) => [...prev, optimisticText]);
        try {
          const savedText = await ChatService.sendMessage({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: content.trim(),
          });
          setMessages((prev) => prev.map((m) => (m.id === tempTextId ? savedText : m)));
          // Notify parent for list reordering
          onMessageSent?.(conversationId, savedText.created_at);
        } catch (e) {
          setMessages((prev) => prev.filter((m) => m.id !== tempTextId));
          throw e as any;
        }

        // 2) Optimistic attachments-only message
        const tempFilesId = `temp-files-${Date.now()}`;
        const optimisticFiles: Message = {
          id: tempFilesId,
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: '',
          created_at: new Date().toISOString(),
          read_at: null,
          attachments: [],
        } as Message;
        setMessages((prev) => [...prev, optimisticFiles]);
        try {
          const savedFiles = await ChatService.sendMessageWithAttachments({
            conversation_id: conversationId,
            sender_id: currentUserId,
            content: '',
            files,
          });
          setMessages((prev) => prev.map((m) => (m.id === tempFilesId ? savedFiles : m)));
          // Notify parent for list reordering
          onMessageSent?.(conversationId, savedFiles.created_at);
        } catch (e) {
          setMessages((prev) => prev.filter((m) => m.id !== tempFilesId));
          throw e as any;
        }
        return;
      }

      // Otherwise, keep current behavior
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content || '',
        created_at: new Date().toISOString(),
        read_at: null,
        attachments: [],
      } as Message;
      setMessages((prev) => [...prev, optimistic]);
      try {
        const saved = hasFiles
          ? await ChatService.sendMessageWithAttachments({
              conversation_id: conversationId,
              sender_id: currentUserId,
              content: content || '',
              files,
            })
          : await ChatService.sendMessage({
              conversation_id: conversationId,
              sender_id: currentUserId,
              content: content || '',
            });
        setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
        // Notify parent for list reordering
        onMessageSent?.(conversationId, saved.created_at);
      } catch (e) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw e as any;
      }
    },
    [conversationId, currentUserId]
  );

  const headerParticipantId = useMemo(() => {
    // Show the OTHER participant's avatar in the header
    if (athleteId && adminId) {
      return currentUserId === athleteId ? adminId : athleteId;
    }
    // Fallback to athlete if admin is missing
    return adminId ?? athleteId ?? null;
  }, [currentUserId, athleteId, adminId]);

  // Reset header image error when the source changes
  useEffect(() => {
    setHeaderImgErrored(false);
  }, [headerParticipantId, avatars?.[headerParticipantId || '']]);

  const header = useMemo(
    () => (
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            {(headerParticipantId && avatars[headerParticipantId] && !headerImgErrored) ? (
              <img
                src={avatars[headerParticipantId]!}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover bg-gray-100"
                onError={() => setHeaderImgErrored(true)}
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-nil-light-blue to-nil-navy">
                <User className="w-5 h-5 text-white opacity-60" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            </div>
          </div>
        </div>
      </div>
    ),
    [onBack, title, headerParticipantId, avatars]
  );

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-4xl overflow-hidden shadow-lg border-0 rounded-2xl">
      {header}
      {error && (
        <div className="p-4 text-sm text-red-600 border-b border-red-200 bg-red-50 mx-4 mt-2 rounded-lg">{error}</div>
      )}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-nil-orange rounded-full animate-spin"></div>
            <span className="text-sm">Loading messages...</span>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} currentUserId={currentUserId} avatars={avatars} />
      )}
      <MessageInput onSend={onSend} onSendWithAttachments={onSendWithAttachments} disabled={loading} />
    </Card>
  );
};

export default ChatWindow;
