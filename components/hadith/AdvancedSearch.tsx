'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { 
  searchNarratorsAdvanced, 
  getSearchSuggestions, 
  getAvailableRegions 
} from '@/app/actions/hadith';
import type { 
  Narrator, 
  SearchSuggestion,
  AdvancedSearchParams 
} from '@/types/hadith';

interface AdvancedSearchProps {
  onSearchResults: (narrators: Narrator[]) => void;
  onLoading: (isLoading: boolean) => void;
  initialSearchTerm?: string;
}

export default function AdvancedSearch({ 
  onSearchResults, 
  onLoading, 
  initialSearchTerm = '' 
}: AdvancedSearchProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [credibilityFilter, setCredibilityFilter] = useState<'trustworthy' | 'weak' | ''>('');
  const [regionFilter, setRegionFilter] = useState('');
  const [minBirthYear, setMinBirthYear] = useState<number | undefined>();
  const [maxBirthYear, setMaxBirthYear] = useState<number | undefined>();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);

  // Load available regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const regions = await getAvailableRegions();
        setAvailableRegions(regions);
      } catch (error) {
        console.error('Error loading regions:', error);
      }
    };
    loadRegions();
  }, []);

  // Handle search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length >= 2) {
        try {
          const results = await getSearchSuggestions(searchTerm, 8);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Perform search
  const handleSearch = async () => {
    onLoading(true);
    setShowSuggestions(false);

    try {
      const params: AdvancedSearchParams = {
        searchTerm: searchTerm.trim(),
        credibilityFilter,
        regionFilter,
        minBirthYear,
        maxBirthYear,
        limit: 20
      };

      const results = await searchNarratorsAdvanced(params);
      onSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
      onSearchResults([]);
    } finally {
      onLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.suggestion);
    setShowSuggestions(false);
    
    // Auto-apply credibility filter if suggestion has specific credibility
    if (suggestion.credibility !== 'both' && suggestion.credibility !== 'unknown') {
      setCredibilityFilter(suggestion.credibility as 'trustworthy' | 'weak');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setCredibilityFilter('');
    setRegionFilter('');
    setMinBirthYear(undefined);
    setMaxBirthYear(undefined);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (credibilityFilter) count++;
    if (regionFilter) count++;
    if (minBirthYear) count++;
    if (maxBirthYear) count++;
    return count;
  }, [credibilityFilter, regionFilter, minBirthYear, maxBirthYear]);

  // Handle key press for search
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle year input changes
  const handleMinYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinBirthYear(e.target.value ? parseInt(e.target.value) : undefined);
  };

  const handleMaxYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxBirthYear(e.target.value ? parseInt(e.target.value) : undefined);
  };

  // Handle credibility filter change
  const handleCredibilityChange = (value: string) => {
    setCredibilityFilter(value as 'trustworthy' | 'weak' | '');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Search className="h-5 w-5" />
          Advanced Narrator Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by Arabic name, transliteration, or biography..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 pr-4 text-lg h-12"
              dir="auto"
            />
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <span className={suggestion.type === 'arabic_name' ? 'font-arabic' : ''}>
                      {suggestion.suggestion}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {suggestion.type === 'arabic_name' ? 'Arabic' : 
                         suggestion.type === 'transliteration' ? 'Name' : 'Region'}
                      </Badge>
                      {suggestion.credibility !== 'both' && suggestion.credibility !== 'unknown' && (
                        <Badge 
                          variant={suggestion.credibility === 'trustworthy' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {suggestion.credibility}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Credibility Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Credibility Assessment
                </Label>
                <Select value={credibilityFilter} onValueChange={handleCredibilityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All narrators" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All narrators</SelectItem>
                    <SelectItem value="trustworthy">Trustworthy (ثقة)</SelectItem>
                    <SelectItem value="weak">Weak (ضعيف)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Region
                </Label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Year Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Birth Year (After Hijra)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minBirthYear || ''}
                    onChange={handleMinYearChange}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxBirthYear || ''}
                    onChange={handleMaxYearChange}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0 && !searchTerm}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          className="w-full h-12 text-lg"
          disabled={!searchTerm && activeFiltersCount === 0}
        >
          <Search className="h-5 w-5 mr-2" />
          Search Narrators
        </Button>

        {/* Active Filters Display */}
        {(searchTerm || activeFiltersCount > 0) && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {credibilityFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                {credibilityFilter === 'trustworthy' ? 'Trustworthy' : 'Weak'}
                <button
                  onClick={() => setCredibilityFilter('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {regionFilter && (
              <Badge variant="outline" className="flex items-center gap-1">
                Region: {regionFilter}
                <button
                  onClick={() => setRegionFilter('')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(minBirthYear || maxBirthYear) && (
              <Badge variant="outline" className="flex items-center gap-1">
                Years: {minBirthYear || '∞'} - {maxBirthYear || '∞'} AH
                <button
                  onClick={() => {
                    setMinBirthYear(undefined);
                    setMaxBirthYear(undefined);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 