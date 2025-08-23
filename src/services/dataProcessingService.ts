import { SocialMention } from '@/types/dashboard';

export interface QueryType {
  type: 'overview' | 'filtered' | 'content_analysis' | 'multi_dimension';
  limit: number;
  filters: FilterCondition[];
  contentAnalysis: boolean;
  dimensions: string[];
}

export interface FilterCondition {
  field: keyof SocialMention;
  value: any;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
}

export interface ProcessedContext {
  queryType: QueryType;
  totalItems: number;
  filteredItems: number;
  
  // Aggregated metrics
  sentimentBreakdown: {
    positive: { count: number; percentage: number; totalEngagement: number };
    negative: { count: number; percentage: number; totalEngagement: number };
    neutral: { count: number; percentage: number; totalEngagement: number };
  };
  
  channelBreakdown: Record<string, {
    count: number;
    percentage: number;
    avgEngagement: number;
    topContent: string[];
  }>;
  
  engagementStats: {
    total: number;
    average: number;
    median: number;
    top10Total: number;
  };
  
  // Content analysis
  contentInsights?: {
    totalPosts: number;
    avgContentLength: number;
    topKeywords: Array<{ word: string; count: number }>;
    topHashtags: Array<{ tag: string; count: number }>;
    contentSamples: Array<{
      content: string;
      engagement: number;
      sentiment: string;
      channel: string;
    }>;
  };
  
  // Query results
  topResults: SocialMention[];
  summary: string;
}

export class DataProcessingService {
  
  // Smart Query Detection (ปรับปรุงจาก Apps Script)
  static detectQueryType(userMessage: string): QueryType {
    const message = userMessage.toLowerCase();
    
    // ตรวจจับ Content Analysis queries
    const contentKeywords = [
      'เนื้อหา', 'content', 'post', 'caption', 'ข้อความ', 
      'คำ', 'hashtag', 'keyword', 'เขียน', 'พูด', 'กล่าว'
    ];
    const hasContentAnalysis = contentKeywords.some(keyword => message.includes(keyword));
    
    // ตรวจจับ Multi-dimension analysis
    const multiDimensionKeywords = [
      'เปรียบเทียบ', 'compare', 'แยกตาม', 'กลุ่ม', 'ประเภท', 
      'ช่องทาง', 'sentiment', 'วิเคราะห์หลาก', 'breakdown'
    ];
    const isMultiDimension = multiDimensionKeywords.some(keyword => message.includes(keyword));
    
    // ตรวจจับ Overview queries
    if (message.includes('ทั้งหมด') || message.includes('สรุป') || message.includes('ภาพรวม') || 
        message.includes('total') || message.includes('overall') || message.includes('รวม')) {
      return { 
        type: 'overview', 
        limit: 0, 
        filters: [], 
        contentAnalysis: hasContentAnalysis,
        dimensions: isMultiDimension ? ['channel', 'sentiment', 'category'] : []
      };
    }
    
    // ตรวจจับ Top N queries
    const topMatch = message.match(/top\s*(\d+)|(\d+)\s*อันดับ|(\d+)\s*แรก/);
    const limit = topMatch ? parseInt(topMatch[1] || topMatch[2] || topMatch[3]) || 10 : 10;
    
    // ตรวจจับ filters
    const filters: FilterCondition[] = [];
    
    // Category filters
    if (message.includes('business branding')) {
      filters.push({ field: 'category', value: 'Business Branding', operator: 'equals' });
    }
    if (message.includes('esg')) {
      filters.push({ field: 'category', value: 'ESG Branding', operator: 'equals' });
    }
    if (message.includes('employer branding')) {
      filters.push({ field: 'category', value: 'Employer Branding', operator: 'equals' });
    }
    
    // Channel filters
    const channels = ['facebook', 'instagram', 'tiktok', 'youtube', 'twitter', 'website'];
    channels.forEach(channel => {
      if (message.includes(channel)) {
        const channelValue = channel === 'twitter' ? 'X' : 
                           channel.charAt(0).toUpperCase() + channel.slice(1);
        filters.push({ field: 'channel', value: channelValue, operator: 'equals' });
      }
    });
    
    // Sentiment filters
    if (message.includes('positive') || message.includes('บวก')) {
      filters.push({ field: 'sentiment', value: 'Positive', operator: 'equals' });
    }
    if (message.includes('negative') || message.includes('ลบ')) {
      filters.push({ field: 'sentiment', value: 'Negative', operator: 'equals' });
    }
    if (message.includes('neutral') || message.includes('กลาง')) {
      filters.push({ field: 'sentiment', value: 'Neutral', operator: 'equals' });
    }
    
    // Engagement filters
    if (message.includes('engagement สูง') || message.includes('viral')) {
      filters.push({ field: 'total_engagement', value: 1000, operator: 'greater_than' });
    }
    
    return {
      type: hasContentAnalysis ? 'content_analysis' : 
            isMultiDimension ? 'multi_dimension' : 'filtered',
      limit,
      filters,
      contentAnalysis: hasContentAnalysis,
      dimensions: isMultiDimension ? ['channel', 'sentiment'] : []
    };
  }
  
