import React, { useEffect, useRef, useState } from 'react';
import type { GroupMessage, GroupMessageAttachment } from '@/types/chatGroup';
import { ChatGroupService } from '@/services/chatGroupService';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Download, Edit2, MoreVertical, Users } from 'lucide-react';
import { MessageInput } from './MessageInput';

interface GroupChatWindowProps {
  groupId: string;
  currentUserId: string;
  title?: string;
  onBack?: () => void;
  onTitleChange?: (newTitle: string) => void;
}

interface GroupSettingsProps {
  groupId: string;
  title?: string;
  currentUserId: string;
  onClose: () => void;
  onTitleUpdate: (newTitle: string) => void;
}

export const GroupChatWindow: React.FC<GroupChatWindowProps> = ({ groupId, currentUserId, title, onBack, onTitleChange }) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [avatars, setAvatars] = useState<Record<string, string | undefined>>({});
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [participantRoles, setParticipantRoles] = useState<Record<string, 'owner'|'admin'|'member'>>({});
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [localTitle, setLocalTitle] = useState<string>(title || 'Group');
  // Track received message IDs to avoid duplicate inserts from double-fired subscriptions
  const receivedIdsRef = useRef<Set<string>>(new Set());

  // Keep local title in sync if parent prop changes externally
  useEffect(() => {
    setLocalTitle(title || 'Group');
  }, [title]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await ChatGroupService.fetchGroupMessages(groupId, 1, 200);
        if (mounted) setMessages(res.data);
        // mark read best-effort
        if (mounted) ChatGroupService.markGroupRead(groupId, currentUserId).catch(() => {});
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // Realtime: listen for group title changes so all members see updates instantly
    const channel = supabase
      .channel(`group-convo-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_conversations', filter: `id=eq.${groupId}` },
        (payload: any) => {
          const updatedTitle = payload?.new?.title as string | undefined;
          if (updatedTitle && updatedTitle.trim() !== '') {
            setLocalTitle(updatedTitle);
            if (typeof onTitleChange === 'function') onTitleChange(updatedTitle);
          }
        }
      )
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [groupId, onTitleChange]);

  // Fetch initial messages
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await ChatGroupService.fetchGroupMessages(groupId, 1, 200);
        if (mounted) setMessages(res.data);
        // mark read best-effort
        if (mounted) ChatGroupService.markGroupRead(groupId, currentUserId).catch(() => {});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [groupId, currentUserId]);

  // Separate realtime subscription for new messages
  useEffect(() => {
    // Reset dedup set on group change
    receivedIdsRef.current = new Set();
    const unsubscribe = ChatGroupService.subscribeToGroupMessages(groupId, (newMessage) => {
      const id = newMessage.id;
      if (!id) return;
      if (receivedIdsRef.current.has(id)) return;
      receivedIdsRef.current.add(id);
      setMessages((prevMessages) => {
        // Avoid duplicates - check if message already exists
        const exists = prevMessages.find((msg) => msg.id === newMessage.id);
        return exists ? prevMessages : [...prevMessages, newMessage];
      });
    });
    return unsubscribe;
  }, [groupId]);

  // Realtime: watch profiles updates and refresh avatar for participants
  useEffect(() => {
    if (!participantIds.length) return;
    const channel = supabase.channel(`grp-${groupId}-profiles`);
    const handler = (payload: any) => {
      const id = payload?.new?.id || payload?.old?.id;
      if (!id || !participantIds.includes(id)) return;
      const url = payload?.new?.avatar_url || payload?.new?.photo || '';
      setAvatars((prev) => ({ ...prev, [id]: url && String(url).trim() !== '' ? String(url) : prev[id] }));
    };
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, handler);
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, handler);
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, participantIds.join(',')]);

  // Load group participants and resolve avatar URLs once per group
  useEffect(() => {
    let active = true;
    const loadAvatars = async () => {
      try {
        // Use the new service method to get all participant photos
        const photoMap = await ChatGroupService.getGroupParticipantsWithPhotos(groupId);
        
        // Get participant IDs for realtime subscriptions
        const { data: parts, error: pErr } = await supabase
          .from('group_participants')
          .select('user_id')
          .eq('group_id', groupId);
        
        if (!pErr && parts) {
          const userIds = Array.from(new Set(parts.map((r: any) => r.user_id as string)));
          if (active) setParticipantIds(userIds);
        }
        
        // Merge instead of replace to avoid clearing already-known avatars
        if (active) setAvatars((prev) => ({ ...prev, ...photoMap }));
      } catch (e) {
        console.warn('Failed to load group participant avatars:', e);
      }
    };
    loadAvatars();
    return () => { active = false; };
  }, [groupId, currentUserId]);

  // Load participant roles and display names for sender labels
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: parts, error } = await supabase
          .from('group_participants')
          .select('user_id, role')
          .eq('group_id', groupId);
        if (error || !parts) {
          if (!cancelled) {
            setParticipantRoles({});
            setDisplayNames({});
          }
          return;
        }

        const rolesMap: Record<string, 'owner'|'admin'|'member'> = {};
        const ids: string[] = [];
        for (const row of parts as any[]) {
          const uid = String(row.user_id);
          const role = (row.role as 'owner'|'admin'|'member') || 'member';
          rolesMap[uid] = role;
          ids.push(uid);
        }
        if (!cancelled) setParticipantRoles(rolesMap);

        if (ids.length === 0) {
          if (!cancelled) setDisplayNames({});
          return;
        }

        const { data: profs, error: pErr } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        if (pErr || !profs) {
          if (!cancelled) setDisplayNames({});
          return;
        }
        const nameMap: Record<string, string> = {};
        for (const p of profs as any[]) {
          const nm = (p.full_name as string) || '';
          nameMap[String(p.id)] = nm;
        }
        if (!cancelled) setDisplayNames(nameMap);
      } catch (e) {
        if (!cancelled) {
          setParticipantRoles({});
          setDisplayNames({});
        }
      }
    })();
    return () => { cancelled = true; };
  }, [groupId]);

  const onSendText = async (content: string) => {
    if (!content.trim()) return;
    setSending(true);
    try {
      await ChatGroupService.sendGroupMessage(groupId, currentUserId, content);
      // Don't add to state here - let realtime subscription handle it to avoid duplicates
    } finally {
      setSending(false);
    }
  };

  const onSendWithAttachments = async (content: string, files: File[]) => {
    if (!files.length && !content.trim()) return;
    setSending(true);
    try {
      await ChatGroupService.sendGroupMessageWithAttachments(groupId, currentUserId, files, content);
      // Don't add to state here - let realtime subscription handle it to avoid duplicates
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-md border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <button onClick={onBack} className="p-1 rounded hover:bg-gray-100" aria-label="Back to list">
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy text-white flex items-center justify-center">
            <Users className="w-4 h-4 opacity-80" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-gray-900 truncate">{localTitle || 'Group'}</div>
            <div className="text-xs text-gray-500">Group chat</div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Group settings"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
        {loading ? (
          <div className="text-gray-600">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-600">No messages yet.</div>
        ) : (
          <GroupMessageList
            messages={messages}
            currentUserId={currentUserId}
            avatars={avatars}
            names={displayNames}
            roles={participantRoles}
          />
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={onSendText} onSendWithAttachments={onSendWithAttachments} disabled={sending} />
      
      {/* Group Settings Modal */}
      {showSettings && (
        <GroupSettings
          groupId={groupId}
          title={localTitle}
          currentUserId={currentUserId}
          onClose={() => setShowSettings(false)}
          onTitleUpdate={(newTitle) => {
            setLocalTitle(newTitle);
            if (typeof onTitleChange === 'function') onTitleChange(newTitle);
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
};

// Small helper to render an avatar with image fallback (matches 1-on-1 chat style)
const AvatarBubble: React.FC<{ src?: string }> = ({ src }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-nil-light-blue to-nil-navy">
        <Users className="w-4 h-4 text-white opacity-80" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt="avatar"
      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      onError={() => setErrored(true)}
    />
  );
};

const GroupMessageList: React.FC<{ messages: GroupMessage[]; currentUserId: string; avatars?: Record<string, string | undefined>; names?: Record<string, string>; roles?: Record<string, 'owner'|'admin'|'member'> }>
= ({ messages, currentUserId, avatars, names, roles }) => {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  return (
    <div>
      {messages.map((msg, idx) => {
        const isMine = msg.sender_id === currentUserId;
        const created = new Date(msg.created_at);
        const images = (msg.attachments || []).filter((a) => a.mime_type?.startsWith('image/'));
        const others = (msg.attachments || []).filter((a) => !a.mime_type?.startsWith('image/'));
        const prev = idx > 0 ? messages[idx - 1] : undefined;
        const showAvatar = !isMine && (!prev || prev.sender_id !== msg.sender_id);
        const newCluster = !prev || prev.sender_id !== msg.sender_id;
        const isSystem = !!msg.content && msg.content.startsWith('[system]');
        const systemText = isSystem ? msg.content!.replace(/^\[system\]\s*/, '') : '';

        if (isSystem) {
          return (
            <div className="w-full flex justify-center my-3" key={msg.id}>
              <div
                className="text-xs px-3 py-1.5 rounded-full bg-white text-gray-600 shadow-sm border border-gray-200 font-medium"
                title={created.toLocaleString()}
                aria-label={`System update at ${created.toISOString()}`}
              >
                {systemText}
              </div>
            </div>
          );
        }

        const role = roles?.[msg.sender_id];
        const nameLabel = role === 'admin' || role === 'owner' ? 'Admin' : (names?.[msg.sender_id] || '');

        return (
          <div className="contents" key={msg.id}>
            {/* name label at the start of a cluster */}
            {newCluster && !isSystem && nameLabel && (
              <div className={`text-[11px] text-gray-600 mb-1 ${isMine ? 'text-right pr-10' : 'pl-10'}`}>{nameLabel}</div>
            )}
            {/* message bubble */}
            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
              <div className={`${
                isMine ? 'max-w-[75%] flex flex-row-reverse items-end gap-2' : 'max-w-[75%] flex flex-row items-end gap-2'
              }`}>
                {!isMine && (
                  showAvatar ? (
                    <AvatarBubble src={avatars?.[msg.sender_id]} />
                  ) : (
                    <div className="w-8 h-8 flex-shrink-0" />
                  )
                )}
              <div className={`${isMine ? 'bg-nil-orange text-white rounded-2xl rounded-br-md' : 'bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-200'} px-4 py-2.5 text-sm shadow-sm`}
                   title={created.toLocaleString()} aria-label={`Sent at ${created.toISOString()}`}>
                {msg.content?.trim() ? (
                  <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                ) : null}
                {images.length > 0 || others.length > 0 ? (
                  <div className={`${msg.content?.trim() ? 'mt-2' : ''}`}>
                    <GroupAttachmentGallery images={images} others={others} />
                  </div>
                ) : null}
                <div className={`mt-1.5 text-[10px] opacity-75 ${isMine ? 'text-white/90' : 'text-gray-500'}`}>
                  {created.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

const GroupAttachmentGallery: React.FC<{ images: GroupMessageAttachment[]; others: GroupMessageAttachment[] }> = ({ images, others }) => {
  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className={`grid ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
          {images.map((att) => (
            <GroupAttachmentPreview key={att.id} attachment={att} isImage />
          ))}
        </div>
      )}
      {others.length > 0 && (
        <div className="flex flex-col gap-2">
          {others.map((att) => (
            <GroupAttachmentPreview key={att.id} attachment={att} />
          ))}
        </div>
      )}
    </div>
  );
};

