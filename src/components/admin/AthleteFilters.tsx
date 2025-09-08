import React, { useState } from 'react';
import { StudentAthleteFilters } from '@/types/studentAthlete';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { formatAcademicYear, formatGender } from '@/utils/formatters';

interface AthleteFiltersProps {
  filters: StudentAthleteFilters;
  onFiltersChange: (filters: StudentAthleteFilters) => void;
  onClearFilters: () => void;
  uniqueSports: string[];
  uniqueColleges: string[];
  uniqueGenders: string[];
  uniqueYears: string[];
  uniqueStates: string[];
  uniqueTotalSmRanges: string[];
  totalResults: number;
  isLoading?: boolean;
}

export const AthleteFilters: React.FC<AthleteFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  uniqueSports,
  uniqueColleges,
  uniqueGenders,
  uniqueYears,
  uniqueStates,
  uniqueTotalSmRanges,
  totalResults,
  isLoading = false
}) => {
  const [sportsOpen, setSportsOpen] = useState(false);
  const [collegesOpen, setCollegesOpen] = useState(false);
  const [gendersOpen, setGendersOpen] = useState(false);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [statesOpen, setStatesOpen] = useState(false);
  const [totalSmRangesOpen, setTotalSmRangesOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleSportToggle = (sport: string) => {
    const currentSports = filters.sports || [];
    const updatedSports = currentSports.includes(sport)
      ? currentSports.filter(s => s !== sport)
      : [...currentSports, sport];
    
    onFiltersChange({ 
      ...filters, 
      sports: updatedSports.length > 0 ? updatedSports : undefined 
    });
  };

  const handleCollegeToggle = (college: string) => {
    const currentColleges = filters.colleges || [];
    const updatedColleges = currentColleges.includes(college)
      ? currentColleges.filter(c => c !== college)
      : [...currentColleges, college];
    
    onFiltersChange({ 
      ...filters, 
      colleges: updatedColleges.length > 0 ? updatedColleges : undefined 
    });
  };

  const handleGenderToggle = (gender: string) => {
    const currentGenders = filters.genders || [];
    const updatedGenders = currentGenders.includes(gender)
      ? currentGenders.filter(g => g !== gender)
      : [...currentGenders, gender];
    
    onFiltersChange({ 
      ...filters, 
      genders: updatedGenders.length > 0 ? updatedGenders : undefined 
    });
  };

  const handleYearToggle = (year: string) => {
    const currentYears = filters.years || [];
    const updatedYears = currentYears.includes(year)
      ? currentYears.filter(y => y !== year)
      : [...currentYears, year];
    
    onFiltersChange({ 
      ...filters, 
      years: updatedYears.length > 0 ? updatedYears : undefined 
    });
  };

  const handleStateToggle = (state: string) => {
    const currentStates = filters.states || [];
    const updatedStates = currentStates.includes(state)
      ? currentStates.filter(s => s !== state)
      : [...currentStates, state];
    
    onFiltersChange({
      ...filters,
      states: updatedStates.length > 0 ? updatedStates : undefined,
    });
  };

  const handleTotalSmRangeToggle = (range: string) => {
    const currentRanges = filters.totalSmRanges || [];
    const updatedRanges = currentRanges.includes(range)
      ? currentRanges.filter(r => r !== range)
      : [...currentRanges, range];
    
    onFiltersChange({ 
      ...filters, 
      totalSmRanges: updatedRanges.length > 0 ? updatedRanges : undefined 
    });
  };

  const hasActiveFilters = filters.search || 
    (filters.sports && filters.sports.length > 0) || 
    (filters.colleges && filters.colleges.length > 0) ||
    (filters.genders && filters.genders.length > 0) ||
    (filters.years && filters.years.length > 0) ||
    (filters.states && filters.states.length > 0) ||
    (filters.totalSmRanges && filters.totalSmRanges.length > 0);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-nil-navy" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Athletes</h3>
          <div className="ml-auto text-sm text-gray-600">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{totalResults.toLocaleString()} athletes found</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by athlete name..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Sports Multi-Select Filter */}
          <Popover open={sportsOpen} onOpenChange={setSportsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={sportsOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.sports && filters.sports.length > 0
                  ? `${filters.sports.length} sport${filters.sports.length > 1 ? 's' : ''} selected`
                  : "All Sports"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueSports.map((sport) => (
                  <div key={sport} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`sport-${sport}`}
                      checked={filters.sports?.includes(sport) || false}
                      onCheckedChange={() => handleSportToggle(sport)}
                    />
                    <label
                      htmlFor={`sport-${sport}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {sport}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* States Multi-Select Filter */}
          <Popover open={statesOpen} onOpenChange={setStatesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={statesOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.states && filters.states.length > 0
                  ? `${filters.states.length} state${filters.states.length > 1 ? 's' : ''} selected`
                  : 'All States'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueStates.map((state) => (
                  <div key={state} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`state-${state}`}
                      checked={filters.states?.includes(state) || false}
                      onCheckedChange={() => handleStateToggle(state)}
                    />
                    <label
                      htmlFor={`state-${state}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {state}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Colleges Multi-Select Filter */}
          <Popover open={collegesOpen} onOpenChange={setCollegesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={collegesOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.colleges && filters.colleges.length > 0
                  ? `${filters.colleges.length} college${filters.colleges.length > 1 ? 's' : ''} selected`
                  : "All Colleges"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueColleges.map((college) => (
                  <div key={college} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`college-${college}`}
                      checked={filters.colleges?.includes(college) || false}
                      onCheckedChange={() => handleCollegeToggle(college)}
                    />
                    <label
                      htmlFor={`college-${college}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {college}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Genders Multi-Select Filter */}
          <Popover open={gendersOpen} onOpenChange={setGendersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={gendersOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.genders && filters.genders.length > 0
                  ? `${filters.genders.length} gender${filters.genders.length > 1 ? 's' : ''} selected`
                  : "All Genders"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueGenders.map((gender) => (
                  <div key={gender} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`gender-${gender}`}
                      checked={filters.genders?.includes(gender) || false}
                      onCheckedChange={() => handleGenderToggle(gender)}
                    />
                    <label
                      htmlFor={`gender-${gender}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {formatGender(gender)}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Years Multi-Select Filter */}
          <Popover open={yearsOpen} onOpenChange={setYearsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={yearsOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.years && filters.years.length > 0
                  ? `${filters.years.length} year${filters.years.length > 1 ? 's' : ''} selected`
                  : "All Years"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueYears.map((year) => (
                  <div key={year} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`year-${year}`}
                      checked={filters.years?.includes(year) || false}
                      onCheckedChange={() => handleYearToggle(year)}
                    />
                    <label
                      htmlFor={`year-${year}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {formatAcademicYear(year)}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Social Media Range Multi-Select Filter */}
          <Popover open={totalSmRangesOpen} onOpenChange={setTotalSmRangesOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={totalSmRangesOpen}
                className="justify-between"
                disabled={isLoading}
              >
                {filters.totalSmRanges && filters.totalSmRanges.length > 0
                  ? `${filters.totalSmRanges.length} range${filters.totalSmRanges.length > 1 ? 's' : ''} selected`
                  : "All SM Ranges"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueTotalSmRanges.map((range) => (
                  <div key={range} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`range-${range}`}
                      checked={filters.totalSmRanges?.includes(range) || false}
                      onCheckedChange={() => handleTotalSmRangeToggle(range)}
                    />
                    <label
                      htmlFor={`range-${range}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            disabled={!hasActiveFilters || isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Search: "{filters.search}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.sports && filters.sports.map((sport) => (
              <span key={sport} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Sport: {sport}
                <button
                  onClick={() => handleSportToggle(sport)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.colleges && filters.colleges.map((college) => (
              <span key={college} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                College: {college}
                <button
                  onClick={() => handleCollegeToggle(college)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.genders && filters.genders.map((gender) => (
              <span key={gender} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Gender: {formatGender(gender)}
                <button
                  onClick={() => handleGenderToggle(gender)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.years && filters.years.map((year) => (
              <span key={year} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Year: {formatAcademicYear(year)}
                <button
                  onClick={() => handleYearToggle(year)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.states && filters.states.map((state) => (
              <span key={state} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                State: {state}
                <button
                  onClick={() => handleStateToggle(state)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.totalSmRanges && filters.totalSmRanges.map((range) => (
              <span key={range} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                SM Range: {range}
                <button
                  onClick={() => handleTotalSmRangeToggle(range)}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
