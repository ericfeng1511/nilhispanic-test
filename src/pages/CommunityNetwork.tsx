import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Layers3, Map, PieChart, Users, Share2, Globe2, TrendingUp, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Category = 'family' | 'friends' | 'supporters' | 'alumni' | 'brand';

interface MemberNode {
  id: string;
  name: string;
  category: Category;
  city?: string;
  reach?: number; // combined follower count (mock)
}

interface HSANode {
  id: string;
  name: string;
  sport: string;
  college: string;
}

interface Edge {
  source: string; // node id
  target: string; // node id
}

// Mock dataset: Multiple HSAs with a surrounding community
const MOCK_HSAS: HSANode[] = [
  { id: 'hsa-1', name: 'HSA 1', sport: 'Soccer', college: 'USC' },
  { id: 'hsa-2', name: 'HSA 2', sport: 'Volleyball', college: 'UCLA' },
  { id: 'hsa-3', name: 'HSA 3', sport: 'Basketball', college: 'Cal State LA' },
  { id: 'hsa-4', name: 'HSA 4', sport: 'Track & Field', college: 'LMU' }
];

const MOCK_MEMBERS: MemberNode[] = [
  // Family
  { id: 'm-1', name: 'Carla Rivera', category: 'family', city: 'Los Angeles, CA', reach: 250 },
  { id: 'm-2', name: 'Diego Rivera', category: 'family', city: 'Los Angeles, CA', reach: 120 },
  { id: 'm-12', name: 'Lopez Family', category: 'family', city: 'Westwood, CA', reach: 600 },
  { id: 'm-15', name: 'Ortiz Family', category: 'family', city: 'East LA, CA', reach: 500 },
  { id: 'm-16', name: 'Martinez Cousins', category: 'family', city: 'Long Beach, CA', reach: 420 },

  // Friends/Peers
  { id: 'm-3', name: 'Team Captain (USC)', category: 'friends', city: 'Los Angeles, CA', reach: 1800 },
  { id: 'm-7', name: 'Paula Gomez', category: 'friends', city: 'Santa Monica, CA', reach: 900 },
  { id: 'm-13', name: 'Teammate (UCLA)', category: 'friends', city: 'Westwood, CA', reach: 1400 },
  { id: 'm-17', name: 'Point Guard (CSULA)', category: 'friends', city: 'Los Angeles, CA', reach: 1600 },
  { id: 'm-18', name: 'Sprinters Club', category: 'friends', city: 'Inglewood, CA', reach: 1100 },

  // Supporters / Fans
  { id: 'm-4', name: 'Local Fans Group', category: 'supporters', city: 'Pasadena, CA', reach: 5200 },
  { id: 'm-8', name: 'Rivera Family Friends', category: 'supporters', city: 'Burbank, CA', reach: 1300 },
  { id: 'm-11', name: 'UCLA Fan Club', category: 'supporters', city: 'Westwood, CA', reach: 3900 },
  { id: 'm-19', name: 'LA Community Runners', category: 'supporters', city: 'Los Angeles, CA', reach: 2500 },
  { id: 'm-20', name: 'Eastside Sports Fans', category: 'supporters', city: 'Boyle Heights, CA', reach: 2100 },

  // Alumni / Groups
  { id: 'm-5', name: 'Hispanic Alumni LA', category: 'alumni', city: 'Los Angeles, CA', reach: 3400 },
  { id: 'm-9', name: 'Westside Alumni', category: 'alumni', city: 'Santa Monica, CA', reach: 2700 },
  { id: 'm-21', name: 'USC Alumni Assoc', category: 'alumni', city: 'Los Angeles, CA', reach: 4300 },
  { id: 'm-22', name: 'UCLA Latinx Alumni', category: 'alumni', city: 'Westwood, CA', reach: 3800 },

  // Brands / Local Businesses
  { id: 'm-6', name: 'Cafe Mi Tierra', category: 'brand', city: 'Inglewood, CA', reach: 2200 },
  { id: 'm-10', name: 'Brand Rep (Athleto)', category: 'brand', city: 'Los Angeles, CA', reach: 4100 },
  { id: 'm-14', name: 'Neighborhood Gym', category: 'brand', city: 'Culver City, CA', reach: 1200 },
  { id: 'm-23', name: 'LA Sportswear Co.', category: 'brand', city: 'Downtown LA, CA', reach: 3100 },
  { id: 'm-24', name: 'Westwood Nutrition', category: 'brand', city: 'Westwood, CA', reach: 1700 },
  { id: 'm-25', name: 'Boyle Heights Market', category: 'brand', city: 'Boyle Heights, CA', reach: 1500 },
  { id: 'm-26', name: 'Latinx Fitness App', category: 'brand', city: 'Remote', reach: 6200 },
];

