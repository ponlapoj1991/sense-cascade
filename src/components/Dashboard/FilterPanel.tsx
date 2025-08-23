import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDashboard } from '@/contexts/DashboardContext';
import { format } from 'date-fns';
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

export function FilterPanel() {
  const { state, dispatch, addFilter, removeFilter, clearFilters } = useDashboard();
  const { data, filters } = state;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dates: true,
    sentiment: false,
    channels: false,
    categories: false
  });

  // Get unique values for filters
  const uniqueValues = {
    sentiments: [...new Set(data.map(item => item.sentiment).filter(Boolean))],
    channels: [...new Set(data.map(item => item.channel).filter(Boolean))],
    categories: [...new Set(data.map(item => item.category).filter(Boolean))],
    subCategories: [...new Set(data.map(item => item.sub_category).filter(Boolean))],
    contentTypes: [...new Set(data.map(item => item.content_type).filter(Boolean))],
    speakerTypes: [...new Set(data.map(item => item.type_of_speaker).filter(Boolean))],
    usernames: [...new Set(data.map(item => item.username).filter(Boolean))].slice(0, 50)
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    items, 
    filterKey, 
    selectedItems 
  }: {
    title: string;
    sectionKey: string;
    items: string[];
    filterKey: keyof typeof filters;
    selectedItems: string[];
  }) => (
    <Collapsible open={expandedSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 h-auto"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">{title}</span>
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="h-5 px-2 text-xs">
                {selectedItems.length}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            expandedSections[sectionKey] && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {items.map(item => (
            <div key={item} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`${sectionKey}-${item}`}
                checked={selectedItems.includes(item)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addFilter(filterKey, item);
                  } else {
                    removeFilter(filterKey, item);
                  }
                }}
                className="rounded border-input"
              />
              <label
                htmlFor={`${sectionKey}-${item}`}
                className="text-sm cursor-pointer flex-1 truncate"
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <Card className="w-80 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Date Range */}
        <Collapsible open={expandedSections.dates} onOpenChange={() => toggleSection('dates')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Date Range</span>
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    Applied
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                expandedSections.dates && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left h-9">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange.start ? format(filters.dateRange.start, 'MM/dd') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => {
                        if (date) {
                          dispatch({
                            type: 'SET_FILTERS',
                            payload: {
                              dateRange: { start: date, end: filters.dateRange.end }
                            }
                          });
                        }
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left h-9">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange.end ? format(filters.dateRange.end, 'MM/dd') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => {
                        if (date) {
                          dispatch({
                            type: 'SET_FILTERS',
                            payload: {
                              dateRange: { start: filters.dateRange.start, end: date }
                            }
                          });
                        }
                      }}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Sentiment */}
        <FilterSection
          title="Sentiment"
          sectionKey="sentiment"
          items={uniqueValues.sentiments}
          filterKey="sentiment"
          selectedItems={filters.sentiment}
        />

        {/* Channels */}
        <FilterSection
          title="Channels"
          sectionKey="channels"
          items={uniqueValues.channels}
          filterKey="channels"
          selectedItems={filters.channels}
        />

        {/* Categories */}
        <FilterSection
          title="Categories"
          sectionKey="categories"
          items={uniqueValues.categories}
          filterKey="categories"
          selectedItems={filters.categories}
        />

        {/* Content Types */}
        <FilterSection
          title="Content Types"
          sectionKey="contentTypes"
          items={uniqueValues.contentTypes}
          filterKey="contentTypes"
          selectedItems={filters.contentTypes}
        />

        {/* Speaker Types */}
        <FilterSection
          title="Speaker Types"
          sectionKey="speakerTypes"
          items={uniqueValues.speakerTypes}
          filterKey="speakerTypes"
          selectedItems={filters.speakerTypes}
        />
      </CardContent>
    </Card>
  );
}