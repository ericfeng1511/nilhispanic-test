import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentAthletes } from '@/hooks/useStudentAthletes';
import { useSchoolContacts } from '@/hooks/useSchoolContacts';
import { useColleges } from '@/hooks/useColleges';
import { useHighSchoolAthletes } from '@/hooks/useHighSchoolAthletes';
import { useFamilyFriends } from '@/hooks/useFamilyFriends';
import { StudentAthlete } from '@/types/studentAthlete';
import { SchoolContact } from '@/types/schoolContact';
import { HighSchoolAthleteUser } from '@/services/highSchoolAthleteService';
import { FamilyFriendUser } from '@/services/familyFriendService';
import { AthleteCard } from '@/components/admin/AthleteCard';
import { ContactCard } from '@/components/admin/ContactCard';
import { AthleteDetailModal } from '@/components/admin/AthleteDetailModal';
import { HsAthleteCard } from '@/components/admin/HsAthleteCard';
import { HsAthleteDetailModal } from '@/components/admin/HsAthleteDetailModal';
import { FamilyFriendCard } from '@/components/admin/FamilyFriendCard';
import { FamilyFriendDetailModal } from '@/components/admin/FamilyFriendDetailModal';
import { SelectedStatsModal } from '@/components/admin/SelectedStatsModal';
import CollegeMap from '@/components/admin/CollegeMap';
import { GeocodingPanel } from '@/components/admin/GeocodingPanel';
import { AthleteFilters } from '@/components/admin/AthleteFilters';
import { ContactFilters } from '@/components/admin/ContactFilters';
import { AthletePagination } from '@/components/admin/AthletePagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Database, RefreshCw, AlertCircle, Shield, GraduationCap, Building2, ArrowLeft, CheckSquare, Square, BarChart3, MessageSquare, User, Plus, MoreHorizontal, School, Heart, Search, Instagram } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ChatWindow from '@/components/chat/ChatWindow';
import GroupChatList from '@/components/chat/GroupChatList';
import GroupChatWindow from '@/components/chat/GroupChatWindow';
import { ChatService } from '@/services/chatService';
import { ChatGroupService } from '@/services/chatGroupService';
import { useToast } from '@/hooks/use-toast';
import type { Conversation } from '@/types/chat';
import type { GroupConversation } from '@/types/chatGroup';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { StudentAthleteService } from '@/services/studentAthleteService';
import { HighSchoolAthleteService } from '@/services/highSchoolAthleteService';
import { FamilyFriendService } from '@/services/familyFriendService';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';

type TabType = 'athletes' | 'contacts' | 'colleges' | 'hs_athletes' | 'family_friends';

const AdminDashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('athletes');
  const [imageCacheKey, setImageCacheKey] = useState<number>(Date.now());
  const [selectedAthlete, setSelectedAthlete] = useState<StudentAthlete | null>(null);
  const [selectedContact, setSelectedContact] = useState<SchoolContact | null>(null);
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
  const [selectedHsAthlete, setSelectedHsAthlete] = useState<HighSchoolAthleteUser | null>(null);
  const [isHsAthleteModalOpen, setIsHsAthleteModalOpen] = useState(false);
  const [selectedFamilyFriend, setSelectedFamilyFriend] = useState<FamilyFriendUser | null>(null);
  const [isFamilyFriendModalOpen, setIsFamilyFriendModalOpen] = useState(false);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<StudentAthlete | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  // New Group dialog state
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  // Groups state for Messages modal
  const [messagesMode, setMessagesMode] = useState<'direct' | 'groups'>('direct');
  const [groups, setGroups] = useState<GroupConversation[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedGroupTitle, setSelectedGroupTitle] = useState<string | null>(null);
  // Search state for chat modal lists
  const [directSearch, setDirectSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  // Unread tracking
  const [unreadConvoIds, setUnreadConvoIds] = useState<Set<string>>(new Set());
  const [groupLastReadMap, setGroupLastReadMap] = useState<Record<string, string | null | undefined>>({});
  // New Message dialog state
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessageMode, setNewMessageMode] = useState<'direct' | 'group'>('direct');
  const [newMessageUserType, setNewMessageUserType] = useState<'athlete' | 'high_school_athlete' | 'family_friend'>('athlete');
  const [newMessageCreatingId, setNewMessageCreatingId] = useState<string | null>(null);
  const [newGroupSelected, setNewGroupSelected] = useState<Set<string>>(new Set());
  const [newGroupTitleInput, setNewGroupTitleInput] = useState('');
  const [newGroupCreating, setNewGroupCreating] = useState(false);
  
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { count: unreadCount } = useUnreadMessages();
  const {
    athletes,
    allAthletes,
    totalAthletes,
    currentPage: athletesCurrentPage,
    totalPages: athletesTotalPages,
    uniqueSports,
    uniqueColleges,
    uniqueGenders,
    uniqueYears,
    uniqueStates,
    uniqueTotalSmRanges,
    filters: athleteFilters,
    isLoading: athletesLoading,
    isError: athletesError,
    error: athletesErrorMsg,
    goToPage: athletesGoToPage,
    updateFilters: updateAthleteFilters,
    clearFilters: clearAthleteFilters,
    refetch: refetchAthletes,
    hasNextPage: athletesHasNextPage,
    hasPreviousPage: athletesHasPreviousPage,
  } = useStudentAthletes();

  const {
    contacts,
    allContacts,
    totalContacts,
    currentPage: contactsCurrentPage,
    totalPages: contactsTotalPages,
    uniqueColleges: contactUniqueColleges,
    uniqueTitles: contactUniqueTitles,
    filters: contactFilters,
    isLoading: contactsLoading,
    isError: contactsError,
    error: contactsErrorMsg,
    goToPage: contactsGoToPage,
    updateFilters: updateContactFilters,
    clearFilters: clearContactFilters,
    refetch: refetchContacts,
    hasNextPage: contactsHasNextPage,
    hasPreviousPage: contactsHasPreviousPage,
  } = useSchoolContacts();

  const {
    allColleges,
    isLoading: collegesLoading,
    isError: collegesError,
    error: collegesErrorMsg,
    stats: collegeStats,
    refetch: refetchColleges,
  } = useColleges();

  const {
    users: hsAthletes,
    total: totalHsAthletes,
    isLoading: hsAthletesLoading,
    isError: hsAthletesError,
    error: hsAthletesErrorMsg,
    refetch: refetchHsAthletes,
    search: hsSearch,
    setSearch: setHsSearch,
  } = useHighSchoolAthletes();

  const {
    users: familyFriends,
    total: totalFamilyFriends,
    isLoading: familyFriendsLoading,
    isError: familyFriendsError,
    error: familyFriendsErrorMsg,
    refetch: refetchFamilyFriends,
    search: ffSearch,
    setSearch: setFfSearch,
  } = useFamilyFriends();

  // Realtime: refresh athletes list when student_athletes change (insert/update/delete)
  useEffect(() => {
    // Only subscribe when admin is present
    if (!profile || profile.role !== 'admin') return;

    const channel = supabase
      .channel('admin-dashboard-student-athletes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_athletes' },
        (_payload) => {
          // Invalidate the cached list to force refetch; this updates images too
          queryClient.invalidateQueries({ queryKey: ['student-athletes'] });
          // Bump cache key to force <img> URL changes and bypass browser cache
          setImageCacheKey(Date.now());
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  }, [profile?.id, profile?.role, queryClient]);

  // Selection handlers
  const handleAthleteSelection = (athleteId: string, selected: boolean) => {
    const newSelection = new Set(selectedAthleteIds);
    if (selected) {
      newSelection.add(athleteId);
    } else {
      newSelection.delete(athleteId);
    }
    setSelectedAthleteIds(newSelection);
  };

  // When a message is sent inside ChatWindow, update the list ordering immediately
  const handleMessageSent = (conversationId: string, createdAt: string) => {
    setConversations((prev) => {
      if (!prev || prev.length === 0) return prev;
      const updated = prev.map((c) =>
        c.id === conversationId ? ({ ...c, last_message_at: createdAt } as any) : c
      );
      // Sort by last_message_at desc
      updated.sort((a: any, b: any) => {
        const at = a?.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bt = b?.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bt - at;
      });
      return [...updated];
    });
  };

  // When a message is sent inside GroupChatWindow, update the groups list ordering
  const handleGroupMessageSent = (groupId: string, createdAt: string) => {
    setGroups((prev) => {
      if (!prev || prev.length === 0) return prev;
      const updated = prev.map((g) =>
        g.id === groupId ? { ...g, last_message_at: createdAt } : g
      );
      // Sort by last_message_at desc
      return updated.sort((a, b) => {
        const aTime = new Date(a.last_message_at || a.created_at).getTime();
        const bTime = new Date(b.last_message_at || b.created_at).getTime();
        return bTime - aTime;
      });
    });
  };

  // Open a specific conversation if openChat query param is present
  useEffect(() => {
    const convoId = searchParams.get('openChat');
    if (convoId && profile?.id && profile.role === 'admin') {
      setChatConversationId(convoId);
      setIsChatOpen(true);
      // Mark as read for current user (admin)
      ChatService.markConversationRead(convoId, profile.id).catch(() => {});
      // Optional: remove query param to avoid re-opening on close
      const sp = new URLSearchParams(searchParams);
      sp.delete('openChat');
      setSearchParams(sp, { replace: true });
    }
  }, [searchParams, profile?.id, profile?.role, setSearchParams]);

  const handleSelectAll = () => {
    const allCurrentAthleteIds = new Set(athletes.map(athlete => athlete.id));
    setSelectedAthleteIds(allCurrentAthleteIds);
  };

  const handleClearSelection = () => {
    setSelectedAthleteIds(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Clear selection when exiting selection mode
      setSelectedAthleteIds(new Set());
    }
  };

  const openNewGroupDialog = () => {
    const count = selectedAthleteIds.size;
    const defaultTitle = count > 1 ? `Group with ${count} athletes` : 'New Group';
    setNewGroupTitle(defaultTitle);
    setIsNewGroupOpen(true);
  };

  const handleCreateGroup = async () => {
    if (!profile) return;
    const selected = getSelectedAthletes();
    // Map to participant profile IDs (athlete.profile_id). Filter missing.
    const participantIds = selected
      .map((a) => a.profile_id)
      .filter((id): id is string => !!id && id.trim() !== '' && id !== profile.id);

    if (participantIds.length === 0) {
      toast({
        title: 'Cannot create group',
        description: 'Selected athletes do not have linked profiles.',
        variant: 'destructive',
      } as any);
      return;
    }

    try {
      setCreatingGroup(true);
      const title = newGroupTitle && newGroupTitle.trim() !== '' ? newGroupTitle.trim() : `Group with ${participantIds.length} athletes`;
      await ChatGroupService.createGroup(title, profile.id, participantIds);
      setIsNewGroupOpen(false);
      setNewGroupTitle('');
      setSelectedAthleteIds(new Set());
      toast({ title: 'Group created', description: 'Your new group has been created successfully.' } as any);
      // Future: open Groups tab and GroupChatWindow
    } catch (e: any) {
      toast({ title: 'Failed to create group', description: e?.message || 'Please try again.' , variant: 'destructive'} as any);
    } finally {
      setCreatingGroup(false);
    }
  };

  const getSelectedAthletes = (): StudentAthlete[] => {
    // Use full cached dataset so selections across pages are included
    return allAthletes.filter(athlete => selectedAthleteIds.has(athlete.id));
  };

  const handleStartChat = async (athlete: StudentAthlete) => {
    if (!profile) return;
    if (!athlete.profile_id) {
      toast({
        title: 'Cannot start chat',
        description: 'This athlete does not have a linked user profile yet.',
        variant: 'destructive',
      } as any);
      return;
    }
    try {
      setChatLoading(true);
      setChatTarget(athlete);
      setChatTitle(athlete.name);
      const conv = await ChatService.getOrCreateConversation({
        admin_id: profile.id,
        participant_id: athlete.profile_id,
        participant_type: 'athlete',
      });
      setChatConversationId(conv.id);
      setIsChatOpen(true);
    } catch (e: any) {
      toast({ title: 'Failed to open chat', description: e?.message || 'Please try again.' } as any);
    } finally {
      setChatLoading(false);
    }
  };

  // Messages button: open list of conversations first
  const handleOpenMessages = async () => {
    try {
      if (!profile?.id) return;
      setIsChatOpen(true);
      setChatConversationId(null);
      setChatTarget(null);
      setChatTitle(null);
      setSelectedGroupId(null);
      setSelectedGroupTitle(null);
      setMessagesMode('direct');
      setConvLoading(true);
      const res = await ChatService.listConversationsForUser(profile.id, 'admin', 1, 50) as { data: Conversation[]; total: number };
      const list = res.data || [];
      // Load unread previews to mark unread conversations
      try {
        const previews = await ChatService.getUnreadPreviewsForUser(profile.id, 'admin');
        setUnreadConvoIds(new Set(previews.map(p => p.conversation_id)));
      } catch {}
      // Enrich with participant names and photos for display
      try {
        const nameMap: Record<string, string> = {};
        const photoMap: Record<string, string> = {};
        await Promise.all(
          list.map(async (c) => {
            const pid = c.participant_id;
            const ptype = (c as any).participant_type ?? 'athlete';
            if (!pid) return;
            if (ptype === 'high_school_athlete') {
              const r = await HighSchoolAthleteService.fetchByProfileId(pid);
              if (r?.name) nameMap[pid] = r.name;
              if (r?.photo && r.photo.trim() !== '') photoMap[pid] = r.photo;
            } else if (ptype === 'family_friend') {
              const r = await FamilyFriendService.fetchByProfileId(pid);
              if (r?.name) nameMap[pid] = r.name;
              if (r?.photo && r.photo.trim() !== '') photoMap[pid] = r.photo;
            } else {
              const a = await StudentAthleteService.fetchStudentAthleteByProfileId(pid);
              if (a?.name) nameMap[pid] = a.name;
              if (a?.photo && a.photo.trim() !== '') photoMap[pid] = a.photo;
            }
          })
        );
        const enriched = list.map((c) => ({
          ...c,
          athlete_name: (c as any).athlete_name || nameMap[c.participant_id] || '',
          athlete_photo: (c as any).athlete_photo || photoMap[c.participant_id] || '',
        }));
        setConversations(enriched as Conversation[]);
      } catch {
        // If enrichment fails, still show raw list
        setConversations(list);
      }
      if ((res.total || 0) === 0) {
        toast({ title: 'No messages yet', description: 'You will see messages here when you start conversations with athletes.' } as any);
      }
      // Load groups in background
      try {
        setGroupsLoading(true);
        const gres = await ChatGroupService.listGroupsForUser(profile.id, 1, 50);
        setGroups(gres.data || []);
      } catch (e: any) {
        // non-fatal
      } finally {
        setGroupsLoading(false);
      }
    } catch (e: any) {
      toast({ title: 'Failed to load messages', description: e?.message || 'Please try again.' } as any);
    } finally {
      setConvLoading(false);
    }
  };

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You need admin privileges to access this dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get current tab data
  const isLoading = activeTab === 'athletes' ? athletesLoading :
                   activeTab === 'contacts' ? contactsLoading :
                   activeTab === 'colleges' ? collegesLoading :
                   activeTab === 'hs_athletes' ? hsAthletesLoading :
                   activeTab === 'family_friends' ? familyFriendsLoading : false;
  const isError = activeTab === 'athletes' ? athletesError :
                 activeTab === 'contacts' ? contactsError :
                 activeTab === 'colleges' ? collegesError :
                 activeTab === 'hs_athletes' ? hsAthletesError :
                 activeTab === 'family_friends' ? familyFriendsError : false;
  const error = activeTab === 'athletes' ? athletesErrorMsg :
               activeTab === 'contacts' ? contactsErrorMsg :
               activeTab === 'colleges' ? collegesErrorMsg :
               activeTab === 'hs_athletes' ? hsAthletesErrorMsg :
               activeTab === 'family_friends' ? familyFriendsErrorMsg : null;
  const refetch = activeTab === 'athletes' ? refetchAthletes :
                 activeTab === 'contacts' ? refetchContacts :
                 activeTab === 'colleges' ? refetchColleges :
                 activeTab === 'hs_athletes' ? refetchHsAthletes :
                 activeTab === 'family_friends' ? refetchFamilyFriends : () => {};

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Error loading {activeTab === 'athletes' ? 'student athletes' : 'school contacts'}: {error?.message || 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => refetch()} className="bg-nil-orange hover:bg-nil-navy">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              aria-label="Go back to homepage"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage student athletes, school contacts, and colleges here.
              </p>
            </div>
          </div>
          <Button onClick={handleOpenMessages} className="relative bg-nil-orange hover:bg-nil-navy hidden sm:inline-flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Mobile Messages button (visible on small screens) */}
        <div className="sm:hidden mb-4">
          <Button onClick={handleOpenMessages} className="relative w-full bg-nil-orange hover:bg-nil-navy inline-flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="athletes" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Student </span>Athletes
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">School </span>Contacts
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4 flex-shrink-0" />
              Colleges
            </TabsTrigger>
            <TabsTrigger value="hs_athletes" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <School className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">HS </span>Athletes
            </TabsTrigger>
            <TabsTrigger value="family_friends" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Heart className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Family/</span>Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="mt-6">
            {/* Athletes Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Male</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allAthletes.filter(athlete => athlete.gender === 'M').length.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Male athletes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Female</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allAthletes.filter(athlete => athlete.gender === 'F').length.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Female athletes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Total</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalAthletes.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing page {athletesCurrentPage} of {athletesTotalPages}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total SM Followers</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {allAthletes.reduce((sum, athlete) => sum + (athlete.total_followers || 0), 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Combined followers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Colleges</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {uniqueColleges.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different colleges
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            {/* Contacts Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contacts.length.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently displayed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database Total</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalContacts.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing page {contactsCurrentPage} of {contactsTotalPages}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Schools</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {contactUniqueColleges.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Different schools represented
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hs_athletes" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total HS Athletes</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHsAthletes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Showing</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hsAthletes.length.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {hsSearch ? 'Matching search' : 'All records'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="family_friends" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Family/Friends</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalFamilyFriends.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Showing</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{familyFriends.length.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {ffSearch ? 'Matching search' : 'All records'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tab Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsContent value="athletes">
            {/* Athlete Filters */}
            <AthleteFilters
              filters={athleteFilters}
              onFiltersChange={updateAthleteFilters}
              onClearFilters={clearAthleteFilters}
              uniqueSports={uniqueSports}
              uniqueColleges={uniqueColleges}
              uniqueGenders={uniqueGenders}
              uniqueYears={uniqueYears}
              uniqueStates={uniqueStates}
              uniqueTotalSmRanges={uniqueTotalSmRanges}
              totalResults={totalAthletes}
              isLoading={athletesLoading}
            />

            {/* Sort Results (separate section under filters) */}
            <Card className="mb-6">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Sort Results</h3>
                  {athleteFilters.sortBy && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAthleteFilters({ ...athleteFilters, sortBy: undefined, sortDir: undefined })}
                    >
                      Clear Sorting
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Sort By</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={athleteFilters.sortBy === 'firstName' ? 'default' : 'outline'}
                        onClick={() => {
                          const isSame = athleteFilters.sortBy === 'firstName';
                          updateAthleteFilters({
                            ...athleteFilters,
                            sortBy: isSame ? undefined : 'firstName',
                            sortDir: isSame ? undefined : (athleteFilters.sortDir || 'asc'),
                          });
                        }}
                      >
                        First Name
                      </Button>
                      <Button
                        variant={athleteFilters.sortBy === 'lastName' ? 'default' : 'outline'}
                        onClick={() => {
                          const isSame = athleteFilters.sortBy === 'lastName';
                          updateAthleteFilters({
                            ...athleteFilters,
                            sortBy: isSame ? undefined : 'lastName',
                            sortDir: isSame ? undefined : (athleteFilters.sortDir || 'asc'),
                          });
                        }}
                      >
                        Last Name
                      </Button>
                      <Button
                        variant={athleteFilters.sortBy === 'profileCreatedAt' ? 'default' : 'outline'}
                        onClick={() => {
                          const isSame = athleteFilters.sortBy === 'profileCreatedAt';
                          updateAthleteFilters({
                            ...athleteFilters,
                            sortBy: isSame ? undefined : 'profileCreatedAt',
                            sortDir: isSame ? undefined : (athleteFilters.sortDir || 'asc'),
                          });
                        }}
                      >
                        Profile Created
                      </Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Direction</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={athleteFilters.sortDir !== 'desc' ? 'default' : 'outline'}
                        disabled={!athleteFilters.sortBy}
                        onClick={() => updateAthleteFilters({ ...athleteFilters, sortDir: 'asc' })}
                      >
                        Ascending
                      </Button>
                      <Button
                        variant={athleteFilters.sortDir === 'desc' ? 'default' : 'outline'}
                        disabled={!athleteFilters.sortBy}
                        onClick={() => updateAthleteFilters({ ...athleteFilters, sortDir: 'desc' })}
                      >
                        Descending
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selection Mode Controls - Below filters */}
            <div className="flex items-center flex-wrap gap-3 mb-6">
              {/* Quick Filter: Accounts Created in Past Week (button styled like selection toggle) */}
              <Button
                onClick={() =>
                  updateAthleteFilters({
                    ...athleteFilters,
                    createdInPastWeek: athleteFilters.createdInPastWeek ? undefined : true,
                  })
                }
                variant={athleteFilters.createdInPastWeek ? 'default' : 'outline'}
                className={athleteFilters.createdInPastWeek ? 'bg-nil-orange hover:bg-nil-navy' : ''}
                disabled={athletesLoading}
              >
                {athleteFilters.createdInPastWeek ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                Created Past Week
              </Button>
              
              <Button
                onClick={toggleSelectionMode}
                variant={selectionMode ? "default" : "outline"}
                className={selectionMode ? "bg-nil-orange hover:bg-nil-navy" : ""}
              >
                {selectionMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {selectionMode ? 'Exit Selection' : 'Select Athletes'}
              </Button>
              {selectionMode && (
                <>
                  <Button onClick={handleSelectAll} variant="outline" size="sm">
                    Select All ({athletes.length})
                  </Button>
                  <Button onClick={handleClearSelection} variant="outline" size="sm">
                    Clear ({selectedAthleteIds.size})
                  </Button>
                  <Button 
                    onClick={() => setIsStatsModalOpen(true)}
                    disabled={selectedAthleteIds.size === 0}
                    className="bg-nil-navy hover:bg-nil-orange"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Selected Stats ({selectedAthleteIds.size})
                  </Button>
                  <Button
                    onClick={openNewGroupDialog}
                    disabled={selectedAthleteIds.size === 0}
                    className="bg-nil-orange hover:bg-nil-navy"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    New Group ({selectedAthleteIds.size})
                  </Button>
                </>
              )}
            </div>

            {/* Loading State */}
            {athletesLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading student athletes...</span>
                </div>
              </div>
            )}

            {/* Athletes Grid */}
            {!athletesLoading && (
              <>
                {athletes.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No athletes found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {Object.keys(athleteFilters).length > 0
                          ? 'Try adjusting your filters to see more results.'
                          : 'No student athletes are currently in the database.'}
                      </p>
                      {Object.keys(athleteFilters).length > 0 && (
                        <Button onClick={clearAthleteFilters} variant="outline">
                          Clear All Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Athletes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 mb-8">
                      {athletes.map((athlete) => (
                        <div key={athlete.id} className="space-y-2">
                          <AthleteCard 
                            athlete={athlete} 
                            onClick={() => {
                              setSelectedAthlete(athlete);
                              setIsAthleteModalOpen(true);
                            }}
                            selectionMode={selectionMode}
                            isSelected={selectedAthleteIds.has(athlete.id)}
                            onSelectionChange={handleAthleteSelection}
                            cacheKey={imageCacheKey}
                          />
                          {/* Message button removed per request */}
                        </div>
                      ))}
                    </div>

                    {/* Athletes Pagination */}
                    <AthletePagination
                      currentPage={athletesCurrentPage}
                      totalPages={athletesTotalPages}
                      totalItems={totalAthletes}
                      pageSize={100}
                      onPageChange={athletesGoToPage}
                      hasNextPage={athletesHasNextPage}
                      hasPreviousPage={athletesHasPreviousPage}
                      isLoading={athletesLoading}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="contacts">
            {/* Contact Filters */}
            <ContactFilters
              filters={contactFilters}
              onFiltersChange={updateContactFilters}
              onClearFilters={clearContactFilters}
              uniqueColleges={contactUniqueColleges}
              totalResults={totalContacts}
              isLoading={contactsLoading}
            />

            {/* Loading State */}
            {contactsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading school contacts...</span>
                </div>
              </div>
            )}

            {/* Contacts Grid */}
            {!contactsLoading && (
              <>
                {contacts.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No contacts found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {Object.keys(contactFilters).length > 0
                          ? 'Try adjusting your filters to see more results.'
                          : 'No school contacts are currently in the database.'}
                      </p>
                      {Object.keys(contactFilters).length > 0 && (
                        <Button onClick={clearContactFilters} variant="outline">
                          Clear All Filters
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Contacts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                      {contacts.map((contact) => (
                        <ContactCard 
                          key={contact.id} 
                          contact={contact} 
                          onClick={() => {
                            setSelectedContact(contact);
                            // Modal for contacts can be implemented later
                            console.log('Contact clicked:', contact.name);
                          }}
                        />
                      ))}
                    </div>

                    {/* Contacts Pagination */}
                    <AthletePagination
                      currentPage={contactsCurrentPage}
                      totalPages={contactsTotalPages}
                      totalItems={totalContacts}
                      pageSize={100}
                      onPageChange={contactsGoToPage}
                      hasNextPage={contactsHasNextPage}
                      hasPreviousPage={contactsHasPreviousPage}
                      isLoading={contactsLoading}
                    />
                  </>
                )}
              </>
            )}
          </TabsContent>


          <TabsContent value="colleges" className="mt-6">

            {/* Geocoding Panel - Temporarily commented out */}
            {/* <div className="mb-8">
              <GeocodingPanel />
            </div> */}

            {/* Interactive College Map */}
            <CollegeMap
              colleges={allColleges}
              isLoading={collegesLoading}
              onCollegeSelect={(college) => {
                console.log('Selected college:', college);
                // Future: Open college detail modal or navigate to college page
              }}
            />
          </TabsContent>

          <TabsContent value="hs_athletes">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, sport, or hometown..."
                  value={hsSearch}
                  onChange={(e) => setHsSearch(e.target.value)}
                />
              </div>
            </div>

            {hsAthletesLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading high school athletes...</span>
                </div>
              </div>
            )}

            {!hsAthletesLoading && (
              hsAthletes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No high school athletes found
                    </h3>
                    <p className="text-gray-600">
                      {hsSearch ? 'Try adjusting your search.' : 'No high school athletes have registered yet.'}
                    </p>
                    {hsSearch && (
                      <Button onClick={() => setHsSearch('')} variant="outline" className="mt-4">
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
                  {hsAthletes.map((u) => (
                    <HsAthleteCard
                      key={u.id}
                      user={u}
                      onClick={() => {
                        setSelectedHsAthlete(u);
                        setIsHsAthleteModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="family_friends">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search by name, relationship, or hometown..."
                  value={ffSearch}
                  onChange={(e) => setFfSearch(e.target.value)}
                />
              </div>
            </div>

            {familyFriendsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading family/friends...</span>
                </div>
              </div>
            )}

            {!familyFriendsLoading && (
              familyFriends.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No family/friends found
                    </h3>
                    <p className="text-gray-600">
                      {ffSearch ? 'Try adjusting your search.' : 'No family/friend accounts have registered yet.'}
                    </p>
                    {ffSearch && (
                      <Button onClick={() => setFfSearch('')} variant="outline" className="mt-4">
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
                  {familyFriends.map((u) => (
                    <FamilyFriendCard
                      key={u.id}
                      user={u}
                      onClick={() => {
                        setSelectedFamilyFriend(u);
                        setIsFamilyFriendModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Athlete Detail Modal */}
      <AthleteDetailModal
        athlete={selectedAthlete}
        isOpen={isAthleteModalOpen}
        onClose={() => {
          setIsAthleteModalOpen(false);
          setSelectedAthlete(null);
        }}
      />

      {/* HS Athlete Detail Modal */}
      <HsAthleteDetailModal
        user={selectedHsAthlete}
        isOpen={isHsAthleteModalOpen}
        onClose={() => {
          setIsHsAthleteModalOpen(false);
          setSelectedHsAthlete(null);
        }}
      />

      {/* Family/Friend Detail Modal */}
      <FamilyFriendDetailModal
        user={selectedFamilyFriend}
        isOpen={isFamilyFriendModalOpen}
        onClose={() => {
          setIsFamilyFriendModalOpen(false);
          setSelectedFamilyFriend(null);
        }}
      />

      {/* Selected Stats Modal */}
      <SelectedStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        selectedAthletes={getSelectedAthletes()}
      />

      {/* New Group Dialog */}
      <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group title</label>
              <Input
                placeholder="Enter a group title"
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
              />
            </div>
            <div className="text-sm text-gray-600">
              Selected athletes: <span className="font-medium">{selectedAthleteIds.size}</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewGroupOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGroup} disabled={creatingGroup} className="bg-nil-orange hover:bg-nil-navy">
                {creatingGroup ? 'Creating…' : 'Create Group'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Message Dialog */}
      <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Start New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Mode toggle: Direct vs Group */}
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-md border overflow-hidden">
                <button
                  className={`px-3 py-1.5 text-sm ${newMessageMode === 'direct' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setNewMessageMode('direct')}
                >
                  Direct
                </button>
                <button
                  className={`px-3 py-1.5 text-sm border-l ${newMessageMode === 'group' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  onClick={() => setNewMessageMode('group')}
                >
                  Group
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {newMessageMode === 'group' ? 'Group selection (coming soon)' : 'Direct message'}
              </div>
            </div>
            {/* User type selector */}
            <div className="inline-flex rounded-md border overflow-hidden text-xs">
              <button
                className={`px-3 py-1.5 ${newMessageUserType === 'athlete' ? 'bg-nil-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setNewMessageUserType('athlete')}
              >
                Athletes
              </button>
              <button
                className={`px-3 py-1.5 border-l ${newMessageUserType === 'high_school_athlete' ? 'bg-nil-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setNewMessageUserType('high_school_athlete')}
              >
                HS Athletes
              </button>
              <button
                className={`px-3 py-1.5 border-l ${newMessageUserType === 'family_friend' ? 'bg-nil-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setNewMessageUserType('family_friend')}
              >
                Family/Friends
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y rounded-md border">
              {newMessageUserType === 'athlete' ? (
                allAthletes.filter(a => !!a.profile_id && a.profile_id.trim() !== '').length === 0 ? (
                  <div className="p-4 text-gray-600">No athletes with profiles available.</div>
                ) : (
                  allAthletes
                    .filter(a => !!a.profile_id && a.profile_id.trim() !== '')
                    .map((athlete) => (
                      <div key={athlete.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            {newMessageMode === 'group' && (
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                aria-label="Select for group chat"
                                checked={newGroupSelected.has(athlete.profile_id as string)}
                                onChange={(e) => {
                                  const next = new Set(newGroupSelected);
                                  const uid = String(athlete.profile_id);
                                  if (e.currentTarget.checked) next.add(uid); else next.delete(uid);
                                  setNewGroupSelected(next);
                                }}
                              />
                            )}
                            <div className="relative w-10 h-10 flex-shrink-0">
                              {athlete.photo ? (
                                <img
                                  src={athlete.photo}
                                  alt={athlete.name || 'Athlete avatar'}
                                  className="w-10 h-10 rounded-full object-cover bg-gray-100"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    const placeholder = (e.currentTarget.nextElementSibling as HTMLElement | null);
                                    if (placeholder) placeholder.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={athlete.photo ? 'hidden absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy' : 'absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy'}>
                                <User className="w-5 h-5 text-white opacity-70" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">{athlete.name || 'Unnamed Athlete'}</div>
                              <div className="text-xs text-gray-600 truncate">
                                {[athlete.sport, athlete.college].filter(Boolean).join(' • ')}
                              </div>
                            </div>
                          </div>
                          {newMessageMode === 'direct' ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Start new message"
                              disabled={!profile?.id || !athlete.profile_id || newMessageCreatingId === athlete.id}
                              onClick={async () => {
                                if (!profile?.id || !athlete.profile_id) return;
                                try {
                                  setNewMessageCreatingId(athlete.id);
                                  const conv = await ChatService.getOrCreateConversation({
                                    admin_id: profile.id,
                                    participant_id: athlete.profile_id,
                                    participant_type: 'athlete',
                                  });
                                  setIsNewMessageOpen(false);
                                  setChatConversationId(conv.id);
                                  setChatTitle(athlete.name);
                                  setChatTarget(athlete);
                                  try { await ChatService.markConversationRead(conv.id, profile.id); } catch {}
                                } catch (e: any) {
                                  toast({ title: 'Failed to start chat', description: e?.message || 'Please try again.', variant: 'destructive' } as any);
                                } finally {
                                  setNewMessageCreatingId(null);
                                }
                              }}
                            >
                              <Plus className={newMessageCreatingId === athlete.id ? 'w-4 h-4 opacity-50' : 'w-4 h-4'} />
                            </Button>
                          ) : (
                            <div className="text-xs text-gray-500 select-none">
                              {newGroupSelected.has(String(athlete.profile_id)) ? 'Selected' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )
              ) : newMessageUserType === 'high_school_athlete' ? (
                hsAthletes.filter(u => !!u.id).length === 0 ? (
                  <div className="p-4 text-gray-600">No high school athletes available.</div>
                ) : (
                  hsAthletes.map((u) => (
                    <div key={u.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {u.photo ? (
                              <img src={u.photo} alt={u.full_name || 'User avatar'} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                            ) : null}
                            <div className={u.photo ? 'hidden absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy' : 'absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy'}>
                              <User className="w-5 h-5 text-white opacity-70" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{u.full_name || 'Unnamed'}</div>
                            <div className="text-xs text-gray-600 truncate">{[u.sport, u.hometown].filter(Boolean).join(' • ')}</div>
                          </div>
                        </div>
                        {newMessageMode === 'direct' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Start new message"
                            disabled={!profile?.id || newMessageCreatingId === u.id}
                            onClick={async () => {
                              if (!profile?.id) return;
                              try {
                                setNewMessageCreatingId(u.id);
                                const conv = await ChatService.getOrCreateConversation({
                                  admin_id: profile.id,
                                  participant_id: u.id,
                                  participant_type: 'high_school_athlete',
                                });
                                setIsNewMessageOpen(false);
                                setChatConversationId(conv.id);
                                setChatTitle(u.full_name || 'HS Athlete');
                                setChatTarget(null);
                                try { await ChatService.markConversationRead(conv.id, profile.id); } catch {}
                              } catch (e: any) {
                                toast({ title: 'Failed to start chat', description: e?.message || 'Please try again.', variant: 'destructive' } as any);
                              } finally {
                                setNewMessageCreatingId(null);
                              }
                            }}
                          >
                            <Plus className={newMessageCreatingId === u.id ? 'w-4 h-4 opacity-50' : 'w-4 h-4'} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )
              ) : (
                familyFriends.filter(u => !!u.id).length === 0 ? (
                  <div className="p-4 text-gray-600">No family/friend users available.</div>
                ) : (
                  familyFriends.map((u) => (
                    <div key={u.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {u.photo ? (
                              <img src={u.photo} alt={u.full_name || 'User avatar'} className="w-10 h-10 rounded-full object-cover bg-gray-100" />
                            ) : null}
                            <div className={u.photo ? 'hidden absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy' : 'absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy'}>
                              <User className="w-5 h-5 text-white opacity-70" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{u.full_name || 'Unnamed'}</div>
                            <div className="text-xs text-gray-600 truncate">{[u.relationship_type, u.hometown].filter(Boolean).join(' • ')}</div>
                          </div>
                        </div>
                        {newMessageMode === 'direct' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Start new message"
                            disabled={!profile?.id || newMessageCreatingId === u.id}
                            onClick={async () => {
                              if (!profile?.id) return;
                              try {
                                setNewMessageCreatingId(u.id);
                                const conv = await ChatService.getOrCreateConversation({
                                  admin_id: profile.id,
                                  participant_id: u.id,
                                  participant_type: 'family_friend',
                                });
                                setIsNewMessageOpen(false);
                                setChatConversationId(conv.id);
                                setChatTitle(u.full_name || 'Family/Friend');
                                setChatTarget(null);
                                try { await ChatService.markConversationRead(conv.id, profile.id); } catch {}
                              } catch (e: any) {
                                toast({ title: 'Failed to start chat', description: e?.message || 'Please try again.', variant: 'destructive' } as any);
                              } finally {
                                setNewMessageCreatingId(null);
                              }
                            }}
                          >
                            <Plus className={newMessageCreatingId === u.id ? 'w-4 h-4 opacity-50' : 'w-4 h-4'} />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
            {/* Group creation controls */}
            {newMessageMode === 'group' && (
              <div className="space-y-2 pt-3">
                <input
                  type="text"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Group title (optional)"
                  value={newGroupTitleInput}
                  onChange={(e) => setNewGroupTitleInput(e.currentTarget.value)}
                />
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{newGroupSelected.size} selected</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewGroupSelected(new Set())}
                      disabled={newGroupCreating || newGroupSelected.size === 0}
                    >
                      Clear
                    </Button>
                    <Button
                      className="bg-nil-orange hover:bg-nil-navy"
                      size="sm"
                      disabled={newGroupCreating || newGroupSelected.size < 2 || !profile?.id}
                      onClick={async () => {
                        if (!profile?.id) return;
                        if (newGroupSelected.size < 2) return;
                        try {
                          setNewGroupCreating(true);
                          // Build title if empty
                          let title = newGroupTitleInput.trim();
                          if (!title) {
                            const names: string[] = [];
                            for (const a of allAthletes) {
                              if (a.profile_id && newGroupSelected.has(String(a.profile_id))) {
                                if (a.name) names.push(a.name);
                              }
                            }
                            title = names.slice(0, 3).join(', ') + (names.length > 3 ? '…' : '');
                            if (!title) title = 'Group chat';
                          }
                          const participantIds = Array.from(newGroupSelected);
                          const res = await ChatGroupService.createGroup(title, profile.id, participantIds);
                          // Reset selection and close dialog
                          setNewGroupSelected(new Set());
                          setNewGroupTitleInput('');
                          setIsNewMessageOpen(false);
                          // Switch to the newly created group in chat modal
                          setMessagesMode('groups');
                          setSelectedGroupId(res.conversation.id);
                          setSelectedGroupTitle(res.conversation.title || title);
                          // Best-effort: refresh groups list
                          try {
                            const gres = await ChatGroupService.listGroupsForUser(profile.id, 1, 50);
                            setGroups(gres.data || []);
                          } catch {}
                        } catch (e: any) {
                          toast({
                            title: 'Failed to create group',
                            description: e?.message || 'Please try again.',
                            variant: 'destructive',
                          } as any);
                        } finally {
                          setNewGroupCreating(false);
                        }
                      }}
                    >
                      {newGroupCreating ? 'Creating…' : 'Create Group'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog
        open={isChatOpen}
        onOpenChange={(open) => {
          setIsChatOpen(open);
          if (!open) {
            setChatConversationId(null);
            setChatTarget(null);
            setSelectedGroupId(null);
            setSelectedGroupTitle(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {chatConversationId
                  ? (() => {
                      const name = chatTitle || (chatTarget ? chatTarget.name : null);
                      return name ? `Chat with ${name}` : 'Chat';
                    })()
                  : selectedGroupId
                    ? `Group: ${selectedGroupTitle || 'Group'}`
                    : 'Your Messages'}
              </DialogTitle>
            </div>
          </DialogHeader>
          {chatConversationId && profile ? (
            <ChatWindow
              conversationId={chatConversationId}
              currentUserId={profile.id}
              title={chatTitle || (chatTarget ? chatTarget.name : 'Conversation')}
              onBack={() => {
                // Return to conversation list within the same modal
                setChatConversationId(null);
                setChatTarget(null);
                setChatTitle(null);
              }}
              onMessageSent={handleMessageSent}
            />
          ) : selectedGroupId && profile ? (
            <GroupChatWindow
              groupId={selectedGroupId}
              currentUserId={profile.id}
              title={selectedGroupTitle || 'Group'}
              onTitleChange={(newTitle) => {
                setSelectedGroupTitle(newTitle);
                // Update the groups list to reflect the new title and timestamp
                const now = new Date().toISOString();
                setGroups(prevGroups => {
                  const updated = prevGroups.map(group => 
                    group.id === selectedGroupId 
                      ? { ...group, title: newTitle, last_message_at: now }
                      : group
                  );
                  // Re-sort by last_message_at to maintain proper ordering
                  return updated.sort((a, b) => {
                    const aTime = new Date(a.last_message_at || a.created_at).getTime();
                    const bTime = new Date(b.last_message_at || b.created_at).getTime();
                    return bTime - aTime;
                  });
                });
              }}
              onGroupMessageSent={handleGroupMessageSent}
              onBack={() => {
                setSelectedGroupId(null);
                setSelectedGroupTitle(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Toggle and New Message Button */}
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-md border overflow-hidden">
                  <button
                    className={`px-3 py-1.5 text-sm ${messagesMode === 'direct' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setMessagesMode('direct')}
                  >
                    Direct
                  </button>
                  <button
                    className={`px-3 py-1.5 text-sm border-l ${messagesMode === 'groups' ? 'bg-nil-orange text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={async () => {
                      setMessagesMode('groups');
                      if (profile?.id && groups.length === 0) {
                        try {
                          setGroupsLoading(true);
                          const gres = await ChatGroupService.listGroupsForUser(profile.id, 1, 50);
                          setGroups(gres.data || []);
                          // Load last_read_at map for unread dots
                          const groupIds = (gres.data || []).map(g => g.id);
                          if (groupIds.length > 0) {
                            const { data: parts } = await supabase
                              .from('group_participants')
                              .select('group_id, last_read_at')
                              .eq('user_id', profile.id)
                              .in('group_id', groupIds);
                            const map: Record<string, string | null> = {};
                            for (const row of (parts as any[]) || []) map[String((row as any).group_id)] = (row as any).last_read_at || null;
                            setGroupLastReadMap(map);
                          }
                        } catch {} finally { setGroupsLoading(false); }
                      }
                    }}
                  >
                    Groups
                  </button>
                </div>
                {!chatConversationId && !selectedGroupId && (
                  <Button
                    onClick={() => setIsNewMessageOpen(true)}
                    className="bg-nil-orange hover:bg-nil-navy inline-flex items-center gap-2"
                    size="sm"
                    aria-label="New Message"
                    title="New Message"
                  >
                    <Plus className="w-4 h-4" />
                    New Message
                  </Button>
                )}
              </div>

              {/* Search bar for current mode */}
              <div>
                {messagesMode === 'direct' ? (
                  <Input
                    value={directSearch}
                    onChange={(e) => setDirectSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="max-w-md"
                  />
                ) : (
                  <Input
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Search groups..."
                    className="max-w-md"
                  />
                )}
              </div>

              {messagesMode === 'direct' ? (
                <div className="space-y-3">
                  {convLoading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading conversations...</span>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-gray-600">No conversations found.</div>
                  ) : (
                    <div className="max-h-[50vh] overflow-y-auto">
                      <div className="divide-y rounded-md border">
                        {conversations
                          .filter((conv) => {
                            const name = String((conv as any).athlete_name || '').toLowerCase();
                            return directSearch.trim() === '' || name.includes(directSearch.toLowerCase());
                          })
                          .map((conv) => (
                          <button
                            key={conv.id}
                            onClick={async () => {
                              try {
                                setChatConversationId(conv.id);
                                const otherName = (conv as any).athlete_name as string | undefined;
                                if (otherName) setChatTitle(otherName);
                                // For college athletes, also set chatTarget for compatibility
                                const ptype = (conv as any).participant_type ?? 'athlete';
                                if (ptype === 'athlete') {
                                  const athlete = await StudentAthleteService.fetchStudentAthleteByProfileId(conv.participant_id);
                                  if (athlete) {
                                    setChatTarget(athlete);
                                    if (!otherName && athlete.name) setChatTitle(athlete.name);
                                  }
                                }
                                if (profile?.id) {
                                  try { await ChatService.markConversationRead(conv.id, profile.id); } catch {}
                                  // Optimistically clear unread dot
                                  setUnreadConvoIds((prev) => {
                                    const next = new Set(prev);
                                    next.delete(conv.id);
                                    return next;
                                  });
                                }
                              } catch {}
                            }}
                            className="w-full text-left p-3 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                {unreadConvoIds.has(conv.id) ? (
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0" aria-label="Unread messages" title="Unread messages" />
                                ) : null}
                                <div className="relative w-10 h-10 flex-shrink-0">
                                  {(conv as any).athlete_photo ? (
                                    <img
                                      src={(conv as any).athlete_photo}
                                      alt={(conv as any).athlete_name || 'User avatar'}
                                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        const placeholder = (e.currentTarget.nextElementSibling as HTMLElement | null);
                                        if (placeholder) placeholder.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={(conv as any).athlete_photo ? 'hidden absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy' : 'absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-nil-light-blue to-nil-navy'}>
                                    <User className="w-5 h-5 text-white opacity-70" />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{(conv as any).athlete_name || 'Conversation'}</div>
                                  <div className="text-sm text-gray-600 line-clamp-1">Tap to open conversation</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                <div className="text-xs text-gray-500">
                                  {new Date(conv.last_message_at || conv.updated_at || conv.created_at).toLocaleString()}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-1 rounded hover:bg-gray-100 focus:outline-none"
                                      aria-label="Conversation options"
                                    >
                                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setUnreadConvoIds((prev) => {
                                          const next = new Set(prev);
                                          next.add(conv.id);
                                          return next;
                                        });
                                      }}
                                    >
                                      Mark as Unread
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-[50vh] overflow-y-auto">
                  <GroupChatList
                    groups={groups.filter((g) => {
                      const title = String(g.title || 'Group').toLowerCase();
                      return groupSearch.trim() === '' || title.includes(groupSearch.toLowerCase());
                    })}
                    lastReadMap={groupLastReadMap}
                    loading={groupsLoading}
                    onOpen={async (g) => {
                      setSelectedGroupId(g.id);
                      setSelectedGroupTitle(g.title);
                      if (profile?.id) {
                        try { await ChatGroupService.markGroupRead(g.id, profile.id); } catch {}
                        // Optimistically update lastRead for this group so dot disappears
                        setGroupLastReadMap((prev) => ({ ...prev, [g.id]: new Date().toISOString() }));
                      }
                    }}
                    isAdmin={true}
                    currentUserId={profile?.id}
                    onDeleted={(groupId) => {
                      setGroups((prev) => prev.filter((g) => g.id !== groupId));
                      if (selectedGroupId === groupId) {
                        setSelectedGroupId(null);
                        setSelectedGroupTitle(null);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;