import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import type { UserRole } from '@/types/chat';

/**
 * useUnreadMessages
 * - Provides a real-time unread message count for the current user
 * - Uses Supabase realtime to increment/decrement on inserts/updates
 */
export function useUnreadMessages() {
  const { user, profile } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const unsubscribeRef = useRef<null | (() => void)>(null);

  const role = useMemo<UserRole | null>(() => {
    if (!profile) return null;
    const participantRoles: UserRole[] = ['athlete', 'high_school_athlete', 'family_friend'];
    if (profile.role === 'admin') return 'admin';
    if (participantRoles.includes(profile.role as UserRole)) return profile.role as UserRole;
    return null;
  }, [profile]);

  // Load initial count and subscribe
  useEffect(() => {
    let active = true;

    const setup = async () => {
      if (!user || !role) {
        // Clear when logged out or unsupported role
        setCount(0);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        return;
      }

      setLoading(true);
      try {
        // 1) Initial count
        const initial = await ChatService.getUnreadCountForUser(user.id, role);
        if (!active) return;
        setCount(initial);

        // 2) Conversation IDs to subscribe for deltas
        const convoIds = await ChatService.listConversationIdsForUser(user.id, role);
        if (!active) return;

        // 3) Subscribe to deltas
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (convoIds.length > 0) {
          unsubscribeRef.current = ChatService.subscribeToUnreadForUser(user.id, convoIds, (delta) => {
            // Guard against negative counts
            setCount((prev) => Math.max(0, prev + delta));
          });
        }
      } catch (e) {
        // Non-fatal: keep count as-is
        console.warn('Unread setup failed:', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    setup();

    // Refresh on visibility to recover missed events
    const onVisible = () => {
      if (document.visibilityState === 'visible') setup();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      active = false;
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, role]);

  return { count, loading };
}
