import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, Share2, Award, Target, BarChart3, Rocket, Calendar, ArrowLeft, Link as LinkIcon } from 'lucide-react';

const mockMember = {
  id: 'cm-1',
  name: 'Community Member',
  city: 'Los Angeles, CA',
  categories: ['friends', 'supporters'],
  socials: {
    instagram: '@community_member',
    tiktok: '@community_member',
  },
  reach: 900,
};

const mockCampaigns = [
  { id: 'c-1', title: 'Westside Awareness Push', audience: 'supporters', status: 'active', progress: 42, goal: 100 },
  { id: 'c-2', title: 'Alumni Reconnect Week', audience: 'alumni', status: 'active', progress: 68, goal: 120 },
  { id: 'c-3', title: 'Local Brand Sampling', audience: 'brand', status: 'coming_soon', progress: 0, goal: 40 },
];

const mockSupportedHSAs = [
  { id: 'hsa-1', name: 'HSA 1', sport: 'Soccer', college: 'USC', relationship: 'Friend', visibility: 'Visible' },
  { id: 'hsa-2', name: 'HSA 2', sport: 'Volleyball', college: 'UCLA', relationship: 'Supporter', visibility: 'Visible' },
  { id: 'hsa-4', name: 'HSA 4', sport: 'Track & Field', college: 'LMU', relationship: 'Local Community', visibility: 'Hidden' },
];

const mockEvents = [
  { id: 'e-1', title: 'Community Meet & Greet', date: '2026-02-15', location: 'Westwood, CA', rsvps: 29 },
  { id: 'e-2', title: 'Alumni Mixer', date: '2026-03-02', location: 'Downtown LA, CA', rsvps: 41 },
];

const mockResources = [
  { id: 'res-1', title: 'How to Support HSAs on Social', tag: 'guide' },
  { id: 'res-2', title: 'Local Partners Offering Discounts', tag: 'perks' },
  { id: 'res-3', title: 'Volunteer Street Teams 101', tag: 'volunteer' },
];

const mockPartnerPerks = [
  { id: 'perk-1', title: 'Westwood Nutrition', detail: '10% off with NILH community badge', location: 'Westwood, CA' },
  { id: 'perk-2', title: 'Neighborhood Gym', detail: 'Free day pass for supporters', location: 'Culver City, CA' },
  { id: 'perk-3', title: 'Cafe Mi Tierra', detail: 'Buy 1 get 1 café con leche (select days)', location: 'Inglewood, CA' },
];

