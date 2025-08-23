import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { useDashboard } from '@/contexts/DashboardContext';
import { Users, TrendingUp, MessageCircle, Award, Crown, Star } from 'lucide-react';

export function InfluencerView() {
  const { state } = useDashboard();
  const { filteredData } = state;

  const influencerAnalytics = useMemo(() => {
    // Top influencers by engagement
    const influencerMetrics = filteredData.reduce((acc, item) => {
      const username = item.username || 'Unknown';
      if (!acc[username]) {
        acc[username] = {
          mentions: 0,
          totalEngagement: 0,
          avgEngagement: 0,
          channels: new Set(),
          sentiments: { Positive: 0, Negative: 0, Neutral: 0 },
          contentTypes: new Set(),
          categories: new Set()
        };
      }
      
      acc[username].mentions += 1;
      acc[username].totalEngagement += item.total_engagement || 0;
      acc[username].channels.add(item.Channel);
      acc[username].sentiments[item.sentiment as keyof typeof acc[typeof username]['sentiments']] += 1;
      acc[username].contentTypes.add(item.content_type);
      acc[username].categories.add(item.Category);
      
      return acc;
    }, {} as Record<string, any>);

    // Process and rank influencers
    const topInfluencers = Object.entries(influencerMetrics)
      .map(([username, metrics]) => ({
        username,
        mentions: metrics.mentions,
        totalEngagement: metrics.totalEngagement,
        avgEngagement: Math.round(metrics.totalEngagement / metrics.mentions),
        channels: Array.from(metrics.channels),
        positiveRate: Math.round((metrics.sentiments.Positive / metrics.mentions) * 100),
        negativeRate: Math.round((metrics.sentiments.Negative / metrics.mentions) * 100),
        contentTypes: Array.from(metrics.contentTypes),
        categories: Array.from(metrics.categories),
        influenceScore: Math.round(
          (metrics.totalEngagement * 0.4) + 
          (metrics.mentions * 0.3) + 
          (metrics.sentiments.Positive * 10 * 0.3)
        )
      }))
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, 50);

    // Speaker type analysis
    const speakerTypeMetrics = filteredData.reduce((acc, item) => {
      const type = item.type_of_speaker || 'Unknown';
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalEngagement: 0,
          uniqueUsers: new Set()
        };
      }
      acc[type].count += 1;
      acc[type].totalEngagement += item.total_engagement || 0;
      acc[type].uniqueUsers.add(item.username);
      return acc;
    }, {} as Record<string, any>);

    const speakerTypeData = Object.entries(speakerTypeMetrics)
      .map(([name, metrics]) => ({
        name,
        value: metrics.count,
        engagement: metrics.totalEngagement,
        uniqueUsers: metrics.uniqueUsers.size,
        avgEngagement: Math.round(metrics.totalEngagement / metrics.count)
      }))
      .sort((a, b) => b.value - a.value);

    // Channel influence distribution
    const channelInfluenceData = Object.entries(
      filteredData.reduce((acc, item) => {
        const channel = item.Channel || 'Unknown';
        if (!acc[channel]) {
          acc[channel] = { users: new Set(), engagement: 0 };
        }
        acc[channel].users.add(item.username);
        acc[channel].engagement += item.total_engagement || 0;
        return acc;
      }, {} as Record<string, any>)
    )
      .map(([name, data]) => ({
        name,
        value: data.users.size,
        engagement: data.engagement
      }))
      .sort((a, b) => b.value - a.value);

    return {
      topInfluencers,
      speakerTypeData,
      channelInfluenceData
    };
  }, [filteredData]);

  const getTierIcon = (rank: number) => {
    if (rank === 0) return Crown;
    if (rank <= 2) return Award;
    if (rank <= 9) return Star;
    return Users;
  };

  const getTierColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-500';
    if (rank <= 2) return 'text-gray-400';
    if (rank <= 9) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const getSentimentBadgeColor = (rate: number) => {
    if (rate >= 70) return 'bg-success text-success-foreground';
    if (rate >= 40) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Influencer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Influencers</p>
                <p className="text-2xl font-bold">{influencerAnalytics.topInfluencers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active users</p>
              </div>
              <Users className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Influencer</p>
                <p className="text-2xl font-bold truncate">{influencerAnalytics.topInfluencers[0]?.username || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {influencerAnalytics.topInfluencers[0]?.influenceScore.toLocaleString()} influence score
                </p>
              </div>
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    influencerAnalytics.topInfluencers.reduce((sum, inf) => sum + inf.avgEngagement, 0) / 
                    influencerAnalytics.topInfluencers.length
                  ).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">per influencer</p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveBarChart
          title="Speaker Types"
          data={influencerAnalytics.speakerTypeData}
          filterKey="speakerTypes"
          dataKey="value"
          color="hsl(var(--chart-3))"
        />
        
        <InteractiveBarChart
          title="Channel Influence (Unique Users)"
          data={influencerAnalytics.channelInfluenceData}
          filterKey="channels"
          dataKey="value"
          color="hsl(var(--chart-4))"
        />
      </div>

      {/* Top Influencers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Influencers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {influencerAnalytics.topInfluencers.slice(0, 20).map((influencer, index) => {
              const TierIcon = getTierIcon(index);
              const tierColor = getTierColor(index);
              
              return (
                <div key={`influencer-${index}`} className="flex items-center space-x-4 p-4 bg-card hover:bg-card-hover rounded-lg border transition-colors">
                  <div className="flex items-center space-x-3">
                    <TierIcon className={`h-6 w-6 ${tierColor}`} />
                    <div className="text-lg font-bold text-muted-foreground min-w-[2rem]">#{index + 1}</div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">{influencer.username}</h3>
                      <Badge variant="outline" className="ml-2">
                        {influencer.influenceScore.toLocaleString()} score
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mentions:</span>
                        <div className="font-medium">{influencer.mentions.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Engagement:</span>
                        <div className="font-medium">{influencer.avgEngagement.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Channels:</span>
                        <div className="font-medium">{influencer.channels.length}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sentiment:</span>
                        <Badge 
                          className={`text-xs ${getSentimentBadgeColor(influencer.positiveRate)}`}
                        >
                          {influencer.positiveRate}% positive
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {influencer.channels.slice(0, 3).map((channel: string, index: number) => (
                        <Badge key={`${channel}-${index}`} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                      {influencer.channels.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{influencer.channels.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}