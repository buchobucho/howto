/**
 * XTEP-like Application
 * X (Twitter) Marketing Automation Platform
 */

import { AutomationService } from './services/AutomationService.js';
import { CampaignService } from './services/CampaignService.js';
import { SchedulerService } from './services/SchedulerService.js';
import { AnalyticsService } from './services/AnalyticsService.js';
import type { XTEPConfig, XUser, XPost } from './types/index.js';

export class XTEPApp {
  private config: XTEPConfig;
  private automation: AutomationService;
  private campaigns: CampaignService;
  private scheduler: SchedulerService;
  private analytics: AnalyticsService;

  constructor(config: Partial<XTEPConfig> = {}) {
    this.config = {
      defaultDelay: 3,
      maxRetries: 3,
      ...config,
    };

    // Initialize services
    this.automation = new AutomationService();
    this.campaigns = new CampaignService();
    this.scheduler = new SchedulerService();
    this.analytics = new AnalyticsService();

    console.log('🌸 XTEP-like App initialized');
  }

  /**
   * Start the application
   */
  start(): void {
    this.scheduler.start();
    console.log('✓ Application started');
  }

  /**
   * Stop the application
   */
  stop(): void {
    this.scheduler.stop();
    console.log('✓ Application stopped');
  }

  /**
   * Get automation service
   */
  getAutomation(): AutomationService {
    return this.automation;
  }

  /**
   * Get campaign service
   */
  getCampaigns(): CampaignService {
    return this.campaigns;
  }

  /**
   * Get scheduler service
   */
  getScheduler(): SchedulerService {
    return this.scheduler;
  }

  /**
   * Get analytics service
   */
  getAnalytics(): AnalyticsService {
    return this.analytics;
  }

  /**
   * Get configuration
   */
  getConfig(): XTEPConfig {
    return { ...this.config };
  }

  /**
   * Process incoming post (webhook handler)
   */
  async processIncomingPost(post: XPost, user: XUser): Promise<void> {
    // Track for analytics
    this.analytics.trackPost(post);

    // Process automation rules
    await this.automation.processPost(post, user);

    // Check if user is entering any active campaigns
    const activeCampaigns = this.campaigns.getActiveCampaigns();
    for (const campaign of activeCampaigns) {
      // Check if post meets campaign requirements
      if (this.meetsRequirements(post, user, campaign.rules)) {
        await this.campaigns.enterCampaign(campaign.id, user);
      }
    }
  }

  /**
   * Check if post/user meets campaign requirements
   */
  private meetsRequirements(post: XPost, user: XUser, rules: any): boolean {
    // This would check for follows, retweets, likes, hashtags, etc.
    // Simplified for now
    if (rules.requireHashtag) {
      return post.hashtags.some(
        (tag) => tag.toLowerCase() === rules.requireHashtag.toLowerCase()
      );
    }
    return true;
  }

