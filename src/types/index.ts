/**
 * XTEP-like Application Types
 * X (Twitter) Marketing Automation Platform
 */

/**
 * Twitter/X User
 */
export interface XUser {
  id: string;
  username: string;
  displayName: string;
  followers: number;
  following: number;
}

/**
 * Twitter/X Post (Tweet)
 */
export interface XPost {
  id: string;
  authorId: string;
  text: string;
  createdAt: Date;
  likes: number;
  retweets: number;
  replies: number;
  hashtags: string[];
}

/**
 * Automation Rule
 */
export interface AutomationRule {
  id: string;
  name: string;
  type: 'dm' | 'reply' | 'auto_reply';
  trigger: AutomationTrigger;
  action: AutomationAction;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Automation Trigger
 */
export interface AutomationTrigger {
  type: 'like' | 'retweet' | 'follow' | 'keyword' | 'hashtag' | 'mention';
  conditions: {
    keywords?: string[];
    hashtags?: string[];
    minFollowers?: number;
  };
}

/**
 * Automation Action
 */
export interface AutomationAction {
  type: 'send_dm' | 'send_reply' | 'send_secret_reply';
  template: string;
  delay?: number; // seconds
}

/**
 * Campaign Type
 */
export type CampaignType = 'later_lottery' | 'instant_web' | 'instant_auto';

/**
 * Campaign
 */
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  description: string;
  startDate: Date;
  endDate: Date;
  prizes: Prize[];
  participants: Participant[];
  status: 'draft' | 'active' | 'ended';
  rules: CampaignRules;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Prize
 */
export interface Prize {
  id: string;
  name: string;
  quantity: number;
  remaining: number;
  imageUrl?: string;
}

/**
 * Campaign Participant
 */
export interface Participant {
  userId: string;
  username: string;
  enteredAt: Date;
  won: boolean;
  prizeId?: string;
}

/**
 * Campaign Rules
 */
export interface CampaignRules {
  requireFollow: boolean;
  requireRetweet: boolean;
  requireLike: boolean;
  requireHashtag?: string;
  winProbability?: number; // 0-100 for instant lottery
}

/**
 * Scheduled Post
 */
export interface ScheduledPost {
  id: string;
  text: string;
  scheduledAt: Date;
  status: 'pending' | 'posted' | 'failed';
  mediaUrls?: string[];
  createdAt: Date;
}

/**
 * Analytics Data
 */
export interface Analytics {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalPosts: number;
    totalLikes: number;
    totalRetweets: number;
    totalReplies: number;
    totalFollowers: number;
    followerGrowth: number;
    engagementRate: number;
  };
  topPosts: XPost[];
  hashtagPerformance: HashtagMetrics[];
}

/**
 * Hashtag Metrics
 */
export interface HashtagMetrics {
  hashtag: string;
  usage: number;
  reach: number;
  engagement: number;
}

/**
 * Application Configuration
 */
export interface XTEPConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  webhookUrl?: string;
  defaultDelay: number;
  maxRetries: number;
}