const MOCK_EDGES: Edge[] = [
  // Alex connections
  { source: 'hsa-1', target: 'm-1' },
  { source: 'hsa-1', target: 'm-2' },
  { source: 'hsa-1', target: 'm-3' },
  { source: 'hsa-1', target: 'm-4' },
  { source: 'hsa-1', target: 'm-5' },
  { source: 'hsa-1', target: 'm-6' },
  { source: 'hsa-1', target: 'm-7' },
  { source: 'hsa-1', target: 'm-8' },
  { source: 'hsa-1', target: 'm-21' },

  // María connections
  { source: 'hsa-2', target: 'm-11' },
  { source: 'hsa-2', target: 'm-12' },
  { source: 'hsa-2', target: 'm-13' },
  { source: 'hsa-2', target: 'm-14' },
  { source: 'hsa-2', target: 'm-22' },
  { source: 'hsa-2', target: 'm-24' },

  // Javier connections
  { source: 'hsa-3', target: 'm-15' },
  { source: 'hsa-3', target: 'm-17' },
  { source: 'hsa-3', target: 'm-19' },
  { source: 'hsa-3', target: 'm-20' },
  { source: 'hsa-3', target: 'm-23' },
  { source: 'hsa-3', target: 'm-25' },

  // Sofia connections
  { source: 'hsa-4', target: 'm-16' },
  { source: 'hsa-4', target: 'm-18' },
  { source: 'hsa-4', target: 'm-19' },
  { source: 'hsa-4', target: 'm-24' },
  { source: 'hsa-4', target: 'm-26' },

  // Cross/Shared community and brand relationships
  { source: 'm-5', target: 'hsa-2' },
  { source: 'm-9', target: 'hsa-2' },
  { source: 'm-21', target: 'hsa-1' },
  { source: 'm-22', target: 'hsa-2' },
  { source: 'm-24', target: 'hsa-2' },
  { source: 'm-26', target: 'hsa-4' },
  { source: 'm-26', target: 'hsa-1' },

  // Member-to-member edges (friends, alumni <> supporters, brand <> group)
  { source: 'm-3', target: 'm-5' },
  { source: 'm-3', target: 'm-4' },
  { source: 'm-7', target: 'm-8' },
  { source: 'm-11', target: 'm-22' },
  { source: 'm-19', target: 'm-18' },
  { source: 'm-20', target: 'm-25' },
  { source: 'm-23', target: 'm-21' },
  { source: 'm-24', target: 'm-22' },
];

const CATEGORY_COLORS: Record<Category, string> = {
  family: '#fb923c', // orange-400
  friends: '#38bdf8', // sky-400
  supporters: '#10b981', // emerald-500
  alumni: '#818cf8', // indigo-400
  brand: '#f43f5e' // rose-500
};

const categoryLabel = (c: Category) => {
  switch (c) {
    case 'family': return 'Family';
    case 'friends': return 'Friends/Peers';
    case 'supporters': return 'Supporters/Fans';
    case 'alumni': return 'Alumni';
    case 'brand': return 'Brand/Rep';
  }
};

