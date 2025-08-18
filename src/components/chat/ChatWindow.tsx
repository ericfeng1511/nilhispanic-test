import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatService } from '@/services/chatService';
import type { Message } from '@/types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  title?: string;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  title = 'Conversation',
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 100;

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
      } catch (e) {
        // Revert optimistic
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        throw e;
      }
    },
    [conversationId, currentUserId]
  );

  const header = useMemo(
    () => (
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              Back
            </Button>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="text-xs text-slate-500">{messages.length} messages</div>
      </div>
    ),
    [messages.length, onBack, title]
  );

  return (
    <Card className="flex flex-col h-[540px] w-full max-w-3xl overflow-hidden">
      {header}
      {error && (
        <div className="p-4 text-sm text-red-600 border-b border-red-200 bg-red-50">{error}</div>
      )}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">Loading messages...</div>
      ) : (
        <MessageList messages={messages} currentUserId={currentUserId} />
      )}
      <MessageInput onSend={onSend} disabled={loading} />
    </Card>
  );
};

export default ChatWindow;
