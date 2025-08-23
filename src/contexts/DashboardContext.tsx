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

// Initial state
const initialState: DashboardState = {
  data: [],
  filteredData: [],
  filters: {
    dateRange: {
      start: null as any,
      end: null as any,
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

// Efficient filtering function
function filterData(data: SocialMention[], filters: ExtendedDashboardFilters): SocialMention[] {
  if (data.length === 0) return [];

  return data.filter(item => {
    try {
      // Date filtering
      if (filters.dateRange.start || filters.dateRange.end) {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) return false;
        
        if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
      }

      // Sentiment filtering
      if (filters.sentiment.length > 0 && !filters.sentiment.includes(item.sentiment)) return false;

      // Channel filtering
      if (filters.channels.length > 0 && !filters.channels.includes(item.channel)) return false;

      // Category filtering
      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) return false;

      // Sub-category filtering
      if (filters.subCategories.length > 0 && !filters.subCategories.includes(item.sub_category)) return false;

      // Content type filtering
      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(item.content_type)) return false;

      // Speaker type filtering
      if (filters.speakerTypes.length > 0 && !filters.speakerTypes.includes(item.type_of_speaker)) return false;

      // Username filtering
      if (filters.usernames.length > 0 && !filters.usernames.includes(item.username)) return false;

      // Engagement range filtering
      const engagement = item.total_engagement || 0;
      if (engagement < filters.engagementRange.min || 
          (filters.engagementRange.max !== Infinity && engagement > filters.engagementRange.max)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Filter error:', error, item);
      return false;
    }
  });
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA': {
      const newData = action.payload;
      console.log('Setting data:', newData.length, 'items');
      
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

      return {
        ...state,
        data: newData,
        filteredData: filterData(newData, updatedFilters),
        filters: updatedFilters,
        error: null
      };
    }

    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      console.log('Updating filters:', newFilters);
      
      return {
        ...state,
        filters: newFilters,
        filteredData: filterData(state.data, newFilters)
      };
    }

    case 'CLEAR_FILTERS': {
      const engagements = state.data.map(item => item.total_engagement || 0);
      const maxEngagement = engagements.length > 0 ? Math.max(...engagements) : 1000;
      
      const clearedFilters: ExtendedDashboardFilters = {
        dateRange: { start: null as any, end: null as any },
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
        filteredData: state.data
      };
    }

    case 'SET_VIEW':
      return { ...state, currentView: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
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
    return {
      sentiments: [...new Set(data.map(item => item.sentiment).filter(Boolean))],
      channels: [...new Set(data.map(item => item.channel).filter(Boolean))],
      categories: [...new Set(data.map(item => item.category).filter(Boolean))],
      subCategories: [...new Set(data.map(item => item.sub_category).filter(Boolean))],
      contentTypes: [...new Set(data.map(item => item.content_type).filter(Boolean))],
      speakerTypes: [...new Set(data.map(item => item.type_of_speaker).filter(Boolean))],
      usernames: [...new Set(data.map(item => item.username).filter(Boolean))].slice(0, 100) // Limit for performance
    };
  }, [state.data]);

  const addFilter = (filterType: keyof ExtendedDashboardFilters, value: string) => {
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
    }
  };

  const removeFilter = (filterType: keyof ExtendedDashboardFilters, value: string) => {
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