const GroupAttachmentPreview: React.FC<{ attachment: GroupMessageAttachment; isImage?: boolean }> = ({ attachment, isImage }) => {
  const [url, setUrl] = useState<string | null>(attachment.signed_url ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const signed = await ChatGroupService.getSignedUrlForPath(attachment.storage_path);
        if (mounted) setUrl(signed);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load file');
      }
    })();
    return () => { mounted = false; };
  }, [attachment.storage_path]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let signed = url;
      if (!signed) {
        signed = await ChatGroupService.getSignedUrlForPath(attachment.storage_path);
        setUrl(signed);
      }
      if (!signed) return;
      const response = await fetch(signed);
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = attachment.file_name || 'download';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to download');
    }
  };

  if (isImage) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
        {url ? (
          <>
            <img src={url} alt={attachment.file_name || ''} className="w-full h-40 object-cover" />
            <button
              onClick={handleDownload}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200"
              title={`Download ${attachment.file_name}`}
              aria-label={`Download ${attachment.file_name}`}
            >
              <Download className="w-4 h-4 text-gray-700" />
            </button>
          </>
        ) : (
          <div className="w-full h-40 flex items-center justify-center text-xs text-gray-500">
            {error ? 'Preview unavailable' : 'Loading image...'}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={url ?? undefined}
      onClick={handleDownload}
      download={attachment.file_name || undefined}
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-xs hover:bg-gray-50"
      title={attachment.file_name || ''}
      aria-label={`Download ${attachment.file_name}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-400" aria-hidden></span>
        <span className="truncate max-w-[200px]">{attachment.file_name}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
        <span>{attachment.file_size ? (attachment.file_size/1024/1024).toFixed(1) + 'MB' : ''}</span>
        <Download className="w-3.5 h-3.5" />
      </div>
    </a>
  );
};

// Group Settings Modal Component
const GroupSettings: React.FC<GroupSettingsProps> = ({ groupId, title, currentUserId, onClose, onTitleUpdate }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(title || '');
  const [saving, setSaving] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  // Check if current user is admin/owner
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await ChatGroupService.isGroupAdmin(groupId, currentUserId);
        setIsAdmin(adminStatus);
      } catch (error) {
        console.warn('Failed to check admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoadingAdmin(false);
      }
    };
    checkAdminStatus();
  }, [groupId, currentUserId]);

  const handleSaveTitle = async () => {
    if (!newTitle.trim() || newTitle === title) {
      setIsEditingTitle(false);
      setNewTitle(title || '');
      return;
    }

    setSaving(true);
    try {
      await ChatGroupService.updateGroupTitle(groupId, newTitle.trim(), currentUserId);
      onTitleUpdate(newTitle.trim());
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update group title:', error);
      alert('Failed to update group name. Please try again.');
      setNewTitle(title || '');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTitle(false);
    setNewTitle(title || '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Group Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close settings"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Group Information</h3>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm text-gray-600">Group Name</label>
                  {!loadingAdmin && isAdmin && !isEditingTitle && (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 rounded hover:bg-gray-100"
                      aria-label="Edit group name"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                  )}
                </div>
                {isEditingTitle ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nil-orange focus:border-transparent"
                      placeholder="Enter group name"
                      maxLength={100}
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTitle}
                        disabled={saving || !newTitle.trim()}
                        className="px-3 py-1 bg-nil-orange text-white text-sm rounded hover:bg-nil-orange/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{title || 'Group'}</p>
                    {!loadingAdmin && !isAdmin && (
                      <span className="text-xs text-gray-500">(view only)</span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Group ID</label>
                <p className="text-xs text-gray-500 font-mono">{groupId}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Settings</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-gray-700">
                Manage Participants
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-gray-700">
                Notification Settings
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-gray-50 text-gray-700">
                Media & Files
              </button>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 text-center">
                🚧 Group settings coming soon!
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-nil-orange text-white rounded-md hover:bg-nil-orange/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatWindow;
