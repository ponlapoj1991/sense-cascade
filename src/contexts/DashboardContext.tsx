import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface SocialMediaData {
  Url?: string;
  date?: string | Date;
  content?: string;
  sentiment?: string;
  Channel?: string;
  content_type?: string;
  total_engagement?: number;
  username?: string;
  Category?: string;
  Sub_Category?: string;
  type_of_speaker?: string;
  Comment?: number;
  Reactions?: number;
  Share?: number;
  [key: string]: any;
}

export interface DashboardFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  sentiment: string[];
  channels: string[];
  categories: string[];
  subCategories: string[];
  contentTypes: string[];
  speakerTypes: string[];
  usernames: string[];
  engagementRange: {
    min: number;
    max: number;
  };
}

interface DashboardState {
  data: SocialMediaData[];
  filteredData: SocialMediaData[];
  filters: DashboardFilters;
  currentView: 'overview' | 'sentiment' | 'performance' | 'influencer' | 'content';
  isLoading: boolean;
  error: string | null;
}

type DashboardAction =
  | { type: 'SET_DATA'; payload: SocialMediaData[] }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_VIEW'; payload: DashboardState['currentView'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialFilters: DashboardFilters = {
  dateRange: { start: null, end: null },
  sentiment: [],
  channels: [],
  categories: [],
  subCategories: [],
  contentTypes: [],
  speakerTypes: [],
  usernames: [],
  engagementRange: { min: 0, max: Infinity }
};

const initialState: DashboardState = {
  data: [],
  filteredData: [],
  filters: initialFilters,
  currentView: 'overview',
  isLoading: false,
  error: null
};

function filterData(data: SocialMediaData[], filters: DashboardFilters): SocialMediaData[] {
  return data.filter(item => {
    // Date filtering
    if (filters.dateRange.start || filters.dateRange.end) {
      const itemDate = new Date(item.date || '');
      if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
    }

    // Sentiment filtering
    if (filters.sentiment.length > 0 && !filters.sentiment.includes(item.sentiment || '')) return false;

    // Channel filtering
    if (filters.channels.length > 0 && !filters.channels.includes(item.Channel || '')) return false;

    // Category filtering
    if (filters.categories.length > 0 && !filters.categories.includes(item.Category || '')) return false;

    // Sub-category filtering
    if (filters.subCategories.length > 0 && !filters.subCategories.includes(item.Sub_Category || '')) return false;

    // Content type filtering
    if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(item.content_type || '')) return false;

    // Speaker type filtering
    if (filters.speakerTypes.length > 0 && !filters.speakerTypes.includes(item.type_of_speaker || '')) return false;

    // Username filtering
    if (filters.usernames.length > 0 && !filters.usernames.includes(item.username || '')) return false;

    // Engagement range filtering
    const engagement = item.total_engagement || 0;
    if (engagement < filters.engagementRange.min || engagement > filters.engagementRange.max) return false;

    return true;
  });
}

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
        filteredData: filterData(action.payload, state.filters)
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

const DashboardContext = createContext<{
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  addFilter: (filterType: keyof DashboardFilters, value: any) => void;
  removeFilter: (filterType: keyof DashboardFilters, value: any) => void;
  clearFilters: () => void;
} | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const addFilter = (filterType: keyof DashboardFilters, value: any) => {
    if (filterType === 'dateRange' || filterType === 'engagementRange') {
      dispatch({ type: 'SET_FILTERS', payload: { [filterType]: value } });
    } else {
      const currentValues = state.filters[filterType] as string[];
      if (!currentValues.includes(value)) {
        dispatch({
          type: 'SET_FILTERS',
          payload: { [filterType]: [...currentValues, value] }
        });
      }
    }
  };

  const removeFilter = (filterType: keyof DashboardFilters, value: any) => {
    if (filterType === 'dateRange') {
      dispatch({ type: 'SET_FILTERS', payload: { [filterType]: { start: null, end: null } } });
    } else if (filterType === 'engagementRange') {
      dispatch({ type: 'SET_FILTERS', payload: { [filterType]: { min: 0, max: Infinity } } });
    } else {
      const currentValues = state.filters[filterType] as string[];
      dispatch({
        type: 'SET_FILTERS',
        payload: { [filterType]: currentValues.filter(v => v !== value) }
      });
    }
  };

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: initialFilters });
  };

  return (
    <DashboardContext.Provider value={{ state, dispatch, addFilter, removeFilter, clearFilters }}>
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