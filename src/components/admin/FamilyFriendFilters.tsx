import React, { useState } from 'react';
import { FamilyFriendFilters } from '@/hooks/useFamilyFriends';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X, ChevronDown, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

interface FamilyFriendFiltersProps {
  filters: FamilyFriendFilters;
  onFiltersChange: (filters: FamilyFriendFilters) => void;
  onClearFilters: () => void;
  uniqueRelationshipTypes: string[];
  totalResults: number;
  isLoading?: boolean;
}

export const FamilyFriendFiltersComponent: React.FC<FamilyFriendFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  uniqueRelationshipTypes,
  totalResults,
  isLoading = false,
}) => {
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [createdOpen, setCreatedOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleRelationshipToggle = (type: string) => {
    const current = filters.relationshipTypes || [];
    const updated = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    onFiltersChange({ ...filters, relationshipTypes: updated.length > 0 ? updated : undefined });
  };

  const hasActiveFilters =
    !!filters.search ||
    (filters.relationshipTypes && filters.relationshipTypes.length > 0) ||
    !!filters.sortBy ||
    !!filters.createdStart ||
    !!filters.createdEnd ||
    !!filters.createdInPastWeek;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-nil-navy" />
          <h3 className="text-lg font-semibold text-gray-900">Filter Family/Friends</h3>
          <div className="ml-auto text-sm text-gray-600">
            {isLoading ? <span>Loading...</span> : <span>{totalResults.toLocaleString()} users found</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, relationship, hometown..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Relationship Type */}
          <Popover open={relationshipOpen} onOpenChange={setRelationshipOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="justify-between" disabled={isLoading}>
                {filters.relationshipTypes && filters.relationshipTypes.length > 0
                  ? `${filters.relationshipTypes.length} type${filters.relationshipTypes.length > 1 ? 's' : ''} selected`
                  : 'All Relationships'}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="max-h-[200px] overflow-y-auto p-2">
                {uniqueRelationshipTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                    <Checkbox
                      id={`ff-rel-${type}`}
                      checked={filters.relationshipTypes?.includes(type) || false}
                      onCheckedChange={() => handleRelationshipToggle(type)}
                    />
                    <label htmlFor={`ff-rel-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Account Created date range */}
          <Popover open={createdOpen} onOpenChange={setCreatedOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="justify-between" disabled={isLoading}>
                {(() => {
                  const { createdStart: s, createdEnd: e } = filters;
                  if (s && e) return `Created: ${s} – ${e}`;
                  if (s) return `Created: From ${s}`;
                  if (e) return `Created: Until ${e}`;
                  return 'Account Created';
                })()}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-3">
              <div className="space-y-3">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.createdStart ? new Date(filters.createdStart + 'T00:00:00Z') : undefined,
                    to: filters.createdEnd ? new Date(filters.createdEnd + 'T00:00:00Z') : undefined,
                  } as any}
                  onSelect={(range: any) => {
                    const from = range?.from as Date | undefined;
                    const to = range?.to as Date | undefined;
                    const toYMD = (d?: Date) =>
                      d ? new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10) : undefined;
                    onFiltersChange({ ...filters, createdStart: toYMD(from), createdEnd: toYMD(to) });
                  }}
                  numberOfMonths={1}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start</label>
                    <Input
                      type="date"
                      value={filters.createdStart || ''}
                      onChange={(e) => onFiltersChange({ ...filters, createdStart: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End</label>
                    <Input
                      type="date"
                      value={filters.createdEnd || ''}
                      onChange={(e) => onFiltersChange({ ...filters, createdEnd: e.target.value || undefined })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onFiltersChange({ ...filters, createdStart: undefined, createdEnd: undefined })}
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={() => setCreatedOpen(false)}>Done</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
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

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Search: "{filters.search}"
                <button onClick={() => handleSearchChange('')} className="hover:bg-nil-orange/30 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.relationshipTypes && filters.relationshipTypes.map((type) => (
              <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Relationship: {type}
                <button onClick={() => handleRelationshipToggle(type)} className="hover:bg-nil-orange/30 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.createdStart || filters.createdEnd) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                {(() => {
                  const { createdStart: s, createdEnd: e } = filters;
                  if (s && e) return `Created: ${s} – ${e}`;
                  if (s) return `Created: From ${s}`;
                  return `Created: Until ${e}`;
                })()}
                <button
                  onClick={() => onFiltersChange({ ...filters, createdStart: undefined, createdEnd: undefined })}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.createdInPastWeek && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Created: Past Week
                <button
                  onClick={() => onFiltersChange({ ...filters, createdInPastWeek: undefined })}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.sortBy && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-nil-orange/20 text-nil-orange rounded-md text-sm">
                Sort: {filters.sortBy === 'firstName' ? 'First Name' : filters.sortBy === 'lastName' ? 'Last Name' : 'Account Created'}{' '}
                {filters.sortDir === 'desc' ? '(Desc)' : '(Asc)'}
                <button
                  onClick={() => onFiltersChange({ ...filters, sortBy: undefined, sortDir: undefined })}
                  className="hover:bg-nil-orange/30 rounded-full p-0.5"
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
