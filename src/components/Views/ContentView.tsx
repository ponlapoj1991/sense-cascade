import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractivePieChart } from '@/components/Charts/InteractivePieChart';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { useDashboard } from '@/contexts/DashboardContext';
import { FileText, Video, MessageCircle, Image, Hash, TrendingUp } from 'lucide-react';

const CONTENT_TYPE_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export function ContentView() {
  const { state } = useDashboard();
  const { filteredData } = state;

  const contentAnalytics = useMemo(() => {
    // Content type distribution
    const contentTypeCounts = filteredData.reduce((acc, item) => {
      const type = item.content_type || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalEngagement: 0,
          avgEngagement: 0,
          channels: new Set(),
          sentiments: { Positive: 0, Negative: 0, Neutral: 0 }
        };
      }
      acc[type].count += 1;
      acc[type].totalEngagement += item.total_engagement || 0;
      acc[type].channels.add(item.channel);
      acc[type].sentiments[item.sentiment as keyof typeof acc[typeof type]['sentiments']] += 1;
      return acc;
    }, {} as Record<string, any>);

    const contentTypeData = Object.entries(contentTypeCounts)
      .map(([name, data], index) => ({
        name,
        value: data.count,
        percentage: Math.round((data.count / filteredData.length) * 100),
        color: CONTENT_TYPE_COLORS[index % CONTENT_TYPE_COLORS.length],
        avgEngagement: Math.round(data.totalEngagement / data.count),
        totalEngagement: data.totalEngagement,
        channels: data.channels.size,
        positiveRate: Math.round((data.sentiments.Positive / data.count) * 100)
      }))
      .sort((a, b) => b.value - a.value);

    // Category content analysis
    const categoryContentData = Object.entries(
      filteredData.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        if (!acc[category]) {
          acc[category] = { count: 0, engagement: 0 };
        }
        acc[category].count += 1;
        acc[category].engagement += item.total_engagement || 0;
        return acc;
      }, {} as Record<string, any>)
    )
      .map(([name, data]) => ({
        name,
        value: data.count,
        engagement: data.engagement,
        avgEngagement: Math.round(data.engagement / data.count)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Content performance by channel
    const channelContentData = Object.entries(
      filteredData.reduce((acc, item) => {
        const channel = item.channel || 'Unknown';
        const contentType = item.content_type || 'Unknown';
        
        if (!acc[channel]) {
          acc[channel] = {};
        }
        if (!acc[channel][contentType]) {
          acc[channel][contentType] = { count: 0, engagement: 0 };
        }
        
        acc[channel][contentType].count += 1;
        acc[channel][contentType].engagement += item.total_engagement || 0;
        
        return acc;
      }, {} as Record<string, Record<string, any>>)
    );

    // Most engaging content pieces
    const topContent = filteredData
      .sort((a, b) => (b.total_engagement || 0) - (a.total_engagement || 0))
      .slice(0, 10)
      .map(item => ({
        ...item,
        engagementScore: (item.total_engagement || 0) + 
          (item.comments || 0) * 2 + 
          (item.reactions || 0) * 1.5 + 
          (item.shares || 0) * 3
      }));

    // Content length analysis (if content available)
    const contentLengthData = filteredData
      .filter(item => item.content)
      .map(item => ({
        ...item,
        contentLength: item.content?.length || 0,
        category: item.content!.length < 100 ? 'Short' : 
                 item.content!.length < 300 ? 'Medium' : 'Long'
      }));

    const lengthPerformance = contentLengthData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, totalEngagement: 0 };
      }
      acc[item.category].count += 1;
      acc[item.category].totalEngagement += item.total_engagement || 0;
      return acc;
    }, {} as Record<string, any>);

    const lengthData = Object.entries(lengthPerformance)
      .map(([name, data]) => ({
        name,
        value: data.count,
        engagement: Math.round(data.totalEngagement / data.count)
      }));

    return {
      contentTypeData,
      categoryContentData,
      topContent,
      lengthData,
      channelContentData,
      totalPosts: filteredData.length,
      avgContentLength: Math.round(
        contentLengthData.reduce((sum, item) => sum + item.contentLength, 0) / 
        contentLengthData.length
      )
    };
  }, [filteredData]);

  const getContentIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('video')) return Video;
    if (lowerType.includes('image') || lowerType.includes('photo')) return Image;
    if (lowerType.includes('post') || lowerType.includes('text')) return FileText;
    return MessageCircle;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Content</p>
                <p className="text-2xl font-bold">{contentAnalytics.totalPosts.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content Types</p>
                <p className="text-2xl font-bold">{contentAnalytics.contentTypeData.length}</p>
              </div>
              <Hash className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Length</p>
                <p className="text-2xl font-bold">{contentAnalytics.avgContentLength}</p>
                <p className="text-xs text-muted-foreground">characters</p>
              </div>
              <MessageCircle className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Type</p>
                <p className="text-xl font-bold truncate">{contentAnalytics.contentTypeData[0]?.name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {contentAnalytics.contentTypeData[0]?.percentage || 0}% of content
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractivePieChart
          title="Content Type Distribution"
          data={contentAnalytics.contentTypeData}
          filterKey="contentTypes"
        />
        
        <InteractiveBarChart
          title="Content Categories"
          data={contentAnalytics.categoryContentData}
          filterKey="categories"
          dataKey="value"
          color="hsl(var(--chart-2))"
        />
      </div>

      {/* Content Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentAnalytics.contentTypeData.map((type, index) => {
                const Icon = getContentIcon(type.name);
                return (
                  <div key={type.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.value.toLocaleString()} posts ({type.percentage}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{type.avgEngagement.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">avg engagement</div>
                      <Badge 
                        className={`text-xs mt-1 ${
                          type.positiveRate >= 70 ? 'bg-success' : 
                          type.positiveRate >= 40 ? 'bg-warning' : 'bg-destructive'
                        }`}
                      >
                        {type.positiveRate}% positive
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {contentAnalytics.lengthData.length > 0 && (
          <InteractiveBarChart
            title="Content Length Performance"
            data={contentAnalytics.lengthData}
            filterKey="contentTypes"
            dataKey="engagement"
            color="hsl(var(--chart-3))"
          />
        )}
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentAnalytics.topContent.map((content, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-card hover:bg-card-hover rounded-lg border transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">{content.username}</div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{content.channel}</Badge>
                      <Badge variant="secondary">{content.content_type}</Badge>
                    </div>
                  </div>
                  <div className="text-sm mb-2 line-clamp-3">{content.content}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{content.total_engagement?.toLocaleString()} engagement</span>
                      <span>{content.comments?.toLocaleString()} comments</span>
                      <span>{content.reactions?.toLocaleString()} reactions</span>
                      <span>{content.shares?.toLocaleString()} shares</span>
                    </div>
                    <Badge className={`text-xs ${
                      content.sentiment === 'Positive' ? 'bg-success' :
                      content.sentiment === 'Negative' ? 'bg-destructive' : 'bg-warning'
                    }`}>
                      {content.sentiment}
                    </Badge>
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