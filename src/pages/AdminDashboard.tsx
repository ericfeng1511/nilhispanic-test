import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentAthletes } from '@/hooks/useStudentAthletes';
import { useSchoolContacts } from '@/hooks/useSchoolContacts';
import { useColleges } from '@/hooks/useColleges';
import { StudentAthlete } from '@/types/studentAthlete';
import { SchoolContact } from '@/types/schoolContact';
import { AthleteCard } from '@/components/admin/AthleteCard';
import { ContactCard } from '@/components/admin/ContactCard';
import { AthleteDetailModal } from '@/components/admin/AthleteDetailModal';
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
import { Loader2, Users, Database, RefreshCw, AlertCircle, Shield, GraduationCap, Building2, ArrowLeft, CheckSquare, Square, BarChart3, MessageSquare, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

type TabType = 'athletes' | 'contacts' | 'colleges';

const AdminDashboard: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('athletes');
  const [selectedAthlete, setSelectedAthlete] = useState<StudentAthlete | null>(null);
  const [selectedContact, setSelectedContact] = useState<SchoolContact | null>(null);
  const [isAthleteModalOpen, setIsAthleteModalOpen] = useState(false);
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
        athlete_id: athlete.profile_id,
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
      // Enrich with athlete names and photos for display
      try {
        const uniqueAthleteIds = Array.from(new Set(list.map((c) => c.athlete_id).filter(Boolean)));
        const nameMap: Record<string, string> = {};
        const photoMap: Record<string, string> = {};
        await Promise.all(
          uniqueAthleteIds.map(async (id) => {
            const a = await StudentAthleteService.fetchStudentAthleteByProfileId(id);
            if (a?.name) nameMap[id] = a.name;
            if (a?.photo && a.photo.trim() !== '') photoMap[id] = a.photo;
          })
        );
        const enriched = list.map((c) => ({
          ...c,
          athlete_name: (c as any).athlete_name || nameMap[c.athlete_id] || '',
          athlete_photo: (c as any).athlete_photo || photoMap[c.athlete_id] || '',
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
                   activeTab === 'colleges' ? collegesLoading : false;
  const isError = activeTab === 'athletes' ? athletesError : 
                 activeTab === 'contacts' ? contactsError : 
                 activeTab === 'colleges' ? collegesError : false;
  const error = activeTab === 'athletes' ? athletesErrorMsg : 
               activeTab === 'contacts' ? contactsErrorMsg : 
               activeTab === 'colleges' ? collegesErrorMsg : null;
  const refetch = activeTab === 'athletes' ? refetchAthletes : 
                 activeTab === 'contacts' ? refetchContacts : 
                 activeTab === 'colleges' ? refetchColleges : () => {};

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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="mb-8">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Student Athletes
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              School Contacts
            </TabsTrigger>
            <TabsTrigger value="colleges" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Colleges
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
              uniqueTotalSmRanges={uniqueTotalSmRanges}
              totalResults={totalAthletes}
              isLoading={athletesLoading}
            />

            {/* Selection Mode Controls - Below filters */}
            <div className="flex items-center gap-2 mb-6">
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
                          />
                          {/* Actions under card - Hidden on mobile since horizontal cards are more compact */}
                          <div className="hidden sm:flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-nil-orange hover:bg-nil-navy"
                              onClick={() => handleStartChat(athlete)}
                              disabled={!athlete.profile_id || chatLoading}
                            >
                              Message
                            </Button>
                          </div>
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
              onTitleChange={(newTitle) => setSelectedGroupTitle(newTitle)}
              onBack={() => {
                setSelectedGroupId(null);
                setSelectedGroupTitle(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Toggle */}
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
                      } catch {} finally { setGroupsLoading(false); }
                    }
                  }}
                >
                  Groups
                </button>
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
                    <div className="divide-y rounded-md border">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={async () => {
                            try {
                              setChatConversationId(conv.id);
                              const otherName = (conv as any).athlete_name as string | undefined;
                              if (otherName) setChatTitle(otherName);
                              // Fetch athlete name to ensure title is correct
                              const athlete = await StudentAthleteService.fetchStudentAthleteByProfileId(conv.athlete_id);
                              if (athlete) {
                                setChatTarget(athlete);
                                if (!otherName && athlete.name) setChatTitle(athlete.name);
                              }
                              if (profile?.id) {
                                try { await ChatService.markConversationRead(conv.id, profile.id); } catch {}
                              }
                            } catch {}
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
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
                            <div className="text-xs text-gray-500 ml-3 flex-shrink-0">{new Date(conv.last_message_at || conv.updated_at || conv.created_at).toLocaleString()}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <GroupChatList
                  groups={groups}
                  loading={groupsLoading}
                  onOpen={async (g) => {
                    setSelectedGroupId(g.id);
                    setSelectedGroupTitle(g.title);
                    if (profile?.id) {
                      try { await ChatGroupService.markGroupRead(g.id, profile.id); } catch {}
                    }
                  }}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;