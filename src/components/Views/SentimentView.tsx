import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractivePieChart } from '@/components/Charts/InteractivePieChart';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { useDashboard } from '@/contexts/DashboardContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, TrendingUp, AlertCircle, Smile } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const SENTIMENT_COLORS = {
  'Positive': 'hsl(var(--success))',
  'Negative': 'hsl(var(--destructive))',
  'Neutral': 'hsl(var(--warning))'
};

export function SentimentView() {
  const { state } = useDashboard();
  const { filteredData } = state;

  const sentimentAnalytics = useMemo(() => {
    // Overall sentiment distribution
    const sentimentCounts = filteredData.reduce((acc, item) => {
      const sentiment = item.sentiment || 'Unknown';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMentions = filteredData.length;
    const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalMentions) * 100),
      color: SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS] || 'hsl(var(--muted-foreground))'
    }));

    // Sentiment by channel
    const channelSentiment = filteredData.reduce((acc, item) => {
      const channel = item.channel || 'Unknown';
      const sentiment = item.sentiment || 'Unknown';
      
      if (!acc[channel]) {
        acc[channel] = { Positive: 0, Negative: 0, Neutral: 0, total: 0 };
      }
      
      acc[channel][sentiment as keyof typeof acc[typeof channel]] = 
        (acc[channel][sentiment as keyof typeof acc[typeof channel]] || 0) + 1;
      acc[channel].total += 1;
      
      return acc;
    }, {} as Record<string, Record<string, number>>);

    const channelSentimentData = Object.entries(channelSentiment)
      .map(([channel, sentiments]) => {
        const positiveRate = Math.round((sentiments.Positive / sentiments.total) * 100);
        return {
          name: channel,
          value: positiveRate,
          total: sentiments.total,
          positive: sentiments.Positive,
          negative: sentiments.Negative,
          neutral: sentiments.Neutral
        };
      })
      .sort((a, b) => b.value - a.value);

    // Sentiment timeline
    const timelineData = filteredData
      .filter(item => item.date)
      .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
      .reduce((acc, item) => {
        const date = new Date(item.date!);
        if (!isValid(date)) return acc;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        const sentiment = item.sentiment || 'Unknown';
        
        if (!acc[dateStr]) {
          acc[dateStr] = { date: dateStr, Positive: 0, Negative: 0, Neutral: 0, total: 0 };
        }
        
        acc[dateStr][sentiment as keyof Omit<typeof acc[typeof dateStr], 'date' | 'total'>]++;
        acc[dateStr].total++;
        
        return acc;
      }, {} as Record<string, any>);

    const timelineArray = Object.values(timelineData)
      .map((day: any) => ({
        ...day,
        positiveRate: Math.round((day.Positive / day.total) * 100),
        negativeRate: Math.round((day.Negative / day.total) * 100)
      }))
      .slice(-30); // Last 30 days

    // Top positive/negative mentions
    const positiveMentions = filteredData
      .filter(item => item.sentiment === 'Positive')
      .sort((a, b) => (b.total_engagement || 0) - (a.total_engagement || 0))
      .slice(0, 5);

    const negativeMentions = filteredData
      .filter(item => item.sentiment === 'Negative')
      .sort((a, b) => (b.total_engagement || 0) - (a.total_engagement || 0))
      .slice(0, 5);

    return {
      sentimentData,
      channelSentimentData,
      timelineArray,
      positiveMentions,
      negativeMentions,
      sentimentScore: sentimentData.find(s => s.name === 'Positive')?.percentage || 0
    };
  }, [filteredData]);

  const SentimentCard = ({ title, value, icon: Icon, color, subtitle }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}%</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Sentiment KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SentimentCard
          title="Positive Sentiment"
          value={sentimentAnalytics.sentimentData.find(s => s.name === 'Positive')?.percentage || 0}
          icon={Smile}
          color="text-success"
          subtitle={`${sentimentAnalytics.sentimentData.find(s => s.name === 'Positive')?.value || 0} mentions`}
        />
        <SentimentCard
          title="Negative Sentiment"
          value={sentimentAnalytics.sentimentData.find(s => s.name === 'Negative')?.percentage || 0}
          icon={AlertCircle}
          color="text-destructive"
          subtitle={`${sentimentAnalytics.sentimentData.find(s => s.name === 'Negative')?.value || 0} mentions`}
        />
        <SentimentCard
          title="Overall Score"
          value={sentimentAnalytics.sentimentScore}
          icon={Heart}
          color="text-primary"
          subtitle="Brand health indicator"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractivePieChart
          title="Sentiment Distribution"
          data={sentimentAnalytics.sentimentData}
          filterKey="sentiment"
        />
        
        <InteractiveBarChart
          title="Sentiment by Channel (% Positive)"
          data={sentimentAnalytics.channelSentimentData}
          filterKey="channels"
          dataKey="value"
          color="hsl(var(--success))"
        />
      </div>

      {/* Sentiment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sentiment Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentAnalytics.timelineArray}>
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
                  domain={[0, 100]}
                />
                <Tooltip
                  labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                  formatter={(value: any, name: string) => [`${value}%`, name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="positiveRate" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Positive Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="negativeRate" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Negative Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Mentions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-success">Top Positive Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentAnalytics.positiveMentions.map((mention, index) => (
                <div key={index} className="border-l-4 border-success pl-4">
                  <div className="text-sm font-medium">{mention.username}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {mention.channel} • {mention.total_engagement?.toLocaleString()} engagement
                  </div>
                  <div className="text-sm line-clamp-2">{mention.content}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Top Negative Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentimentAnalytics.negativeMentions.map((mention, index) => (
                <div key={index} className="border-l-4 border-destructive pl-4">
                  <div className="text-sm font-medium">{mention.username}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {mention.channel} • {mention.total_engagement?.toLocaleString()} engagement
                  </div>
                  <div className="text-sm line-clamp-2">{mention.content}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}