  // Apply filters to data
  static applyFilters(data: SocialMention[], filters: FilterCondition[]): SocialMention[] {
    return data.filter(item => {
      return filters.every(filter => {
        const fieldValue = item[filter.field];
        
        switch (filter.operator) {
          case 'equals':
            return String(fieldValue).toLowerCase() === String(filter.value).toLowerCase();
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater_than':
            return Number(fieldValue) > Number(filter.value);
          case 'less_than':
            return Number(fieldValue) < Number(filter.value);
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          default:
            return true;
        }
      });
    });
  }
  
  // Calculate sentiment breakdown
  static calculateSentimentBreakdown(data: SocialMention[]) {
    const total = data.length;
    const breakdown = { positive: 0, negative: 0, neutral: 0 };
    const engagement = { positive: 0, negative: 0, neutral: 0 };
    
    data.forEach(item => {
      const sentiment = item.sentiment.toLowerCase();
      if (sentiment === 'positive') {
        breakdown.positive++;
        engagement.positive += item.total_engagement;
      } else if (sentiment === 'negative') {
        breakdown.negative++;
        engagement.negative += item.total_engagement;
      } else {
        breakdown.neutral++;
        engagement.neutral += item.total_engagement;
      }
    });
    
    return {
      positive: {
        count: breakdown.positive,
        percentage: Math.round((breakdown.positive / total) * 100),
        totalEngagement: engagement.positive
      },
      negative: {
        count: breakdown.negative,
        percentage: Math.round((breakdown.negative / total) * 100),
        totalEngagement: engagement.negative
      },
      neutral: {
        count: breakdown.neutral,
        percentage: Math.round((breakdown.neutral / total) * 100),
        totalEngagement: engagement.neutral
      }
    };
  }
  
  // Calculate channel breakdown
  static calculateChannelBreakdown(data: SocialMention[]) {
    const channelStats: Record<string, {
      count: number;
      totalEngagement: number;
      contents: Array<{ content: string; engagement: number }>;
    }> = {};
    
    data.forEach(item => {
      const channel = item.channel;
      if (!channelStats[channel]) {
        channelStats[channel] = { count: 0, totalEngagement: 0, contents: [] };
      }
      
      channelStats[channel].count++;
      channelStats[channel].totalEngagement += item.total_engagement;
      
      // เก็บ content สำหรับ analysis
      channelStats[channel].contents.push({
        content: item.content.substring(0, 100),
        engagement: item.total_engagement
      });
    });
    
    const result: Record<string, any> = {};
    const total = data.length;
    
    Object.entries(channelStats).forEach(([channel, stats]) => {
      // เรียง content ตาม engagement
      const topContent = stats.contents
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 3)
        .map(c => c.content);
      
      result[channel] = {
        count: stats.count,
        percentage: Math.round((stats.count / total) * 100),
        avgEngagement: Math.round(stats.totalEngagement / stats.count),
        topContent
      };
    });
    
