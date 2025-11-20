import React, { useState } from 'react';
import type { GroupConversation } from '@/types/chatGroup';
import { Users, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChatGroupService } from '@/services/chatGroupService';

interface GroupChatListProps {
  groups: GroupConversation[];
  lastReadMap?: Record<string, string | null | undefined>; // group_id -> last_read_at
  onOpen: (group: GroupConversation) => void;
  loading?: boolean;
  // Admin-only delete controls
  isAdmin?: boolean;
  currentUserId?: string; // required if isAdmin
  onDeleted?: (groupId: string) => void;
}

export const GroupChatList: React.FC<GroupChatListProps> = ({ groups, lastReadMap = {}, onOpen, loading, isAdmin = false, currentUserId, onDeleted }) => {
  // Local UI override: groups marked as unread from the menu
  const [forceUnread, setForceUnread] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-5 h-5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading groups...</span>
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return <div className="text-gray-600">No groups yet.</div>;
  }

  return (
    <div className="divide-y rounded-md border">
      {groups.map((g) => {
        const lastTs = g.last_message_at || g.created_at;
        const lr = lastReadMap[g.id];
        const hasUnread = forceUnread.has(g.id) || (!!lastTs && !!lr && new Date(lastTs).getTime() > new Date(lr).getTime());
        return (
          <button
            key={g.id}
            onClick={() => onOpen(g)}
            className="w-full text-left p-3 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          (e.currentTarget as HTMLDivElement).click();
                        }
                      }}
                      className="p-1 rounded hover:bg-gray-100 focus:outline-none"
                      aria-label="Group options"
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setForceUnread((prev) => {
                          const next = new Set(prev);
                          next.add(g.id);
                          return next;
                        });
                      }}
                    >
                      Mark as Unread
                    </DropdownMenuItem>
                    {isAdmin ? (
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-700"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setPendingDeleteId(g.id);
                          setConfirmOpen(true);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
                {hasUnread ? (
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0"
                    aria-label="Unread messages"
                    title="Unread messages"
                  />
                ) : null}
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy text-white">
                  <Users className="w-5 h-5 opacity-80" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{g.title || 'Group'}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">Tap to open group chat</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 ml-3 flex-shrink-0">{new Date(lastTs).toLocaleString()}</div>
            </div>
          </button>
        );
      })}
      {/* Confirm Delete Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the entire group chat, including all messages and attachments, for all members. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
              onClick={async () => {
                if (!pendingDeleteId || !currentUserId) { setConfirmOpen(false); return; }
                try {
                  setDeleting(true);
                  await ChatGroupService.deleteGroupFully(pendingDeleteId, currentUserId);
                  setConfirmOpen(false);
                  setPendingDeleteId(null);
                  if (onDeleted) onDeleted(pendingDeleteId);
                } catch (e: any) {
                  // Minimal UX: close dialog; admin will see it disappear after refresh if deletion partially applied
                  setConfirmOpen(false);
                  setPendingDeleteId(null);
                  // Optionally, could integrate toast here if available in parent
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupChatList;
