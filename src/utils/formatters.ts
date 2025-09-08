/**
 * Utility functions for formatting data consistently across the application
 */

/**
 * Format academic year abbreviation to full name with abbreviation
 * @param year - The year abbreviation (FR, SO, JR, SR, GR, RFR)
 * @returns Formatted string like "Freshman (FR)" or "N/A" for null/empty values
 */
export const formatAcademicYear = (year: string | null | undefined): string => {
  // Handle null, undefined, empty string, or whitespace-only values
  if (!year || year.trim() === '') {
    return 'N/A';
  }

  const yearMap: Record<string, string> = {
    'FR': 'Freshman (FR)',
    'SO': 'Sophomore (SO)',
    'JR': 'Junior (JR)',
    'SR': 'Senior (SR)',
    'GR': 'Graduate (GR)',
    'RFR': 'Redshirt (RFR)',
  };

  return yearMap[year.toUpperCase()] || year;
};

/**
 * Format gender abbreviation to full name
 * @param gender - The gender abbreviation (M, F)
 * @returns Formatted string like "Male" or "Female" or "N/A" for null/empty values
 */
export const formatGender = (gender: string | null | undefined): string => {
  // Handle null, undefined, empty string, or whitespace-only values
  if (!gender || gender.trim() === '') {
    return 'N/A';
  }

  const genderMap: Record<string, string> = {
    'M': 'Male',
    'F': 'Female',
  };

  return genderMap[gender.toUpperCase()] || gender;
};
