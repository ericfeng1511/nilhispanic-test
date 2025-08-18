import React from 'react';
import { StudentAthlete } from '@/types/studentAthlete';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, GraduationCap, Instagram, Twitter, TrendingUp, MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAthletes: StudentAthlete[];
}

interface AggregatedStats {
  totalAthletes: number;
  totalFollowers: number;
  instagramFollowers: number;
  tiktokFollowers: number;
  xFollowers: number;
  genderBreakdown: { male: number; female: number; other: number };
  yearBreakdown: Record<string, number>;
  sportBreakdown: Record<string, number>;
  collegeBreakdown: Record<string, number>;
  avgFollowersPerAthlete: number;
  topSports: Array<{ sport: string; count: number; followers: number }>;
  topColleges: Array<{ college: string; count: number; followers: number }>;
}

const calculateStats = (athletes: StudentAthlete[]): AggregatedStats => {
  const stats: AggregatedStats = {
    totalAthletes: athletes.length,
    totalFollowers: 0,
    instagramFollowers: 0,
    tiktokFollowers: 0,
    xFollowers: 0,
    genderBreakdown: { male: 0, female: 0, other: 0 },
    yearBreakdown: {},
    sportBreakdown: {},
    collegeBreakdown: {},
    avgFollowersPerAthlete: 0,
    topSports: [],
    topColleges: []
  };

  // Calculate totals and breakdowns
  athletes.forEach(athlete => {
    // Social media followers
    const instagramFollowers = athlete.instagram_followers || 0;
    const tiktokFollowers = athlete.tiktok_followers || 0;
    const xFollowers = athlete.x_followers || 0;
    const totalFollowers = athlete.total_followers || (instagramFollowers + tiktokFollowers + xFollowers);

    stats.totalFollowers += totalFollowers;
    stats.instagramFollowers += instagramFollowers;
    stats.tiktokFollowers += tiktokFollowers;
    stats.xFollowers += xFollowers;

    // Gender breakdown
    if (athlete.gender === 'M') stats.genderBreakdown.male++;
    else if (athlete.gender === 'F') stats.genderBreakdown.female++;
    else stats.genderBreakdown.other++;

    // Year breakdown
    stats.yearBreakdown[athlete.year] = (stats.yearBreakdown[athlete.year] || 0) + 1;

    // Sport breakdown
    stats.sportBreakdown[athlete.sport] = (stats.sportBreakdown[athlete.sport] || 0) + 1;

    // College breakdown
    stats.collegeBreakdown[athlete.college] = (stats.collegeBreakdown[athlete.college] || 0) + 1;
  });

  // Calculate average
  stats.avgFollowersPerAthlete = stats.totalAthletes > 0 ? Math.round(stats.totalFollowers / stats.totalAthletes) : 0;

  // Calculate top sports with follower counts
  stats.topSports = Object.entries(stats.sportBreakdown)
    .map(([sport, count]) => {
      const sportFollowers = athletes
        .filter(a => a.sport === sport)
        .reduce((sum, a) => sum + (a.total_followers || 0), 0);
      return { sport, count, followers: sportFollowers };
    })
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 5);

  // Calculate top colleges with follower counts
  stats.topColleges = Object.entries(stats.collegeBreakdown)
    .map(([college, count]) => {
      const collegeFollowers = athletes
        .filter(a => a.college === college)
        .reduce((sum, a) => sum + (a.total_followers || 0), 0);
      return { college, count, followers: collegeFollowers };
    })
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 5);

  return stats;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

const getYearLabel = (year: string): string => {
  const yearMap: Record<string, string> = {
    'FR': 'Freshman',
    'SO': 'Sophomore', 
    'JR': 'Junior',
    'SR': 'Senior',
    'GR': 'Graduate',
    'RFR': 'Redshirt Freshman'
  };
  return yearMap[year] || year;
};

export const SelectedStatsModal: React.FC<SelectedStatsModalProps> = ({
  isOpen,
  onClose,
  selectedAthletes
}) => {
  const stats = calculateStats(selectedAthletes);

  const escapeCsv = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const handleDownloadCsv = () => {
    // Define columns in a stable order
    const columns: Array<keyof StudentAthlete> = [
      'id',
      'profile_id',
      'name',
      'sport',
      'year',
      'college',
      'hometown',
      'gender',
      'photo',
      'instagram_handle',
      'instagram_followers',
      'tiktok_handle',
      'tiktok_followers',
      'x_handle',
      'x_followers',
      'total_followers',
      'total_sm_range',
      'created_at',
      'updated_at',
    ];

    const header = columns.join(',');
    const rows = selectedAthletes.map((ath) =>
      columns.map((c) => escapeCsv((ath as any)[c])).join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(["\uFEFF", csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fileName = `selected-athletes-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.csv`;
    link.href = url;
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-nil-orange" />
              Selected Athletes Statistics
              <Badge variant="secondary" className="ml-2">
                {stats.totalAthletes} athletes
              </Badge>
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              disabled={selectedAthletes.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nil-orange">
                  {formatNumber(stats.totalFollowers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: {formatNumber(stats.avgFollowersPerAthlete)} per athlete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                <Instagram className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-pink-600">
                  {formatNumber(stats.instagramFollowers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.instagramFollowers / stats.totalFollowers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">TikTok</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {formatNumber(stats.tiktokFollowers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.tiktokFollowers / stats.totalFollowers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">X (Twitter)</CardTitle>
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {formatNumber(stats.xFollowers)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((stats.xFollowers / stats.totalFollowers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Male</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stats.genderBreakdown.male}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((stats.genderBreakdown.male / stats.totalAthletes) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Female</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stats.genderBreakdown.female}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {((stats.genderBreakdown.female / stats.totalAthletes) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {stats.genderBreakdown.other > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Other</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{stats.genderBreakdown.other}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((stats.genderBreakdown.other / stats.totalAthletes) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Year Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Year Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.yearBreakdown)
                    .sort(([a], [b]) => {
                      const order = ['FR', 'SO', 'JR', 'SR', 'GR', 'RFR'];
                      return order.indexOf(a) - order.indexOf(b);
                    })
                    .map(([year, count]) => (
                      <div key={year} className="flex justify-between items-center">
                        <span>{getYearLabel(year)}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {((count / stats.totalAthletes) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Sports and Colleges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Sports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Sports by Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topSports.map(({ sport, count, followers }, index) => (
                    <div key={sport} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium capitalize">{sport}</span>
                        <Badge variant="outline" className="text-xs">
                          {count} athletes
                        </Badge>
                      </div>
                      <span className="font-bold text-nil-orange">
                        {formatNumber(followers)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Colleges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Top Colleges by Followers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topColleges.map(({ college, count, followers }, index) => (
                    <div key={college} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-sm">{college}</span>
                        <Badge variant="outline" className="text-xs">
                          {count} athletes
                        </Badge>
                      </div>
                      <span className="font-bold text-nil-orange">
                        {formatNumber(followers)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