// Simple radial layout for mock graph (presentable but deterministic)
const useRadialLayout = (
  hsas: HSANode[],
  members: MemberNode[],
  edges: Edge[],
  width: number,
  height: number,
) => {
  return useMemo(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const hsaRadius = Math.min(width, height) * 0.20;
    const outerRadius = Math.min(width, height) * 0.44;

    // Deterministic pseudo-random (seeded by string) for stable jitter
    const seeded = (s: string) => {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      // Map to [0,1)
      return (h >>> 0) / 4294967296;
    };

    // Place HSAs around a small circle
    const hsaPositions: Record<string, { x: number; y: number }> = {};
    hsas.forEach((h, i) => {
      const baseAngle = (i / hsas.length) * Math.PI * 2 - Math.PI / 2;
      // Add jitter to angle and radial distance to avoid perfect circle
      const jitterA = (seeded(h.id + '-a') - 0.5) * (Math.PI / 10); // up to ~18°
      const jitterR = 1 + (seeded(h.id + '-r') - 0.5) * 0.25; // ±12.5%
      const angle = baseAngle + jitterA;
      const r = hsaRadius * jitterR;
      hsaPositions[h.id] = { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
    });

    // Group members by category and spread by wedge
    const categories: Category[] = ['family', 'friends', 'supporters', 'alumni', 'brand'];
    const grouped: Record<Category, MemberNode[]> = {
      family: [], friends: [], supporters: [], alumni: [], brand: []
    };
    members.forEach(m => grouped[m.category].push(m));

    const memberPositions: Record<string, { x: number; y: number }> = {};
    // Allocate wedge sizes proportionally to member counts with small gaps
    const totalMembers = categories.reduce((acc, c) => acc + grouped[c].length, 0) || 1;
    const gap = Math.PI / 36; // ~5° gap between categories
    const totalGap = gap * categories.length;
    const fullSpan = Math.PI * 2 - totalGap;
    let current = -Math.PI; // start from left for asymmetry
    categories.forEach((cat) => {
      const list = grouped[cat];
      const portion = list.length / totalMembers;
      const span = Math.max(fullSpan * portion, Math.PI / 18); // minimum ~10°
      const startAngle = current;
      const endAngle = current + span;
      // Place members with angle jitter and varied radius bands
      list.forEach((m, i) => {
        const baseT = list.length > 1 ? i / (list.length - 1) : 0.5;
        const jA = (seeded(m.id + '-a') - 0.5) * (span / 6);
        const angle = startAngle + baseT * span + jA;
        const ringT = 0.55 + (seeded(m.id + '-r') * 0.40); // 55%..95% of outerRadius
        const r = outerRadius * ringT;
        memberPositions[m.id] = { x: centerX + r * Math.cos(angle), y: centerY + r * Math.sin(angle) };
      });
      current = endAngle + gap;
    });

    return { hsaPositions, memberPositions };
  }, [hsas, members, edges, width, height]);
};

const Legend: React.FC = () => (
  <div className="flex flex-wrap gap-3">
    {(['family','friends','supporters','alumni','brand'] as Category[]).map(cat => (
      <div key={cat} className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
        <span className="text-sm text-gray-700">{categoryLabel(cat)}</span>
      </div>
    ))}
  </div>
);

