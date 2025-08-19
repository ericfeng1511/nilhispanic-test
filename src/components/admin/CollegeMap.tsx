import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Users, ExternalLink } from 'lucide-react';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface College {
  id: number;
  name: string;
  url?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  student_count?: number;
  division?: string;
}

interface CollegeMapProps {
  colleges: College[];
  isLoading?: boolean;
  onCollegeSelect?: (college: College) => void;
}

const CollegeMap: React.FC<CollegeMapProps> = ({ 
  colleges, 
  isLoading = false, 
  onCollegeSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on US
    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795], // Geographic center of US
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create marker layer group
    const markersGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersRef.current = markersGroup;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Update markers when colleges data changes
  useEffect(() => {
    if (!mapReady || !markersRef.current || !colleges.length) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Filter colleges based on search term
    const filteredColleges = colleges.filter(college =>
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add markers for colleges with coordinates
    filteredColleges.forEach(college => {
      if (college.latitude && college.longitude) {
        // Create custom icon based on student count or division
        const getMarkerColor = (studentCount?: number) => {
          if (!studentCount) return '#6b7280'; // gray
          if (studentCount >= 50) return '#dc2626'; // red - high
          if (studentCount >= 20) return '#ea580c'; // orange - medium
          if (studentCount >= 10) return '#ca8a04'; // yellow - low
          return '#16a34a'; // green - very low
        };

        const markerHtml = `
          <div style="
            background-color: ${getMarkerColor(college.student_count)};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${college.student_count || ''}
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-college-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([college.latitude, college.longitude], {
          icon: customIcon
        });

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${college.name}
            </h3>
            ${college.city && college.state ? `
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
                📍 ${college.city}, ${college.state}
              </p>
            ` : ''}
            ${college.student_count ? `
              <p style="margin: 0 0 4px 0; font-size: 12px;">
                👥 ${college.student_count} student athletes
              </p>
            ` : ''}
            ${college.division ? `
              <p style="margin: 0 0 8px 0; font-size: 12px;">
                🏆 ${college.division}
              </p>
            ` : ''}
            ${college.url ? `
              <a href="${college.url}" target="_blank" rel="noopener noreferrer" 
                 style="font-size: 12px; color: #2563eb; text-decoration: none;">
                🔗 Visit Website
              </a>
            ` : ''}
          </div>
        `;

        marker.bindPopup(popupContent);

        // Handle marker click
        marker.on('click', () => {
          setSelectedCollege(college);
          if (onCollegeSelect) {
            onCollegeSelect(college);
          }
        });

        markersRef.current?.addLayer(marker);
      }
    });

    // Fit map to show all markers if we have filtered results
    if (filteredColleges.length > 0 && filteredColleges.length < colleges.length) {
      const group = new L.featureGroup(markersRef.current?.getLayers() || []);
      if (group.getBounds().isValid()) {
        mapInstanceRef.current?.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [colleges, searchTerm, mapReady, onCollegeSelect]);

  // Reset map view
  const resetMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([39.8283, -98.5795], 4);
    }
    setSearchTerm('');
    setSelectedCollege(null);
  };

  // Zoom to college
  const zoomToCollege = (college: College) => {
    if (college.latitude && college.longitude && mapInstanceRef.current) {
      mapInstanceRef.current.setView([college.latitude, college.longitude], 10);
      setSelectedCollege(college);
    }
  };

  const collegesWithCoords = colleges.filter(c => c.latitude && c.longitude);
  const collegesWithoutCoords = colleges.filter(c => !c.latitude || !c.longitude);

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            College Locations Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search colleges by name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={resetMapView} variant="outline">
              Reset View
            </Button>
          </div>

          {/* Map Statistics */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Badge variant="secondary">
              📍 {collegesWithCoords.length} colleges mapped
            </Badge>
            <Badge variant="outline">
              ❓ {collegesWithoutCoords.length} need coordinates
            </Badge>
            <Badge variant="outline">
              👥 {colleges.reduce((sum, c) => sum + (c.student_count || 0), 0)} total athletes
            </Badge>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>50+ athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-600"></div>
              <span>20-49 athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
              <span>10-19 athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>1-9 athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>No athletes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading colleges...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected College Info */}
      {selectedCollege && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedCollege.name}</span>
              {selectedCollege.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedCollege.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCollege.city && selectedCollege.state && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{selectedCollege.city}, {selectedCollege.state}</p>
                </div>
              )}
              {selectedCollege.student_count && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Student Athletes</p>
                  <p className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedCollege.student_count}
                  </p>
                </div>
              )}
              {selectedCollege.division && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Division</p>
                  <p>{selectedCollege.division}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Colleges without coordinates - Hidden */}
      {/* 
      {collegesWithoutCoords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600">
              Colleges Missing Coordinates ({collegesWithoutCoords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {collegesWithoutCoords.slice(0, 20).map(college => (
                <div key={college.id} className="text-sm p-2 bg-gray-50 rounded">
                  {college.name}
                  {college.student_count && (
                    <span className="ml-2 text-gray-500">
                      ({college.student_count} athletes)
                    </span>
                  )}
                </div>
              ))}
              {collegesWithoutCoords.length > 20 && (
                <div className="text-sm text-gray-500 p-2">
                  ... and {collegesWithoutCoords.length - 20} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  );
};

export default CollegeMap;
