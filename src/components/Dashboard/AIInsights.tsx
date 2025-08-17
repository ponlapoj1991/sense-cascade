import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Brain,
  Download,
  Calendar,
  Zap
} from "lucide-react";
import { KPIData, ChartData } from "@/types/dashboard";

interface AIInsightsProps {
  kpiData: KPIData;
  chartData: ChartData;
  isLoading?: boolean;
}

export function AIInsights({ kpiData, chartData, isLoading }: AIInsightsProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Generate insights based on data
  const generateInsights = () => {
    const insights = [];
    
    // Sentiment insight
    const positiveRatio = kpiData.sentimentScore.distribution.positive / 
      (kpiData.sentimentScore.distribution.positive + kpiData.sentimentScore.distribution.negative + kpiData.sentimentScore.distribution.neutral);
    
    if (positiveRatio > 0.7) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Strong Positive Sentiment',
        description: `${Math.round(positiveRatio * 100)}% of mentions are positive. Your brand perception is excellent.`,
        action: 'Amplify positive content'
      });
    } else if (positiveRatio < 0.4) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Sentiment Attention Needed',
        description: `Only ${Math.round(positiveRatio * 100)}% positive sentiment. Consider addressing concerns.`,
        action: 'Review negative feedback'
      });
    }

    // Channel performance insight
    const topChannel = chartData.channelPerformance[0];
    if (topChannel) {
      insights.push({
        type: 'info',
        icon: Target,
        title: 'Top Performing Channel',
        description: `${topChannel.channel} drives ${Math.round((topChannel.mentions / kpiData.totalMentions.value) * 100)}% of mentions.`,
        action: 'Optimize strategy'
      });
    }

    // Engagement trend insight
    if (kpiData.totalEngagement.trend === 'up') {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Growing Engagement',
        description: `Engagement increased by ${kpiData.totalEngagement.change.toFixed(1)}% compared to previous period.`,
        action: 'Maintain momentum'
      });
    }

    // Category insight
    const topCategory = chartData.topCategories[0];
    if (topCategory) {
      insights.push({
        type: 'info',
        icon: Lightbulb,
        title: 'Primary Discussion Topic',
        description: `${topCategory.category} represents ${topCategory.percentage}% of conversations.`,
        action: 'Focus content strategy'
      });
    }

    return insights.slice(0, 4); // Limit to 4 insights
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 text-success border-success/20';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Card */}
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="w-5 h-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-card-hover border border-border hover:shadow-card transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-${insight.type === 'success' ? 'success' : insight.type === 'warning' ? 'warning' : 'primary'}/10`}>
                  <insight.icon className={`w-4 h-4 ${getInsightColor(insight.type)}`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{insight.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={getInsightBadgeColor(insight.type)}
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs h-auto p-1 text-primary hover:text-primary-dark"
                  >
                    {insight.action} →
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-accent" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF Report
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
          >
            <Target className="w-4 h-4 mr-2" />
            Set Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}