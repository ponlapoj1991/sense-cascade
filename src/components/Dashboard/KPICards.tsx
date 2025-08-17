import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, MessageSquare, Heart, Target, BarChart3 } from "lucide-react";
import { KPIData } from "@/types/dashboard";
import { formatNumber, formatPercentage } from "@/utils/dataProcessing";

interface KPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gradient-card shadow-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-muted rounded-lg"></div>
                  <div className="w-16 h-4 bg-muted rounded"></div>
                </div>
                <div className="w-24 h-8 bg-muted rounded mb-2"></div>
                <div className="w-20 h-4 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Mentions",
      value: formatNumber(data.totalMentions.value),
      change: data.totalMentions.change,
      trend: data.totalMentions.trend,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Total Engagement",
      value: formatNumber(data.totalEngagement.value),
      change: data.totalEngagement.change,
      trend: data.totalEngagement.trend,
      icon: Heart,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Avg Engagement Rate",
      value: formatNumber(Math.round(data.avgEngagementRate.value)),
      change: data.avgEngagementRate.change,
      trend: data.avgEngagementRate.trend,
      icon: BarChart3,
      color: "text-chart-3",
      bgColor: "bg-success/10"
    },
    {
      title: "Sentiment Score",
      value: `${data.sentimentScore.value}/100`,
      change: 0, // Sentiment score doesn't have a change comparison
      trend: 'stable' as const,
      icon: Target,
      color: data.sentimentScore.value >= 70 ? "text-success" : data.sentimentScore.value >= 50 ? "text-warning" : "text-destructive",
      bgColor: data.sentimentScore.value >= 70 ? "bg-success/10" : data.sentimentScore.value >= 50 ? "bg-warning/10" : "bg-destructive/10"
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return "text-success";
      case 'down':
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 border-0 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              {card.change !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${getTrendColor(card.trend)}`}>
                  {getTrendIcon(card.trend)}
                  <span>{formatPercentage(card.change)}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}