const CommunityMemberDashboard: React.FC = () => {
  const { toast } = useToast();
  const [refLink, setRefLink] = useState('https://nilhispanic.com/r/COMMUNITY-4829');
  const [activeTab, setActiveTab] = useState<'overview' | 'activation' | 'resources' | 'analytics'>('overview');
  const [resourceQuery, setResourceQuery] = useState('');

  const impactStats = useMemo(() => ({
    shares: 23,
    invitesSent: 17,
    signups: 6,
    eventRsvps: 4,
    badges: ['Early Supporter', 'Alumni Ally'],
  }), []);

  const filteredResources = useMemo(() => {
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return mockResources;
    return mockResources.filter(r => `${r.title} ${r.tag}`.toLowerCase().includes(q));
  }, [resourceQuery]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center text-nil-orange hover:underline">
            <ArrowLeft className="mr-2" size={18} /> Back to Home
          </Link>
          <Badge variant="secondary" className="bg-nil-light-blue/20 text-nil-navy">Community Member</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-nil-navy">Welcome, {mockMember.name}</h1>
        <p className="text-gray-600 mt-1">Help amplify your HSA community through campaigns, referrals, and events.</p>

        {/* Dashboard-style stats row (mirrors athlete dashboard patterns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">My HSAs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{mockSupportedHSAs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">My Shares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{impactStats.shares}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Referral Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{impactStats.signups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Event RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{impactStats.eventRsvps}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="mt-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activation">Campaigns & Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Snapshot */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-nil-navy">Your Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div><span className="font-medium text-nil-navy">City:</span> {mockMember.city}</div>
                  <div><span className="font-medium text-nil-navy">Categories:</span> {mockMember.categories.join(', ')}</div>
                  <div className="flex items-center gap-2"><Share2 size={16}/> Estimated Reach: <span className="font-medium text-nil-navy">{mockMember.reach.toLocaleString()}</span></div>
                  <div className="pt-1">
                    <div className="text-xs text-gray-500">Socials</div>
                    <div className="text-xs">Instagram: {mockMember.socials.instagram}</div>
                    <div className="text-xs">TikTok: {mockMember.socials.tiktok}</div>
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <div className="text-sm font-medium text-nil-navy">My Network</div>
                    <div className="text-xs text-gray-600">Connected HSAs: {mockSupportedHSAs.length} · Network categories: {mockMember.categories.length}</div>
                    <div className="flex flex-col gap-2 mt-2">
                      <Link to="/community/network" className="inline-block">
                        <Button size="sm" variant="outline">View Community Network</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast({ title: 'Mock', description: 'Updated network visibility preferences.' })}
                      >
                        Manage Visibility (Mock)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Activation */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><Rocket size={18}/> Quick Activation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="text-sm font-medium text-nil-navy">Your Referral Link</div>
                      <div className="text-xs text-gray-600 break-all mt-1">{refLink}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(refLink); toast({ title: 'Copied', description: 'Referral link copied.' }); } catch { toast({ title: 'Copy failed', description: 'Unable to copy.' }); } }}>Copy</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared to your socials.' })}>Share</Button>
                      </div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="text-sm font-medium text-nil-navy">Upcoming Event</div>
                      <div className="text-xs text-gray-600">{mockEvents[0].title} · {mockEvents[0].date} · {mockEvents[0].location}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'RSVP counted', description: 'Thanks for your interest!' })}>RSVP</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared event.' })}>Share</Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="text-sm font-medium text-nil-navy mb-2">My HSAs</div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {mockSupportedHSAs.map(hsa => (
                        <div key={hsa.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-nil-navy">{hsa.name}</div>
                              <div className="text-xs text-gray-600">{hsa.sport} · {hsa.college}</div>
                              <div className="text-xs text-gray-600">Relationship: {hsa.relationship} · Visibility: {hsa.visibility}</div>
                            </div>
                            <Badge variant="secondary" className="bg-orange-50 text-nil-orange">HSA</Badge>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Opened athlete profile preview.' })}>View</Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Sent a message (mock).' })}>Message</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CAMPAIGNS & EVENTS */}
          <TabsContent value="activation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><Target size={18}/> Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockCampaigns.map(c => (
                    <div key={c.id} className="border rounded-md p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-nil-navy truncate">{c.title}</div>
                          <div className="text-xs text-gray-600">Audience: {c.audience} · Status: {c.status}</div>
                        </div>
                        <div className="text-sm font-semibold text-nil-navy whitespace-nowrap">{c.progress}/{c.goal}</div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded mt-2">
                        <div className="h-2 bg-nil-orange rounded" style={{ width: `${Math.min(100, (c.progress / c.goal) * 100)}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Joined', description: 'You have joined this campaign (mock).' })}>Join</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Opened share assets.' })}>Get Assets</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Logged a share action.' })}>Mark Shared</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><Calendar size={18}/> Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockEvents.map(e => (
                    <div key={e.id} className="border rounded-md p-3">
                      <div className="text-sm font-medium text-nil-navy">{e.title}</div>
                      <div className="text-xs text-gray-600">{e.date} · {e.location}</div>
                      <div className="text-xs text-gray-600 mt-1">RSVPs: {e.rsvps}</div>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'RSVP counted', description: 'Thanks for your interest!' })}>RSVP</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared event.' })}>Share</Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium text-nil-navy">My Referral Link</div>
                    <div className="text-xs text-gray-600 break-all mt-1">{refLink}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(refLink); toast({ title: 'Copied', description: 'Referral link copied.' }); } catch { toast({ title: 'Copy failed', description: 'Unable to copy.' }); } }}>Copy</Button>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared referral link.' })}>Share</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RESOURCES */}
          <TabsContent value="resources" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><Users size={18}/> Resources Hub</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rq">Search resources</Label>
                    <Input id="rq" value={resourceQuery} onChange={(e) => setResourceQuery(e.target.value)} placeholder="Search guides, perks, volunteer opportunities..." />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredResources.map(r => (
                      <div key={r.id} className="border rounded-md p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-nil-navy">{r.title}</div>
                            <div className="text-xs text-gray-600 mt-1">Tag: {r.tag}</div>
                          </div>
                          <Badge variant="secondary" className="bg-nil-light-blue/20 text-nil-navy">NILH</Badge>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Opened', description: 'Resource opened (mock).' })}>Open</Button>
                          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Saved', description: 'Saved to your dashboard (mock).' })}>Save</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-nil-navy">NILH Social Highlights</div>
                    <div className="text-xs text-gray-600">Embedded Instagram/TikTok content would appear here as a curated feed.</div>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium text-nil-navy">Instagram Spotlight (Mock)</div>
                        <div className="text-xs text-gray-600 mt-1">Post preview + share CTA + tracking.</div>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Opened Instagram post.' })}>Open</Button>
                        </div>
                      </div>
                      <div className="border rounded-md p-3">
                        <div className="text-sm font-medium text-nil-navy">TikTok Spotlight (Mock)</div>
                        <div className="text-xs text-gray-600 mt-1">Video preview + campaign tie-in + share CTA.</div>
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Opened TikTok video.' })}>Open</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-nil-navy">Partner Perks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockPartnerPerks.map(p => (
                    <div key={p.id} className="border rounded-md p-3">
                      <div className="text-sm font-medium text-nil-navy">{p.title}</div>
                      <div className="text-xs text-gray-600">{p.location}</div>
                      <div className="text-xs text-gray-600 mt-1">{p.detail}</div>
                      <div className="mt-2">
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Opened partner details.' })}>View</Button>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium text-nil-navy">Upcoming Events</div>
                    <div className="text-xs text-gray-600">{mockEvents[0].title} · {mockEvents[0].date}</div>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => toast({ title: 'RSVP counted', description: 'Thanks for your interest!' })}>RSVP</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><BarChart3 size={18}/> Your Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 flex items-center gap-1"><Share2 size={14}/> Shares</div>
                    <div className="text-lg font-semibold text-nil-navy">{impactStats.shares}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Invites Sent</div>
                    <div className="text-lg font-semibold text-nil-navy">{impactStats.invitesSent}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Signups</div>
                    <div className="text-lg font-semibold text-nil-navy">{impactStats.signups}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Event RSVPs</div>
                    <div className="text-lg font-semibold text-nil-navy">{impactStats.eventRsvps}</div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="text-xs text-gray-500">Badges</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {impactStats.badges.map(b => (
                        <span key={b} className="text-xs bg-orange-50 text-nil-orange px-2 py-1 rounded">{b}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-nil-navy"><Award size={18}/> Level Up</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div>Complete actions to earn badges and boost your community impact.</div>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Share any campaign asset this week.</li>
                    <li>Invite 3 friends using your referral link.</li>
                    <li>RSVP to an upcoming event and bring a friend.</li>
                  </ul>
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => toast({ title: 'Mock', description: 'Tracking started.' })}>Start Tracking</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CommunityMemberDashboard;
