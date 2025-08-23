export interface SocialMention {
  id: number;
  date: string;
  content: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  channel: 'Facebook' | 'Website' | 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube';
  content_type: 'Post' | 'Video' | 'Comment' | 'Story';
  total_engagement: number;
  username: string;
  category: 'Business Branding' | 'ESG Branding' | 'Crisis Management';
  sub_category: 'Sport' | 'Stock' | 'Net zero' | 'Corporate';
  type_of_speaker: 'Publisher' | 'Influencer voice' | 'Consumer' | 'Media';
  comments: number;
  reactions: number;
  shares: number;
}

// ✅ FIXED - เพิ่ม | null ให้กับ Date fields
export interface DashboardFilters {
  dateRange: {
    start: Date | null;  // ✅ แก้จาก Date เป็น Date | null
    end: Date | null;    // ✅ แก้จาก Date เป็น Date | null
  };
  channels: string[];
  sentiment: string[];
  categories: string[];
  timeframe: 'today' | 'week' | 'month' | 'custom';
}

export interface KPIData {
  totalMentions: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  totalEngagement: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  avgEngagementRate: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  sentimentScore: {
    value: number;
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
}

export interface ChartData {
  sentimentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  channelPerformance: Array<{
    channel: string;
    mentions: number;
    engagement: number;
  }>;
  timelineTrend: Array<{
    date: string;
    mentions: number;
    engagement: number;
  }>;
  topCategories: Array<{
    category: string;
    mentions: number;
    percentage: number;
  }>;
}

// ✅ เพิ่ม Extended Types สำหรับ Advanced Filtering
export interface ExtendedSocialMention extends SocialMention {
  // เพิ่ม computed fields ถ้าจำเป็น
  engagementRate?: number;
  sentimentScore?: number;
  isHighEngagement?: boolean;
}

export interface DateFilterOptions {
  preset: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  start?: Date | null;
  end?: Date | null;
  timezone?: string;
}

export interface FilterState {
  isActive: boolean;
  count: number;
  lastApplied: Date | null;
}

// ✅ Export utility types สำหรับ Type Safety
export type SentimentType = SocialMention['sentiment'];
export type ChannelType = SocialMention['channel'];
export type ContentType = SocialMention['content_type'];
export type CategoryType = SocialMention['category'];
export type SubCategoryType = SocialMention['sub_category'];
export type SpeakerType = SocialMention['type_of_speaker'];

// ✅ Export constants สำหรับ validation
export const SENTIMENT_OPTIONS: SentimentType[] = ['Positive', 'Negative', 'Neutral'];

export const CHANNEL_OPTIONS: ChannelType[] = [
  'Facebook', 'Website', 'Twitter', 'Instagram', 'TikTok', 'YouTube'
];

export const CONTENT_TYPE_OPTIONS: ContentType[] = [
  'Post', 'Video', 'Comment', 'Story'
];

export const CATEGORY_OPTIONS: CategoryType[] = [
  'Business Branding', 'ESG Branding', 'Crisis Management'
];

export const SUB_CATEGORY_OPTIONS: SubCategoryType[] = [
  'Sport', 'Stock', 'Net zero', 'Corporate'
];

export const SPEAKER_TYPE_OPTIONS: SpeakerType[] = [
  'Publisher', 'Influencer voice', 'Consumer', 'Media'
];

// ✅ Utility functions สำหรับ Date handling
export const DateUtils = {
  /**
   * แปลง ISO DateTime เป็น simple date string
   */
  toSimpleDate: (date: string | Date): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) {
        console.warn('Invalid date:', date);
        return new Date().toISOString().split('T')[0];
      }
      return d.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date conversion error:', error, date);
      return new Date().toISOString().split('T')[0];
    }
  },

  /**
   * เปรียบเทียบวันที่ (ไม่รวม time)
   */
  compareDatesOnly: (date1: Date, date2: Date): number => {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() - d2.getTime();
  },

  /**
   * ตรวจสอบว่าวันที่อยู่ในช่วงหรือไม่
   */
  isDateInRange: (date: string | Date, start: Date | null, end: Date | null): boolean => {
    try {
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(targetDate.getTime())) return false;

      const targetDateOnly = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(), 
        targetDate.getDate()
      );

      if (start) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        if (targetDateOnly < startDateOnly) return false;
      }

      if (end) {
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        if (targetDateOnly > endDateOnly) return false;
      }

      return true;
    } catch (error) {
      console.error('Date range check error:', error);
      return false;
    }
  },

  /**
   * Format วันที่สำหรับแสดงผล
   */
  formatDisplayDate: (date: string | Date): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }
};

// ✅ Validation functions
export const ValidationUtils = {
  /**
   * ตรวจสอบ SocialMention object
   */
  validateSocialMention: (item: any): item is SocialMention => {
    return (
      typeof item === 'object' &&
      typeof item.id === 'number' &&
      typeof item.date === 'string' &&
      typeof item.content === 'string' &&
      SENTIMENT_OPTIONS.includes(item.sentiment) &&
      CHANNEL_OPTIONS.includes(item.channel) &&
      CONTENT_TYPE_OPTIONS.includes(item.content_type) &&
      typeof item.total_engagement === 'number' &&
      typeof item.username === 'string' &&
      CATEGORY_OPTIONS.includes(item.category) &&
      SUB_CATEGORY_OPTIONS.includes(item.sub_category) &&
      SPEAKER_TYPE_OPTIONS.includes(item.type_of_speaker) &&
      typeof item.comments === 'number' &&
      typeof item.reactions === 'number' &&
      typeof item.shares === 'number'
    );
  },

  /**
   * ตรวจสอบและทำความสะอาดข้อมูล
   */
  sanitizeSocialMention: (item: any): SocialMention | null => {
    try {
      return {
        id: Number(item.id) || 0,
        date: DateUtils.toSimpleDate(item.date || new Date()),
        content: String(item.content || '').trim(),
        sentiment: SENTIMENT_OPTIONS.includes(item.sentiment) ? item.sentiment : 'Neutral',
        channel: CHANNEL_OPTIONS.includes(item.channel) ? item.channel : 'Website',
        content_type: CONTENT_TYPE_OPTIONS.includes(item.content_type) ? item.content_type : 'Post',
        total_engagement: Number(item.total_engagement) || 0,
        username: String(item.username || '').trim(),
        category: CATEGORY_OPTIONS.includes(item.category) ? item.category : 'Business Branding',
        sub_category: SUB_CATEGORY_OPTIONS.includes(item.sub_category) ? item.sub_category : 'Corporate',
        type_of_speaker: SPEAKER_TYPE_OPTIONS.includes(item.type_of_speaker) ? item.type_of_speaker : 'Consumer',
        comments: Number(item.comments) || 0,
        reactions: Number(item.reactions) || 0,
        shares: Number(item.shares) || 0
      };
    } catch (error) {
      console.error('Data sanitization error:', error, item);
      return null;
    }
  }
};
