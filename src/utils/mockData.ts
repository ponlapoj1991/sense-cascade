import { SocialMention } from '@/types/dashboard';

const channels = ['Facebook', 'Website', 'Twitter', 'Instagram', 'TikTok', 'YouTube'] as const;
const sentiments = ['Positive', 'Negative', 'Neutral'] as const;
const contentTypes = ['Post', 'Video', 'Comment', 'Story'] as const;
const categories = ['Business Branding', 'ESG Branding', 'Crisis Management'] as const;
const subCategories = ['Sport', 'Stock', 'Net zero', 'Corporate'] as const;
const speakerTypes = ['Publisher', 'Influencer voice', 'Consumer', 'Media'] as const;

const sampleContents = [
  "Great service from this company! Highly recommend their approach to customer satisfaction.",
  "The new product launch was fantastic. Really impressed with the innovation.",
  "Could be better. The customer service response time needs improvement.",
  "Love the company's commitment to sustainability and environmental responsibility.",
  "Amazing results from their recent ESG initiatives. True corporate leadership.",
  "The latest announcement shows they really care about their community impact.",
  "Not satisfied with the recent changes. Hope they address customer concerns soon.",
  "Excellent presentation at the conference. Very professional and insightful.",
  "Their stock performance has been impressive this quarter.",
  "The company's response to the crisis was handled professionally and transparently."
];

const usernames = [
  'social_enthusiast', 'business_watcher', 'green_advocate', 'market_analyst',
  'customer_voice', 'industry_insider', 'brand_follower', 'stock_trader',
  'sustainability_fan', 'corporate_observer', 'consumer_rights', 'media_reporter',
  'investment_guru', 'eco_warrior', 'business_student', 'marketing_pro'
];

export function generateMockData(count: number = 1000): SocialMention[] {
  const data: SocialMention[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Weighted distribution for sentiment (60% positive, 35% neutral, 5% negative)
    let sentiment: typeof sentiments[number];
    const sentimentRand = Math.random();
    if (sentimentRand < 0.6) {
      sentiment = 'Positive';
    } else if (sentimentRand < 0.95) {
      sentiment = 'Neutral';
    } else {
      sentiment = 'Negative';
    }
    
    // Weighted distribution for channels (Facebook 40%, Website 35%, others 25%)
    let channel: typeof channels[number];
    const channelRand = Math.random();
    if (channelRand < 0.4) {
      channel = 'Facebook';
    } else if (channelRand < 0.75) {
      channel = 'Website';
    } else {
      const remainingChannels = ['Twitter', 'Instagram', 'TikTok', 'YouTube'];
      channel = remainingChannels[Math.floor(Math.random() * remainingChannels.length)] as typeof channels[number];
    }
    
    // Generate engagement numbers based on channel and sentiment
    const baseEngagement = {
      'Facebook': { min: 10, max: 200 },
      'Website': { min: 5, max: 100 },
      'Twitter': { min: 15, max: 150 },
      'Instagram': { min: 20, max: 300 },
      'TikTok': { min: 50, max: 500 },
      'YouTube': { min: 30, max: 250 }
    }[channel];
    
    const sentimentMultiplier = sentiment === 'Positive' ? 1.5 : sentiment === 'Negative' ? 0.7 : 1;
    const maxEngagement = Math.floor(baseEngagement.max * sentimentMultiplier);
    const minEngagement = Math.floor(baseEngagement.min * sentimentMultiplier);
    
    const totalEngagement = Math.floor(Math.random() * (maxEngagement - minEngagement) + minEngagement);
    
    // Distribute engagement across reactions, comments, shares
    const reactions = Math.floor(totalEngagement * (0.6 + Math.random() * 0.3)); // 60-90%
    const comments = Math.floor(totalEngagement * (0.05 + Math.random() * 0.15)); // 5-20%
    const shares = totalEngagement - reactions - comments;
    
    const mention: SocialMention = {
      id: i + 1,
      date: date.toISOString().split('T')[0],
      content: sampleContents[Math.floor(Math.random() * sampleContents.length)],
      sentiment,
      channel,
      content_type: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      total_engagement: totalEngagement,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      sub_category: subCategories[Math.floor(Math.random() * subCategories.length)],
      type_of_speaker: speakerTypes[Math.floor(Math.random() * speakerTypes.length)],
      comments,
      reactions,
      shares: Math.max(0, shares)
    };
    
    data.push(mention);
  }
  
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockData = generateMockData(1200);