    return result;
  }
  
  // Content Analysis
  static analyzeContent(data: SocialMention[]) {
    const contents = data.map(item => item.content).filter(Boolean);
    
    // คำนวณ average content length
    const avgContentLength = Math.round(
      contents.reduce((sum, content) => sum + content.length, 0) / contents.length
    );
    
    // Extract keywords (basic implementation)
    const allWords = contents
      .join(' ')
      .toLowerCase()
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const wordCount: Record<string, number> = {};
    allWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const topKeywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    
    // Extract hashtags
    const hashtags = contents
      .join(' ')
      .match(/#[\u0E00-\u0E7Fa-zA-Z0-9_]+/g) || [];
    
    const hashtagCount: Record<string, number> = {};
    hashtags.forEach(tag => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
    });
    
    const topHashtags = Object.entries(hashtagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    // Content samples with high engagement
    const contentSamples = data
      .filter(item => item.content && item.content.length > 10)
      .sort((a, b) => b.total_engagement - a.total_engagement)
      .slice(0, 5)
      .map(item => ({
        content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''),
        engagement: item.total_engagement,
        sentiment: item.sentiment,
        channel: item.channel
      }));
    
    return {
      totalPosts: data.length,
      avgContentLength,
      topKeywords,
      topHashtags,
      contentSamples
    };
  }
  
  // Calculate engagement stats
  static calculateEngagementStats(data: SocialMention[]) {
    const engagements = data.map(item => item.total_engagement).sort((a, b) => b - a);
    
    const total = engagements.reduce((sum, eng) => sum + eng, 0);
    const average = Math.round(total / engagements.length);
    const median = engagements[Math.floor(engagements.length / 2)];
    const top10Total = engagements.slice(0, 10).reduce((sum, eng) => sum + eng, 0);
    
    return { total, average, median, top10Total };
  }
  
  // Generate summary
  static generateSummary(queryType: QueryType, originalData: SocialMention[], filteredData: SocialMention[]): string {
    const filterDescriptions = queryType.filters.map(f => 
      `${f.field}=${f.value}`
    ).join(', ');
    
    let summary = `Query Type: ${queryType.type}`;
    if (queryType.filters.length > 0) {
      summary += ` with filters: ${filterDescriptions}`;
    }
    summary += `\nOriginal data: ${originalData.length} items`;
    summary += `\nFiltered data: ${filteredData.length} items`;
    
    if (queryType.limit > 0) {
      summary += `\nShowing top ${Math.min(queryType.limit, filteredData.length)} results`;
    }
    
    return summary;
  }
  
  // Main processing function
  static processDataForAI(
    userMessage: string,
    originalData: SocialMention[],
    currentFilters: any,
    currentView: string
  ): ProcessedContext {
    // Detect query type
    const queryType = this.detectQueryType(userMessage);
    
    // Apply current dashboard filters first
    let workingData = originalData;
    
    // Apply dashboard filters
    if (currentFilters.sentiment.length > 0) {
      workingData = workingData.filter(item => 
        currentFilters.sentiment.includes(item.sentiment)
      );
    }
    
    if (currentFilters.channels.length > 0) {
      workingData = workingData.filter(item => 
        currentFilters.channels.includes(item.channel)
      );
    }
    
    if (currentFilters.categories.length > 0) {
      workingData = workingData.filter(item => 
        currentFilters.categories.includes(item.category)
      );
    }
    
    // Apply query-specific filters
    const filteredData = this.applyFilters(workingData, queryType.filters);
    
    // Sort by engagement (descending)
    const sortedData = filteredData.sort((a, b) => b.total_engagement - a.total_engagement);
    
    // Calculate metrics
    const sentimentBreakdown = this.calculateSentimentBreakdown(sortedData);
    const channelBreakdown = this.calculateChannelBreakdown(sortedData);
    const engagementStats = this.calculateEngagementStats(sortedData);
    
    // Content analysis (if requested)
    let contentInsights;
    if (queryType.contentAnalysis || currentView === 'content') {
      contentInsights = this.analyzeContent(sortedData);
    }
    
    // Get top results
    const topResults = queryType.limit > 0 
      ? sortedData.slice(0, queryType.limit)
      : sortedData.slice(0, 50); // Max 50 for overview
    
    const summary = this.generateSummary(queryType, originalData, sortedData);
    
    return {
      queryType,
      totalItems: originalData.length,
      filteredItems: sortedData.length,
      sentimentBreakdown,
      channelBreakdown,
      engagementStats,
      contentInsights,
      topResults,
      summary
    };
  }
}
