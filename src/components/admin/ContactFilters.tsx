import React from 'react';
import { SchoolContactFilters } from '@/types/schoolContact';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface ContactFiltersProps {
  filters: SchoolContactFilters;
  onFiltersChange: (filters: Partial<SchoolContactFilters>) => void;
  onClearFilters: () => void;
  uniqueColleges: string[];
  totalResults: number;
  isLoading: boolean;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  uniqueColleges,
  totalResults,
  isLoading = false
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value || undefined });
  };

  const handleCollegeChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      college: value === 'all' ? undefined : value 
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.college;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-nil-navy" />
          <h3 className="text-lg font-semibold text-gray-900">Filter School Contacts</h3>
          <div className="ml-auto text-sm text-gray-600">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>{totalResults.toLocaleString()} school contacts found</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by contact name..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* College Filter */}
          <Select
            value={filters.college || 'all'}
            onValueChange={handleCollegeChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colleges</SelectItem>
              {uniqueColleges.map((college) => (
                <SelectItem key={college} value={college}>
                  {college}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Spacer for alignment */}
          <div></div>

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
            {filters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Search: "{filters.searchTerm}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.college && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-navy/20 text-nil-navy rounded-md text-sm">
                College: {filters.college}
                <button
                  onClick={() => handleCollegeChange('all')}
                  className="hover:bg-nil-navy/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
