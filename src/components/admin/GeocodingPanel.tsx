import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Pause, RotateCcw } from 'lucide-react';
import { GeocodingService } from '@/services/geocodingService';

interface GeocodingStats {
  total: number;
  geocoded: number;
  remaining: number;
  percentage: number;
}

export const GeocodingPanel: React.FC = () => {
  const [stats, setStats] = useState<GeocodingStats | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCollege, setCurrentCollege] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const shouldContinueRef = React.useRef(true);

  const loadStats = async () => {
    try {
      console.log('📊 Loading geocoding stats...');
      const newStats = await GeocodingService.getGeocodingStats();
      console.log('📈 Stats loaded:', newStats);
      setStats(newStats);
      setError(null);
    } catch (err) {
      console.error('💥 Error loading stats:', err);
      setError(`Failed to load geocoding stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const startGeocoding = async () => {
    console.log('🚀 Start geocoding button clicked!');
    
    if (isGeocoding) {
      console.log('⚠️ Already geocoding, returning');
      return;
    }
    
    console.log('📍 Setting geocoding state...');
    setIsGeocoding(true);
    setError(null);
    setProgress(0);
    
    // Reset the ref to allow geocoding
    shouldContinueRef.current = true;
    
    try {
      console.log('🔍 Getting colleges without coordinates...');
      // Get colleges without coordinates
      const collegesWithoutCoords = await GeocodingService.getCollegesWithoutCoordinates();
      console.log('📊 Colleges without coordinates:', collegesWithoutCoords.length);
      
      if (collegesWithoutCoords.length === 0) {
        console.log('✅ All colleges already have coordinates!');
        setError('All colleges already have coordinates!');
        setIsGeocoding(false);
        return;
      }

      const total = collegesWithoutCoords.length;
      let completed = 0;
      console.log(`🎯 Starting to geocode ${total} colleges...`);

      for (const college of collegesWithoutCoords) {
        if (!shouldContinueRef.current) {
          console.log('⏹️ Geocoding stopped by user');
          break;
        }

        console.log(`🏫 Geocoding: ${college.name}`);
        setCurrentCollege(college.name);
        
        try {
          const success = await GeocodingService.geocodeCollegeById(college.id);
          if (success) {
            console.log(`✅ Geocoded: ${college.name}`);
          } else {
            console.log(`❌ Failed to geocode: ${college.name}`);
          }
        } catch (err) {
          console.error(`💥 Error geocoding ${college.name}:`, err);
        }

        completed++;
        const newProgress = Math.round((completed / total) * 100);
        console.log(`📈 Progress: ${newProgress}% (${completed}/${total})`);
        setProgress(newProgress);

        // Respect rate limits - wait 1.5 seconds between requests
        if (completed < total) {
          console.log('⏳ Waiting 1.5 seconds...');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      console.log('🎉 Geocoding process completed!');
      setCurrentCollege('');
      await loadStats(); // Refresh stats
      
    } catch (err) {
      console.error('💥 Error during geocoding process:', err);
      setError(`Error during geocoding: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      console.log('🏁 Cleaning up geocoding state...');
      shouldContinueRef.current = false;
      setIsGeocoding(false);
      setProgress(0);
    }
  };

  const stopGeocoding = () => {
    console.log('🛑 Stop geocoding requested');
    shouldContinueRef.current = false;
    setIsGeocoding(false);
    setCurrentCollege('');
    setProgress(0);
  };

  React.useEffect(() => {
    console.log('🔄 GeocodingPanel mounted, loading initial stats...');
    loadStats();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          College Geocoding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Colleges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.geocoded}</div>
              <div className="text-sm text-muted-foreground">Geocoded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.remaining}</div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.percentage}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        )}

        {stats && stats.percentage < 100 && (
          <div className="space-y-2">
            <Progress value={stats.percentage} className="w-full" />
            <div className="text-sm text-muted-foreground text-center">
              {stats.geocoded} of {stats.total} colleges have coordinates
            </div>
          </div>
        )}

        {isGeocoding && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-center">
              {currentCollege && (
                <Badge variant="outline" className="animate-pulse">
                  Geocoding: {currentCollege}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Progress: {progress}% • Rate limited to 1 request per 1.5 seconds
            </div>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isGeocoding ? (
            <>
              <Button 
                onClick={startGeocoding} 
                disabled={!stats || stats.remaining === 0}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Geocoding
              </Button>
              <Button 
                onClick={loadStats} 
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </>
          ) : (
            <Button 
              onClick={stopGeocoding} 
              variant="destructive"
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop Geocoding
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Uses OpenStreetMap Nominatim API (free, rate-limited)</p>
          <p>• Geocoding adds latitude/longitude for map display</p>
          <p>• Process can be stopped and resumed at any time</p>
        </div>
      </CardContent>
    </Card>
  );
};
