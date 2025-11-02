/**
 * XTEP Application Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { XTEPApp } from '../src/XTEPApp.js';
import type { XUser, XPost } from '../src/types/index.js';

describe('XTEPApp', () => {
  let app: XTEPApp;

  beforeEach(() => {
    app = new XTEPApp({
      defaultDelay: 1,
      maxRetries: 3,
    });
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const config = app.getConfig();
      expect(config.defaultDelay).toBe(1);
      expect(config.maxRetries).toBe(3);
    });

    it('should provide access to all services', () => {
      expect(app.getAutomation()).toBeDefined();
      expect(app.getCampaigns()).toBeDefined();
      expect(app.getScheduler()).toBeDefined();
      expect(app.getAnalytics()).toBeDefined();
    });
  });

  describe('Automation Service', () => {
    it('should create automation rule', async () => {
      const automation = app.getAutomation();

      const rule = await automation.createRule(
        'Test Rule',
        'dm',
        {
          type: 'follow',
          conditions: {},
        },
        {
          type: 'send_dm',
          template: 'Welcome, {displayName}!',
        }
      );

      expect(rule).toBeDefined();
      expect(rule.name).toBe('Test Rule');
      expect(rule.enabled).toBe(true);
    });

    it('should process posts with automation rules', async () => {
      const automation = app.getAutomation();

      await automation.createRule(
        'Keyword Rule',
        'auto_reply',
        {
          type: 'keyword',
          conditions: { keywords: ['help', 'support'] },
        },
        {
          type: 'send_reply',
          template: 'How can we help you, @{username}?',
        }
      );

      const mockUser: XUser = {
        id: 'user1',
        username: 'testuser',
        displayName: 'Test User',
        followers: 100,
        following: 50,
      };

      const mockPost: XPost = {
        id: 'post1',
        authorId: 'user1',
        text: 'I need help with my account',
        createdAt: new Date(),
        likes: 0,
        retweets: 0,
        replies: 0,
        hashtags: [],
      };

      await app.processIncomingPost(mockPost, mockUser);

      const rules = automation.getRules();
      expect(rules.length).toBe(1);
    });
  });

  describe('Campaign Service', () => {
    it('should create campaign', async () => {
      const campaigns = app.getCampaigns();

      const campaign = await campaigns.createCampaign(
        'Test Campaign',
        'instant_auto',
        'Win prizes!',
        new Date(),
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        [
          { id: 'prize1', name: 'Grand Prize', quantity: 1, remaining: 1 },
        ],
        {
          requireFollow: true,
          requireRetweet: true,
          requireLike: false,
          winProbability: 10,
        }
      );

      expect(campaign).toBeDefined();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe('draft');
      expect(campaign.prizes.length).toBe(1);
    });

    it('should start and end campaigns', async () => {
      const campaigns = app.getCampaigns();

      const campaign = await campaigns.createCampaign(
        'Test Campaign',
        'later_lottery',
        'Test',
        new Date(),
        new Date(Date.now() + 1000),
        [],
        { requireFollow: false, requireRetweet: false, requireLike: false }
      );

      const started = await campaigns.startCampaign(campaign.id);
      expect(started?.status).toBe('active');

      const ended = await campaigns.endCampaign(campaign.id);
      expect(ended?.status).toBe('ended');
    });

    it('should allow users to enter campaign', async () => {
      const campaigns = app.getCampaigns();

      const campaign = await campaigns.createCampaign(
        'Test Campaign',
        'instant_auto',
        'Test',
        new Date(),
        new Date(Date.now() + 10000),
        [{ id: 'prize1', name: 'Prize', quantity: 10, remaining: 10 }],
        {
          requireFollow: false,
          requireRetweet: false,
          requireLike: false,
          winProbability: 50,
        }
      );

      await campaigns.startCampaign(campaign.id);

      const mockUser: XUser = {
        id: 'user1',
        username: 'testuser',
        displayName: 'Test User',
        followers: 100,
        following: 50,
      };

      const result = await campaigns.enterCampaign(campaign.id, mockUser);
      expect(result).toBe(true);

      const updatedCampaign = campaigns.getCampaign(campaign.id);
      expect(updatedCampaign?.participants.length).toBe(1);
    });
  });

  describe('Scheduler Service', () => {
    it('should schedule posts', async () => {
      const scheduler = app.getScheduler();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const post = await scheduler.schedulePost(
        'Test scheduled post',
        tomorrow
      );

      expect(post).toBeDefined();
      expect(post.status).toBe('pending');
      expect(post.text).toBe('Test scheduled post');
    });

    it('should get upcoming posts', async () => {
      const scheduler = app.getScheduler();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await scheduler.schedulePost('Post 1', tomorrow);
      await scheduler.schedulePost('Post 2', new Date(tomorrow.getTime() + 3600000));

      const upcoming = scheduler.getUpcomingPosts(10);
      expect(upcoming.length).toBe(2);
    });

    it('should get scheduler statistics', async () => {
      const scheduler = app.getScheduler();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await scheduler.schedulePost('Post 1', tomorrow);
      await scheduler.schedulePost('Post 2', tomorrow);

      const stats = scheduler.getStatistics();
      expect(stats.totalScheduled).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.posted).toBe(0);
    });
  });

  describe('Analytics Service', () => {
    it('should track posts', () => {
      const analytics = app.getAnalytics();

      const mockPost: XPost = {
        id: 'post1',
        authorId: 'user1',
        text: 'Test post #testing',
        createdAt: new Date(),
        likes: 50,
        retweets: 20,
        replies: 10,
        hashtags: ['testing'],
      };

      analytics.trackPost(mockPost);

      expect(analytics.getTotalPosts()).toBe(1);
    });

    it('should track followers', () => {
      const analytics = app.getAnalytics();

      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      analytics.trackFollowers(1000, date1);
      expect(analytics.getCurrentFollowers()).toBe(1000);

      analytics.trackFollowers(1050, date2);
      expect(analytics.getCurrentFollowers()).toBe(1050);
    });

    it('should generate analytics report', () => {
      const analytics = app.getAnalytics();

      const mockPost: XPost = {
        id: 'post1',
        authorId: 'user1',
        text: 'Test post',
        createdAt: new Date(),
        likes: 100,
        retweets: 50,
        replies: 25,
        hashtags: ['test'],
      };

      analytics.trackPost(mockPost);
      analytics.trackFollowers(5000);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const report = analytics.getAnalytics(startDate, endDate);

      expect(report).toBeDefined();
      expect(report.metrics.totalPosts).toBe(1);
      expect(report.metrics.totalLikes).toBe(100);
      expect(report.metrics.totalFollowers).toBe(5000);
    });
  });

  describe('Application Status', () => {
    it('should return application status', async () => {
      const automation = app.getAutomation();
      await automation.createRule(
        'Test Rule',
        'dm',
        { type: 'follow', conditions: {} },
        { type: 'send_dm', template: 'Welcome!' }
      );

      const status = app.getStatus();

      expect(status).toBeDefined();
      expect(status.automation.totalRules).toBe(1);
      expect(status.campaigns.total).toBe(0);
      expect(status.scheduler.totalScheduled).toBe(0);
    });

    it('should generate detailed report', () => {
      const report = app.getDetailedReport();

      expect(report).toBeDefined();
      expect(report).toContain('XTEP Application Status');
      expect(report).toContain('Automation');
      expect(report).toContain('Campaigns');
      expect(report).toContain('Scheduler');
      expect(report).toContain('Analytics');
    });
  });
});
