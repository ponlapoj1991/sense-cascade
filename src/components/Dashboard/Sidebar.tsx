import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  BarChart3,
  Heart,
  TrendingUp,
  Users,
  MessageCircle,
  PieChart,
  Activity,
  FileText,
  Settings
} from 'lucide-react';

const menuItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    description: 'Complete dashboard overview'
  },
  {
    id: 'sentiment',
    label: 'Sentiment Analysis',
    icon: Heart,
    description: 'Emotional analysis & trends'
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: TrendingUp,
    description: 'Engagement & reach metrics'
  },
  {
    id: 'influencer',
    label: 'Influencer Insights',
    icon: Users,
    description: 'Top speakers & influence'
  },
  {
    id: 'content',
    label: 'Content Analysis',
    icon: MessageCircle,
    description: 'Content types & distribution'
  }
] as const;

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { state, dispatch } = useDashboard();
  const { currentView, filteredData } = state;

  const getActiveFiltersCount = () => {
    const { filters } = state;
    return [
      filters.sentiment.length,
      filters.channels.length,
      filters.categories.length,
      filters.subCategories.length,
      filters.contentTypes.length,
      filters.speakerTypes.length,
      filters.usernames.length
    ].reduce((sum, count) => sum + count, 0) +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
    (filters.engagementRange.min > 0 || filters.engagementRange.max < Infinity ? 1 : 0);
  };

  return (
    <div className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border h-screen",
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Social Listening
            </h1>
            <p className="text-sm text-sidebar-foreground/60">
              {filteredData.length.toLocaleString()} mentions
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-auto p-4 text-left",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id as any })}
            >
              <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.label}</div>
                <div className="text-xs opacity-75 truncate">{item.description}</div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Filters Summary */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-sidebar-foreground">
            Active Filters
          </span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="h-5 px-2 text-xs">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        
        {getActiveFiltersCount() === 0 ? (
          <p className="text-xs text-sidebar-foreground/60">
            No filters applied
          </p>
        ) : (
          <div className="space-y-1">
            {state.filters.sentiment.length > 0 && (
              <div className="text-xs text-sidebar-foreground/80">
                Sentiment: {state.filters.sentiment.length} selected
              </div>
            )}
            {state.filters.channels.length > 0 && (
              <div className="text-xs text-sidebar-foreground/80">
                Channels: {state.filters.channels.length} selected
              </div>
            )}
            {(state.filters.dateRange.start || state.filters.dateRange.end) && (
              <div className="text-xs text-sidebar-foreground/80">
                Date range applied
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
}