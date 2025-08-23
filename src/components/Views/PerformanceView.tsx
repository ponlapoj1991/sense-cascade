import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { useDashboard } from '@/contexts/DashboardContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, BarChart3, Users, MessageCircle, Share2, Heart } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

export function PerformanceView() {
  const { state } = useDashboard();
  const { filteredData } = state;

  const performanceAnalytics = useMemo(() => {
    // Channel performance metrics
    const channelMetrics = filteredData.reduce((acc, item) => {
      const channel = item.channel || 'Unknown';
      if (!acc[channel]) {
        acc[channel] = {
          mentions: 0,
          totalEngagement: 0,
          comments: 0,
          reactions: 0,
          shares: 0
        };
      }
      
      acc[channel].mentions += 1;
      acc[channel].totalEngagement += item.total_engagement || 0;
      acc[channel].comments += item.comments || 0;
      acc[channel].reactions += item.reactions || 0;
      acc[channel].shares += item.shares || 0;
      
      return acc;
    }, {} as Record<string, any>);

    const channelPerformanceData = Object.entries(channelMetrics)
      .map(([name, metrics]) => ({
        name,
        mentions: metrics.mentions,
        value: metrics.totalEngagement,
        engagement: Math.round(metrics.totalEngagement / metrics.mentions),
        comments: metrics.comments,
        reactions: metrics.reactions,
        shares: metrics.shares,
        engagementRate: Math.round((metrics.totalEngagement / metrics.mentions) * 100) / 100
      }))
      .sort((a, b) => b.value - a.value);

    // Content type performance
    const contentTypeMetrics = filteredData.reduce((acc, item) => {
      const type = item.content_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = { mentions: 0, totalEngagement: 0 };
      }
      acc[type].mentions += 1;
      acc[type].totalEngagement += item.total_engagement || 0;
      return acc;
    }, {} as Record<string, any>);

    const contentTypeData = Object.entries(contentTypeMetrics)
      .map(([name, metrics]) => ({
        name,
        value: metrics.mentions,
        engagement: Math.round(metrics.totalEngagement / metrics.mentions)
      }))
      .sort((a, b) => b.engagement - a.engagement);

    // Timeline performance
    const timelineData = filteredData
      .filter(item => item.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .reduce((acc, item) => {
        const date = new Date(item.date!);
        if (!isValid(date)) return acc;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            mentions: 0,
            engagement: 0,
            comments: 0,
            reactions: 0,
            shares: 0
          };
        }
        
        acc[dateStr].mentions += 1;
        acc[dateStr].engagement += item.total_engagement || 0;
        acc[dateStr].comments += item.comments || 0;
        acc[dateStr].reactions += item.reactions || 0;
        acc[dateStr].shares += item.shares || 0;
        
        return acc;
      }, {} as Record<string, any>);

    const timelineArray = Object.values(timelineData)
      .slice(-30) // Last 30 days
      .map((day: any) => ({
        ...day,
        avgEngagement: Math.round(day.engagement / day.mentions)
      }));

    // Top performing posts
    const topPosts = filteredData
      .sort((a, b) => (b.total_engagement || 0) - (a.total_engagement || 0))
      .slice(0, 10);

    // Overall metrics
    const totalMentions = filteredData.length;
    const totalEngagement = filteredData.reduce((sum, item) => sum + (item.total_engagement || 0), 0);
    const avgEngagement = totalMentions > 0 ? Math.round(totalEngagement / totalMentions) : 0;
    const totalComments = filteredData.reduce((sum, item) => sum + (item.comments || 0), 0);
    const totalReactions = filteredData.reduce((sum, item) => sum + (item.reactions || 0), 0);
    const totalShares = filteredData.reduce((sum, item) => sum + (item.shares || 0), 0);

    return {
      channelPerformanceData,
      contentTypeData,
      timelineArray,
      topPosts,
      overallMetrics: {
        totalMentions,
        totalEngagement,
        avgEngagement,
        totalComments,
        totalReactions,
        totalShares
      }
    };
  }, [filteredData]);

  const MetricCard = ({ title, value, icon: Icon, color = 'text-primary', subtitle }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Engagement"
          value={performanceAnalytics.overallMetrics.totalEngagement}
          icon={TrendingUp}
          color="text-chart-1"
        />
        <MetricCard
          title="Avg Engagement"
          value={performanceAnalytics.overallMetrics.avgEngagement}
          icon={Activity}
          color="text-chart-2"
          subtitle="per mention"
        />
        <MetricCard
          title="Total Comments"
          value={performanceAnalytics.overallMetrics.totalComments}
          icon={MessageCircle}
          color="text-chart-3"
        />
        <MetricCard
          title="Total Reactions"
          value={performanceAnalytics.overallMetrics.totalReactions}
          icon={Heart}
          color="text-chart-4"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveBarChart
          title="Channel Performance (Total Engagement)"
          data={performanceAnalytics.channelPerformanceData}
          filterKey="channels"
          dataKey="value"
          color="hsl(var(--chart-1))"
        />
        
        <InteractiveBarChart
          title="Content Type Performance (Avg Engagement)"
          data={performanceAnalytics.contentTypeData}
          filterKey="contentTypes"
          dataKey="engagement"
          color="hsl(var(--chart-2))"
        />
      </div>

      {/* Engagement Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Engagement Timeline (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceAnalytics.timelineArray}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  formatter={(value: any, name: string) => [value?.toLocaleString(), name]}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#engagementGradient)"
                  name="Total Engagement"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceAnalytics.topPosts.map((post, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{post.username}</div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{post.channel}</span>
                      <span>•</span>
                      <span>{post.content_type}</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2 line-clamp-2">{post.content}</div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{post.total_engagement?.toLocaleString()} total</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{post.comments?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.reactions?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-3 w-3" />
                      <span>{post.shares?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}