const CommunityNetwork: React.FC = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'graph' | 'geo' | 'proportional'>('graph');
  const [activeCategories, setActiveCategories] = useState<Record<Category, boolean>>({
    family: true,
    friends: true,
    supporters: true,
    alumni: true,
    brand: true,
  });

  // Activation Center mock state
  const [activationTab, setActivationTab] = useState<'campaigns' | 'referrals' | 'events'>('campaigns');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState('Local Community Drive');
  const [newCampaignGoal, setNewCampaignGoal] = useState(100);
  const [newCampaignAudience, setNewCampaignAudience] = useState('supporters');

  const [campaigns, setCampaigns] = useState<Array<{ id: string; title: string; audience: string; progress: number; goal: number }>>([
    { id: 'c-1', title: 'Westside Awareness Push', audience: 'supporters', progress: 42, goal: 100 },
    { id: 'c-2', title: 'Alumni Reconnect Week', audience: 'alumni', progress: 68, goal: 120 },
    { id: 'c-3', title: 'Local Brand Sampling', audience: 'brand', progress: 25, goal: 40 },
  ]);
  const [referrals, setReferrals] = useState<Array<{ id: string; label: string; link: string; clicks: number; signups: number }>>([
    { id: 'r-1', label: 'General Invite', link: 'https://nilhispanic.com/r/HSA-INVITE-123', clicks: 124, signups: 37 },
    { id: 'r-2', label: 'Alumni Outreach', link: 'https://nilhispanic.com/r/ALUMNI-REACH-55', clicks: 86, signups: 22 },
  ]);
  const [events, setEvents] = useState<Array<{ id: string; title: string; date: string; location: string; rsvps: number }>>([
    { id: 'e-1', title: 'Community Meet & Greet', date: '2026-02-15', location: 'Westwood, CA', rsvps: 29 },
    { id: 'e-2', title: 'Alumni Mixer', date: '2026-03-02', location: 'Downtown LA, CA', rsvps: 41 },
  ]);

  const filteredMembers = useMemo(() =>
    MOCK_MEMBERS.filter(m => activeCategories[m.category])
  , [activeCategories]);

  const visibleEdges = useMemo(() =>
    MOCK_EDGES.filter(e => {
      const srcIsHsa = e.source.startsWith('hsa');
      const tgtIsHsa = e.target.startsWith('hsa');
      // Keep edges where member side is visible
      if (srcIsHsa && !tgtIsHsa) {
        const m = filteredMembers.find(x => x.id === e.target);
        return !!m;
      }
      if (tgtIsHsa && !srcIsHsa) {
        const m = filteredMembers.find(x => x.id === e.source);
        return !!m;
      }
      // Member-to-member edges: show only if both members are visible
      if (!srcIsHsa && !tgtIsHsa) {
        const srcVisible = filteredMembers.some(x => x.id === e.source);
        const tgtVisible = filteredMembers.some(x => x.id === e.target);
        return srcVisible && tgtVisible;
      }
      // HSA-to-HSA (not used) or fallback
      return true;
    })
  , [filteredMembers]);

  const width = 980; // content SVG size (larger for more spacing)
  const height = 640;
  const { hsaPositions, memberPositions } = useRadialLayout(MOCK_HSAS, filteredMembers, visibleEdges, width, height);

  const totalMembers = filteredMembers.length;
  const totalReach = filteredMembers.reduce((acc, m) => acc + (m.reach || 0), 0) + 8500; // add HSAs mock reach
  const sharedConnections = 2; // mock stat

  const toggleCategory = (c: Category) =>
    setActiveCategories(prev => ({ ...prev, [c]: !prev[c] }));

  // Dashboard-style stats (mirroring Athlete/Admin layouts)
  const categoriesActive = Object.values(activeCategories).filter(Boolean).length;
  const campaignsActive = campaigns.length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/athlete/dashboard" className="inline-flex items-center text-nil-orange hover:underline">
            <ArrowLeft className="mr-2" size={18} /> Back to Dashboard
          </Link>
        </div>

        <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-nil-navy">HSA Social Network / Reach Amplification</h1>
            <p className="text-gray-600 mt-1">Turn each HSA’s support network into a measurable, activatable marketing asset.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-nil-light-blue/20 text-nil-navy">Prototype</Badge>
            <Badge variant="secondary" className="bg-orange-50 text-nil-orange">Mock Data</Badge>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Community Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Combined Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{totalReach.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Categories Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{categoriesActive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Campaigns Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-nil-navy">{campaignsActive}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-nil-navy"><Filter size={18}/> Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(['family','friends','supporters','alumni','brand'] as Category[]).map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={activeCategories[cat]}
                      onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded border-gray-300 text-nil-orange focus:ring-nil-orange"
                    />
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                      {categoryLabel(cat)}
                    </span>
                  </label>
                ))}
                <div className="pt-2">
                  <small className="text-gray-500">Additional filters (geo, influence, verified) can be added here.</small>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-nil-navy"><Layers3 size={18}/> View Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-full">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="graph" className="text-xs">Graph</TabsTrigger>
                    <TabsTrigger value="geo" className="text-xs">Geo</TabsTrigger>
                    <TabsTrigger value="proportional" className="text-xs">Proportional</TabsTrigger>
                  </TabsList>
                  <TabsContent value="graph">
                    <p className="text-sm text-gray-600 mt-2">Interactive graph view shown on the right.</p>
                  </TabsContent>
                  <TabsContent value="geo">
                    <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <Map size={16}/> Coming soon: map clustering & heatmaps.
                    </div>
                  </TabsContent>
                  <TabsContent value="proportional">
                    <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <PieChart size={16}/> Coming soon: node size by influence.
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-nil-navy">Legend</CardTitle>
              </CardHeader>
              <CardContent>
                <Legend />
              </CardContent>
            </Card>
          </div>

          {/* Center: Graph */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-nil-navy"><Users size={18}/> Network Graph</CardTitle>
                <div className="text-xs text-gray-500">Interactive prototype (hover nodes)</div>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto">
                  <svg width={width} height={height} className="bg-white rounded-md border border-gray-200">
                    {/* Edges */}
                    {visibleEdges.map((e, idx) => {
                      const sPos = e.source.startsWith('hsa') ? hsaPositions[e.source] : memberPositions[e.source];
                      const tPos = e.target.startsWith('hsa') ? hsaPositions[e.target] : memberPositions[e.target];
                      if (!sPos || !tPos) return null;
                      return (
                        <line key={idx} x1={sPos.x} y1={sPos.y} x2={tPos.x} y2={tPos.y} stroke="#e5e7eb" strokeWidth={1.5} />
                      );
                    })}
                    {/* HSA Nodes */}
                    {MOCK_HSAS.map(h => {
                      const pos = hsaPositions[h.id];
                      return (
                        <g key={h.id}>
                          <circle cx={pos.x} cy={pos.y} r={24} fill="#0f172a" />
                          <text x={pos.x} y={pos.y + 40} textAnchor="middle" className="fill-nil-navy" style={{ fontSize: 12, fontWeight: 600 }}>{h.name}</text>
                          <text x={pos.x} y={pos.y + 56} textAnchor="middle" className="fill-gray-600" style={{ fontSize: 11 }}>{h.sport} · {h.college}</text>
                        </g>
                      );
                    })}
                    {/* Member Nodes */}
                    {filteredMembers.map(m => {
                      const pos = memberPositions[m.id];
                      const color = CATEGORY_COLORS[m.category];
                      const size = Math.max(6, Math.min(14, Math.round(((m.reach || 300) / 5200) * 14)));
                      return (
                        <g key={m.id}>
                          <TooltipProvider>
                            <foreignObject x={pos.x - 12} y={pos.y - 12} width={24} height={24}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-3 h-3" />
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="text-sm font-medium">{m.name}</div>
                                  <div className="text-xs text-gray-600">{categoryLabel(m.category)}{m.city ? ` · ${m.city}` : ''}</div>
                                  {typeof m.reach === 'number' && (
                                    <div className="text-xs text-gray-600 flex items-center gap-1 mt-1"><Share2 size={12}/> Reach: {m.reach.toLocaleString()}</div>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </foreignObject>
                          </TooltipProvider>
                          <circle cx={pos.x} cy={pos.y} r={size} fill={color} opacity={0.9} stroke="#ffffff" strokeWidth={1} />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-nil-navy">Insights & Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Shared community detected between HSAs (alumni group ties and brand reps).</li>
                  <li>Top-of-funnel reach estimated via combined social reach and group sizes.</li>
                  <li>Next: add geo heatmaps and proportional sizing for influence scoring.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right: Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-nil-navy">Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">Community Members</div>
                  <div className="text-lg font-semibold text-nil-navy">{totalMembers}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 flex items-center gap-1"><Share2 size={14}/> Combined Reach</div>
                  <div className="text-lg font-semibold text-nil-navy">{totalReach.toLocaleString()}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 flex items-center gap-1"><Users size={14}/> Shared Connections</div>
                  <div className="text-lg font-semibold text-nil-navy">{sharedConnections}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 flex items-center gap-1"><Globe2 size={14}/> Geographic Spread</div>
                  <div className="text-lg font-semibold text-nil-navy">Greater LA</div>
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs text-gray-500">Future: verified reach, engagement quality, activation rate.</div>
                </div>
              </CardContent>
            </Card>

            {/* Activation Center */}
            <Card>
              <CardHeader>
                <CardTitle className="text-nil-navy">Activation Center</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activationTab} onValueChange={(v: any) => setActivationTab(v)}>
                  <TabsList className="grid grid-cols-3 mb-3">
                    <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
                    <TabsTrigger value="referrals" className="text-xs">Referrals</TabsTrigger>
                    <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
                  </TabsList>

                  {/* Campaigns Tab */}
                  <TabsContent value="campaigns" className="space-y-3">
                    <Button className="bg-nil-orange hover:bg-orange-500" onClick={() => setIsCreateOpen(true)}>
                      Create Campaign
                    </Button>
                    <div className="space-y-3">
                      {campaigns.map(c => (
                        <div key={c.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-nil-navy">{c.title}</div>
                              <div className="text-xs text-gray-600">Audience: {c.audience} · Goal: {c.goal}</div>
                            </div>
                            <div className="text-sm font-semibold text-nil-navy">{c.progress}/{c.goal}</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded mt-2">
                            <div className="h-2 bg-nil-orange rounded" style={{ width: `${Math.min(100, (c.progress / c.goal) * 100)}%` }} />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Launched campaign assets.' })}>Launch</Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared to selected segments.' })}>Share</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Referrals Tab */}
                  <TabsContent value="referrals" className="space-y-3">
                    {referrals.map(r => (
                      <div key={r.id} className="border rounded-md p-3">
                        <div className="text-sm font-medium text-nil-navy">{r.label}</div>
                        <div className="text-xs text-gray-600 break-all">{r.link}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-600">Clicks: {r.clicks} · Signups: {r.signups}</div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(r.link); toast({ title: 'Copied', description: 'Referral link copied to clipboard.' }); } catch { toast({ title: 'Copy failed', description: 'Unable to copy link.' }); } }}>Copy</Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Shared referral link.' })}>Share</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" onClick={() => {
                      const id = `r-${Date.now()}`;
                      const link = `https://nilhispanic.com/r/COMMUNITY-${Math.floor(Math.random()*9999)}`;
                      setReferrals(prev => [...prev, { id, label: 'New Link', link, clicks: 0, signups: 0 }]);
                      toast({ title: 'Referral created', description: 'New referral link ready.' });
                    }}>New Referral Link</Button>
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="space-y-3">
                    {events.map(ev => (
                      <div key={ev.id} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-nil-navy">{ev.title}</div>
                            <div className="text-xs text-gray-600">{ev.date} · {ev.location}</div>
                          </div>
                          <div className="text-sm font-semibold text-nil-navy">RSVPs: {ev.rsvps}</div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => { setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, rsvps: e.rsvps + 1 } : e)); toast({ title: 'RSVP counted', description: 'Thanks for your interest!' }); }}>RSVP</Button>
                          <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mock', description: 'Event shared to supporters.' })}>Share</Button>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" onClick={() => { const id = `e-${Date.now()}`; setEvents(prev => [...prev, { id, title: 'Pop-up Activation', date: '2026-04-05', location: 'Santa Monica, CA', rsvps: 0 }]); toast({ title: 'Event created', description: 'New event added to calendar.' }); }}>New Event</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            {/* Create Campaign Dialog (mock) */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Campaign (Mock)</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="c-title">Title</Label>
                    <Input id="c-title" value={newCampaignTitle} onChange={(e) => setNewCampaignTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="c-goal">Goal (actions)</Label>
                    <Input id="c-goal" type="number" value={newCampaignGoal} onChange={(e) => setNewCampaignGoal(parseInt(e.target.value || '0'))} />
                  </div>
                  <div>
                    <Label htmlFor="c-aud">Audience</Label>
                    <Input id="c-aud" value={newCampaignAudience} onChange={(e) => setNewCampaignAudience(e.target.value)} placeholder="supporters / alumni / brand" />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button className="bg-nil-orange hover:bg-orange-500" onClick={() => {
                      const id = `c-${Date.now()}`;
                      setCampaigns(prev => [{ id, title: newCampaignTitle, audience: newCampaignAudience, progress: 0, goal: Math.max(1, Number(newCampaignGoal) || 1) }, ...prev]);
                      setIsCreateOpen(false);
                      toast({ title: 'Campaign created', description: 'Your campaign draft is ready.' });
                    }}>Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityNetwork;
