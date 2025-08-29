import React from 'react';
import type { GroupConversation } from '@/types/chatGroup';
import { Users } from 'lucide-react';

interface GroupChatListProps {
  groups: GroupConversation[];
  lastReadMap?: Record<string, string | null | undefined>; // group_id -> last_read_at
  onOpen: (group: GroupConversation) => void;
  loading?: boolean;
}

export const GroupChatList: React.FC<GroupChatListProps> = ({ groups, lastReadMap = {}, onOpen, loading }) => {
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
        const hasUnread = !!lastTs && !!lr && new Date(lastTs).getTime() > new Date(lr).getTime();
        return (
          <button
            key={g.id}
            onClick={() => onOpen(g)}
            className="w-full text-left p-3 hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy text-white">
                  <Users className="w-5 h-5 opacity-80" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{g.title || 'Group'}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">Tap to open group chat</div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <div className="text-xs text-gray-500">{new Date(lastTs).toLocaleString()}</div>
                {hasUnread ? (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                    New
                  </span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default GroupChatList;
