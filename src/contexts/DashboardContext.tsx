import React, { createContext, useContext, useReducer, ReactNode, useMemo } from 'react';
import { SocialMention, DashboardFilters } from '@/types/dashboard';

// Extended DashboardFilters with additional fields
export interface ExtendedDashboardFilters extends DashboardFilters {
  subCategories: string[];
  contentTypes: string[];
  speakerTypes: string[];
  usernames: string[];
  engagementRange: {
    min: number;
    max: number;
  };
}

export interface DashboardState {
  data: SocialMention[];
  filteredData: SocialMention[];
  filters: ExtendedDashboardFilters;
  currentView: 'overview' | 'sentiment' | 'performance' | 'influencer' | 'content';
  isLoading: boolean;
  error: string | null;
}

export type DashboardAction =
  | { type: 'SET_DATA'; payload: SocialMention[] }
  | { type: 'SET_FILTERS'; payload: Partial<ExtendedDashboardFilters> }
  | { type: 'SET_VIEW'; payload: DashboardState['currentView'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_FILTERS' };

// Initial state - FIXED!
const initialState: DashboardState = {
  data: [],
  filteredData: [],
  filters: {
    dateRange: {
      start: null, // ✅ แก้จาก null as any เป็น null
      end: null,   // ✅ แก้จาก null as any เป็น null
    },
    channels: [],
    sentiment: [],
    categories: [],
    timeframe: 'month',
    subCategories: [],
    contentTypes: [],
    speakerTypes: [],
    usernames: [],
    engagementRange: {
      min: 0,
      max: Infinity,
    },
  },
  currentView: 'overview',
  isLoading: false,
  error: null,
};

// Efficient filtering function - COMPLETELY FIXED!
function filterData(data: SocialMention[], filters: ExtendedDashboardFilters): SocialMention[] {
  if (data.length === 0) return [];

  console.log('🔍 Filtering data:', data.length, 'items with filters:', {
    dateRange: filters.dateRange,
    sentiment: filters.sentiment,
    channels: filters.channels,
    categories: filters.categories
  });

  const filteredResults = data.filter(item => {
    try {
      // Date filtering - COMPLETELY REWRITTEN!
      if (filters.dateRange.start || filters.dateRange.end) {
        // Parse item date - handle both formats safely
        let itemDate: Date;
        
        try {
          if (typeof item.date === 'string') {
            if (item.date.includes('T')) {
              // ISO DateTime format: "2025-04-08T16:59:56.000Z"
              itemDate = new Date(item.date);
            } else {
              // Simple date format: "2024-01-15"
              itemDate = new Date(item.date + 'T00:00:00');
            }
          } else {
            // Fallback
            itemDate = new Date(item.date);
          }
          
          // Validate parsed date
          if (isNaN(itemDate.getTime())) {
            console.warn('❌ Invalid date in filter:', item.date, 'skipping item');
            return false;
          }
          
          // Compare dates (ignore time component) - FIXED!
          const itemDateOnly = new Date(
            itemDate.getFullYear(), 
            itemDate.getMonth(), 
            itemDate.getDate()
          );
          
          // Check start date
          if (filters.dateRange.start) {
            const startDateOnly = new Date(
              filters.dateRange.start.getFullYear(),
              filters.dateRange.start.getMonth(), 
              filters.dateRange.start.getDate()
            );
            
            if (itemDateOnly < startDateOnly) {
              console.log('📅 Date filter: item', itemDateOnly, 'before start', startDateOnly);
              return false;
            }
          }
          
          // Check end date
          if (filters.dateRange.end) {
            const endDateOnly = new Date(
              filters.dateRange.end.getFullYear(), 
              filters.dateRange.end.getMonth(), 
              filters.dateRange.end.getDate()
            );
            
            if (itemDateOnly > endDateOnly) {
              console.log('📅 Date filter: item', itemDateOnly, 'after end', endDateOnly);
              return false;
            }
          }
          
        } catch (error) {
          console.error('❌ Date comparison error:', error, 'item date:', item.date);
          return false;
        }
      }

      // Sentiment filtering
      if (filters.sentiment.length > 0 && !filters.sentiment.includes(item.sentiment)) {
        return false;
      }

      // Channel filtering
      if (filters.channels.length > 0 && !filters.channels.includes(item.channel)) {
        return false;
      }

      // Category filtering
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      // Sub-category filtering
      if (filters.subCategories.length > 0 && !filters.subCategories.includes(item.sub_category)) {
        return false;
      }

      // Content type filtering
      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(item.content_type)) {
        return false;
      }

      // Speaker type filtering
      if (filters.speakerTypes.length > 0 && !filters.speakerTypes.includes(item.type_of_speaker)) {
        return false;
      }

      // Username filtering
      if (filters.usernames.length > 0 && !filters.usernames.includes(item.username)) {
        return false;
      }

      // Engagement range filtering
      const engagement = item.total_engagement || 0;
      if (engagement < filters.engagementRange.min || 
          (filters.engagementRange.max !== Infinity && engagement > filters.engagementRange.max)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Filter error:', error, 'item:', item);
      return false;
    }
  });

  console.log('✅ Filtered results:', filteredResults.length, 'items');
  
  // Debug: show date range of filtered results
  if (filteredResults.length > 0) {
    const dates = filteredResults.map(item => item.date).sort();
    console.log('📅 Date range in results:', dates[0], '→', dates[dates.length - 1]);
  }

  return filteredResults;
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA': {
      const newData = action.payload;
      console.log('📊 Setting data:', newData.length, 'items');
      
      // Debug: show date range of incoming data
      if (newData.length > 0) {
        const dates = newData.map(item => item.date).sort();
        console.log('📅 Data date range:', dates[0], '→', dates[dates.length - 1]);
        
        // Show sample dates
        console.log('📅 Sample dates:', newData.slice(0, 3).map(item => ({
          id: item.id,
          date: item.date,
          content: item.content.substring(0, 50) + '...'
        })));
      }
      
      // Reset engagement range based on new data
      const engagements = newData.map(item => item.total_engagement || 0);
      const maxEngagement = engagements.length > 0 ? Math.max(...engagements) : 1000;
      
      const updatedFilters = {
        ...state.filters,
        engagementRange: {
          min: 0,
          max: maxEngagement
        }
      };

      const filteredData = filterData(newData, updatedFilters);

      return {
        ...state,
        data: newData,
        filteredData: filteredData,
        filters: updatedFilters,
        error: null
      };
    }

    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      console.log('🔧 Updating filters:', {
        old: state.filters,
        new: newFilters,
        changes: action.payload
      });
      
      const filteredData = filterData(state.data, newFilters);
      console.log('✅ Filter applied: filtered', filteredData.length, 'out of', state.data.length, 'items');
      
      return {
        ...state,
        filters: newFilters,
        filteredData: filteredData
      };
    }

    case 'CLEAR_FILTERS': {
      console.log('🧹 Clearing all filters');
      
      const engagements = state.data.map(item => item.total_engagement || 0);
      const maxEngagement = engagements.length > 0 ? Math.max(...engagements) : 1000;
      
      const clearedFilters: ExtendedDashboardFilters = {
        dateRange: { start: null, end: null }, // ✅ Fixed
        channels: [],
        sentiment: [],
        categories: [],
        subCategories: [],
        contentTypes: [],
        speakerTypes: [],
        usernames: [],
        engagementRange: { min: 0, max: maxEngagement },
        timeframe: 'month'
      };

      return {
        ...state,
        filters: clearedFilters,
        filteredData: state.data // Show all data when no filters
      };
    }

    case 'SET_VIEW':
      console.log('📱 Changing view to:', action.payload);
      return { ...state, currentView: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      console.error('❌ Dashboard error:', action.payload);
      return { ...state, error: action.payload };

    default:
      return state;
  }
}

interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  addFilter: (filterType: keyof ExtendedDashboardFilters, value: string) => void;
  removeFilter: (filterType: keyof ExtendedDashboardFilters, value: string) => void;
  clearFilters: () => void;
  uniqueValues: {
    sentiments: string[];
    channels: string[];
    categories: string[];
    subCategories: string[];
    contentTypes: string[];
    speakerTypes: string[];
    usernames: string[];
  };
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Memoized unique values for filter options
  const uniqueValues = useMemo(() => {
    const data = state.data;
    const unique = {
      sentiments: [...new Set(data.map(item => item.sentiment).filter(Boolean))],
      channels: [...new Set(data.map(item => item.channel).filter(Boolean))],
      categories: [...new Set(data.map(item => item.category).filter(Boolean))],
      subCategories: [...new Set(data.map(item => item.sub_category).filter(Boolean))],
      contentTypes: [...new Set(data.map(item => item.content_type).filter(Boolean))],
      speakerTypes: [...new Set(data.map(item => item.type_of_speaker).filter(Boolean))],
      usernames: [...new Set(data.map(item => item.username).filter(Boolean))].slice(0, 100) // Limit for performance
    };
    
    console.log('📊 Unique values computed:', {
      sentiments: unique.sentiments.length,
      channels: unique.channels.length,
      categories: unique.categories.length
    });
    
    return unique;
  }, [state.data]);

  const addFilter = (filterType: keyof ExtendedDashboardFilters, value: string) => {
    console.log('➕ Adding filter:', filterType, '=', value);
    
    const currentFilters = Array.isArray(state.filters[filterType]) 
      ? state.filters[filterType] as string[]
      : [];
    
    if (!currentFilters.includes(value)) {
      dispatch({
        type: 'SET_FILTERS',
        payload: {
          [filterType]: [...currentFilters, value]
        }
      });
    } else {
      console.log('⚠️ Filter already exists:', filterType, '=', value);
    }
  };

  const removeFilter = (filterType: keyof ExtendedDashboardFilters, value: string) => {
    console.log('➖ Removing filter:', filterType, '=', value);
    
    const currentFilters = Array.isArray(state.filters[filterType]) 
      ? state.filters[filterType] as string[]
      : [];
    
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        [filterType]: currentFilters.filter(item => item !== value)
      }
    });
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters from context');
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  return (
    <DashboardContext.Provider value={{ 
      state, 
      dispatch, 
      addFilter, 
      removeFilter, 
      clearFilters,
      uniqueValues
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
