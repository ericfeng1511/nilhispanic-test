import { GeocodingService } from '../services/geocodingService';

/**
 * Script to geocode colleges and populate their coordinates
 * Run this script to add latitude/longitude to colleges in the database
 */
async function geocodeColleges() {
  try {
    console.log('🌍 Starting college geocoding process...');
    
    // Get geocoding stats first
    const stats = await GeocodingService.getGeocodingStats();
    console.log('📊 Geocoding Stats:', stats);
    
    if (stats.remaining === 0) {
      console.log('🎉 All colleges already have coordinates!');
      return;
    }
    
    console.log(`📍 Need to geocode ${stats.remaining} colleges`);
    console.log('⚠️  This will take time due to API rate limits (1 request per second)');
    console.log(`⏱️  Estimated time: ${Math.ceil(stats.remaining / 60)} minutes`);
    
    // Start batch geocoding
    await GeocodingService.geocodeAllColleges();
    
    // Get final stats
    const finalStats = await GeocodingService.getGeocodingStats();
    console.log('🎉 Geocoding complete!');
    console.log('📊 Final Stats:', finalStats);
    
  } catch (error) {
    console.error('💥 Error during geocoding:', error);
  }
}

// Run the script
geocodeColleges();