  /**
   * Show application status
   */
  getStatus(): {
    automation: {
      totalRules: number;
      enabledRules: number;
    };
    campaigns: {
      total: number;
      active: number;
      draft: number;
      ended: number;
    };
    scheduler: {
      totalScheduled: number;
      pending: number;
      posted: number;
      failed: number;
      upcomingToday: number;
    };
    analytics: {
      totalPosts: number;
      totalFollowers: number;
    };
  } {
    const rules = this.automation.getRules();
    const campaigns = this.campaigns.getCampaigns();
    const schedulerStats = this.scheduler.getStatistics();

    return {
      automation: {
        totalRules: rules.length,
        enabledRules: rules.filter((r) => r.enabled).length,
      },
      campaigns: {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'active').length,
        draft: campaigns.filter((c) => c.status === 'draft').length,
        ended: campaigns.filter((c) => c.status === 'ended').length,
      },
      scheduler: schedulerStats,
      analytics: {
        totalPosts: this.analytics.getTotalPosts(),
        totalFollowers: this.analytics.getCurrentFollowers(),
      },
    };
  }

  /**
   * Show detailed status report
   */
  getDetailedReport(): string {
    const status = this.getStatus();

    let report = `# XTEP Application Status\n\n`;

    report += `## Automation\n`;
    report += `- Total Rules: ${status.automation.totalRules}\n`;
    report += `- Enabled Rules: ${status.automation.enabledRules}\n\n`;

    report += `## Campaigns\n`;
    report += `- Total: ${status.campaigns.total}\n`;
    report += `- Active: ${status.campaigns.active}\n`;
    report += `- Draft: ${status.campaigns.draft}\n`;
    report += `- Ended: ${status.campaigns.ended}\n\n`;

    report += `## Scheduler\n`;
    report += `- Total Scheduled: ${status.scheduler.totalScheduled}\n`;
    report += `- Pending: ${status.scheduler.pending}\n`;
    report += `- Posted: ${status.scheduler.posted}\n`;
    report += `- Failed: ${status.scheduler.failed}\n`;
    report += `- Upcoming Today: ${status.scheduler.upcomingToday}\n\n`;

    report += `## Analytics\n`;
    report += `- Total Posts Tracked: ${status.analytics.totalPosts}\n`;
    report += `- Current Followers: ${status.analytics.totalFollowers}\n\n`;

    return report;
  }

  /**
   * Demo mode - create sample data
   */
  async runDemo(): Promise<void> {
    console.log('\n🎬 Running XTEP Demo...\n');

    // Create automation rule
    console.log('1️⃣ Creating automation rules...');
    await this.automation.createRule(
      'Welcome DM for new followers',
      'dm',
      {
        type: 'follow',
        conditions: {},
      },
      {
        type: 'send_dm',
        template: 'Thank you for following, {displayName}! 🎉',
        delay: 5,
      }
    );

    await this.automation.createRule(
      'Auto-reply to mentions',
      'auto_reply',
      {
        type: 'mention',
        conditions: {},
      },
      {
        type: 'send_reply',
        template: 'Thanks for mentioning us, @{username}! 💙',
        delay: 2,
      }
    );

    // Create campaign
    console.log('\n2️⃣ Creating campaign...');
    const campaign = await this.campaigns.createCampaign(
      'Summer Giveaway 2024',
      'instant_auto',
      'Win amazing prizes! Follow, RT, and use #SummerGiveaway',
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      [
        { id: 'prize1', name: 'Grand Prize: Vacation Package', quantity: 1, remaining: 1 },
        { id: 'prize2', name: 'Runner Up: Gift Card $100', quantity: 5, remaining: 5 },
        { id: 'prize3', name: 'Consolation: Stickers', quantity: 50, remaining: 50 },
      ],
      {
        requireFollow: true,
        requireRetweet: true,
        requireLike: false,
        requireHashtag: 'SummerGiveaway',
        winProbability: 15,
      }
    );

    await this.campaigns.startCampaign(campaign.id);

    // Schedule some posts
    console.log('\n3️⃣ Scheduling posts...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await this.scheduler.schedulePost(
      '🌅 Good morning! Start your day with positivity! #MondayMotivation',
      tomorrow
    );

    await this.scheduler.schedulePost(
      '🎉 Join our Summer Giveaway! RT and follow to enter! #SummerGiveaway',
      new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000) // 3 hours later
    );

    // Simulate some posts for analytics
    console.log('\n4️⃣ Simulating posts for analytics...');
    const mockPosts: XPost[] = [
      {
        id: 'post1',
        authorId: 'user1',
        text: 'Check out our new product! #ProductLaunch',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        likes: 150,
        retweets: 45,
        replies: 23,
        hashtags: ['ProductLaunch'],
      },
      {
        id: 'post2',
        authorId: 'user1',
        text: 'Thank you for 10k followers! 🎉 #Milestone',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 320,
        retweets: 89,
        replies: 67,
        hashtags: ['Milestone'],
      },
      {
        id: 'post3',
        authorId: 'user1',
        text: 'Tips for social media marketing 📱 #Marketing',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        likes: 78,
        retweets: 34,
        replies: 12,
        hashtags: ['Marketing'],
      },
    ];

    mockPosts.forEach((post) => this.analytics.trackPost(post));
    this.analytics.trackFollowers(10543);

    // Show status
    console.log('\n5️⃣ Application Status:');
    console.log(this.getDetailedReport());

    // Show analytics report
    console.log('6️⃣ Analytics Report:');
    const weeklyReport = this.analytics.getWeeklyReport();
    console.log(weeklyReport);

    console.log('\n✅ Demo completed!\n');
  }
}
