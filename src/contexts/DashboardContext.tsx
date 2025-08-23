import React, { createContext, useContext, useReducer, ReactNode } from 'react';
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
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: DashboardState = {
  data: [],
  filteredData: [],
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
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
      max: 10000,
    },
  },
  currentView: 'overview',
  isLoading: false,
  error: null,
};

function filterData(data: SocialMention[], filters: ExtendedDashboardFilters): SocialMention[] {
  return data.filter(item => {
    // Date filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      const itemDate = new Date(item.date);
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
    if (engagement < filters.engagementRange.min || engagement > filters.engagementRange.max) return false;

    return true;
  });
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA':
      const newData = action.payload;
      return {
        ...state,
        data: newData,
        filteredData: filterData(newData, state.filters)
      };
    case 'SET_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      return {
        ...state,
        filters: newFilters,
        filteredData: filterData(state.data, newFilters)
      };
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
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Generate unique values for filters from the data
  const uniqueValues = state.data.reduce((acc, item) => {
    if (item.sentiment) acc.sentiments.add(item.sentiment);
    if (item.channel) acc.channels.add(item.channel);
    if (item.category) acc.categories.add(item.category);
    if (item.sub_category) acc.subCategories.add(item.sub_category);
    if (item.content_type) acc.contentTypes.add(item.content_type);
    if (item.type_of_speaker) acc.speakerTypes.add(item.type_of_speaker);
    if (item.username) acc.usernames.add(item.username);
    return acc;
  }, {
    sentiments: new Set<string>(),
    channels: new Set<string>(),
    categories: new Set<string>(),
    subCategories: new Set<string>(),
    contentTypes: new Set<string>(),
    speakerTypes: new Set<string>(),
    usernames: new Set<string>(),
  });

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
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        channels: [],
        sentiment: [],
        categories: [],
        subCategories: [],
        contentTypes: [],
        speakerTypes: [],
        usernames: [],
        engagementRange: { min: 0, max: 10000 },
        timeframe: 'month' as const
      }
    });
  };

  return (
    <DashboardContext.Provider value={{ 
      state: {
        ...state,
        uniqueValues: {
          sentiments: Array.from(uniqueValues.sentiments),
          channels: Array.from(uniqueValues.channels),
          categories: Array.from(uniqueValues.categories),
          subCategories: Array.from(uniqueValues.subCategories),
          contentTypes: Array.from(uniqueValues.contentTypes),
          speakerTypes: Array.from(uniqueValues.speakerTypes),
          usernames: Array.from(uniqueValues.usernames),
        }
      } as any, 
      dispatch, 
      addFilter, 
      removeFilter, 
      clearFilters 
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