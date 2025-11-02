/**
 * Analytics Service
 * Collects and analyzes X (Twitter) performance metrics
 */

import type { Analytics, XPost, HashtagMetrics, XUser } from '../types/index.js';

export class AnalyticsService {
  private posts: XPost[] = [];
  private followers: Map<Date, number> = new Map();

  /**
   * Track a post
   */
  trackPost(post: XPost): void {
    this.posts.push(post);
  }

  /**
   * Track follower count
   */
  trackFollowers(count: number, date: Date = new Date()): void {
    this.followers.set(date, count);
  }

  /**
   * Get analytics for a period
   */
  getAnalytics(startDate: Date, endDate: Date): Analytics {
    const filteredPosts = this.posts.filter(
      (post) =>
        post.createdAt >= startDate && post.createdAt <= endDate
    );

    const totalLikes = filteredPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalRetweets = filteredPosts.reduce((sum, post) => sum + post.retweets, 0);
    const totalReplies = filteredPosts.reduce((sum, post) => sum + post.replies, 0);

    const totalEngagements = totalLikes + totalRetweets + totalReplies;
    const engagementRate =
      filteredPosts.length > 0
        ? (totalEngagements / filteredPosts.length)
        : 0;

    // Get follower metrics
    const followerData = this.getFollowerMetrics(startDate, endDate);

    // Get top posts
    const topPosts = this.getTopPosts(filteredPosts, 10);

    // Get hashtag performance
    const hashtagPerformance = this.getHashtagPerformance(filteredPosts);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      metrics: {
        totalPosts: filteredPosts.length,
        totalLikes,
        totalRetweets,
        totalReplies,
        totalFollowers: followerData.current,
        followerGrowth: followerData.growth,
        engagementRate,
      },
      topPosts,
      hashtagPerformance,
    };
  }

  /**
   * Get follower metrics
   */
  private getFollowerMetrics(
    startDate: Date,
    endDate: Date
  ): { current: number; growth: number } {
    const followers = Array.from(this.followers.entries())
      .filter(([date]) => date >= startDate && date <= endDate)
      .sort(([dateA], [dateB]) => dateA.getTime() - dateB.getTime());

    if (followers.length === 0) {
      return { current: 0, growth: 0 };
    }

    const current = followers[followers.length - 1][1];
    const initial = followers[0][1];
    const growth = current - initial;

    return { current, growth };
  }

  /**
   * Get top performing posts
   */
  private getTopPosts(posts: XPost[], limit: number): XPost[] {
    return posts
      .sort((a, b) => {
        const scoreA = a.likes + a.retweets * 2 + a.replies * 1.5;
        const scoreB = b.likes + b.retweets * 2 + b.replies * 1.5;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Get hashtag performance
   */
  private getHashtagPerformance(posts: XPost[]): HashtagMetrics[] {
    const hashtagMap = new Map<string, HashtagMetrics>();

    posts.forEach((post) => {
      post.hashtags.forEach((hashtag) => {
        const existing = hashtagMap.get(hashtag) || {
          hashtag,
          usage: 0,
          reach: 0,
          engagement: 0,
        };

        existing.usage++;
        existing.reach += post.likes + post.retweets; // Approximate reach
        existing.engagement += post.likes + post.retweets + post.replies;

        hashtagMap.set(hashtag, existing);
      });
    });

    return Array.from(hashtagMap.values())
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 20); // Top 20 hashtags
  }

  /**
   * Generate daily analytics report
   */
  getDailyReport(date: Date = new Date()): string {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const analytics = this.getAnalytics(startOfDay, endOfDay);

    let report = `# Daily Analytics Report\n`;
    report += `Date: ${date.toLocaleDateString()}\n\n`;

    report += `## Overview\n`;
    report += `- Posts: ${analytics.metrics.totalPosts}\n`;
    report += `- Total Likes: ${analytics.metrics.totalLikes}\n`;
    report += `- Total Retweets: ${analytics.metrics.totalRetweets}\n`;
    report += `- Total Replies: ${analytics.metrics.totalReplies}\n`;
    report += `- Engagement Rate: ${analytics.metrics.engagementRate.toFixed(2)}\n`;
    report += `- Followers: ${analytics.metrics.totalFollowers} (${analytics.metrics.followerGrowth >= 0 ? '+' : ''}${analytics.metrics.followerGrowth})\n\n`;

    if (analytics.topPosts.length > 0) {
      report += `## Top Posts\n`;
      analytics.topPosts.slice(0, 5).forEach((post, index) => {
        const engagement = post.likes + post.retweets + post.replies;
        report += `${index + 1}. ${post.text.substring(0, 50)}...\n`;
        report += `   ❤️ ${post.likes} | 🔁 ${post.retweets} | 💬 ${post.replies} | Total: ${engagement}\n`;
      });
      report += '\n';
    }

    if (analytics.hashtagPerformance.length > 0) {
      report += `## Top Hashtags\n`;
      analytics.hashtagPerformance.slice(0, 5).forEach((hashtag, index) => {
        report += `${index + 1}. #${hashtag.hashtag}\n`;
        report += `   Usage: ${hashtag.usage} | Engagement: ${hashtag.engagement}\n`;
      });
    }

    return report;
  }

  /**
   * Generate weekly analytics report
   */
  getWeeklyReport(endDate: Date = new Date()): string {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);

    const analytics = this.getAnalytics(startDate, endDate);

    let report = `# Weekly Analytics Report\n`;
    report += `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}\n\n`;

    report += `## Overview\n`;
    report += `- Posts: ${analytics.metrics.totalPosts}\n`;
    report += `- Average Posts per Day: ${(analytics.metrics.totalPosts / 7).toFixed(1)}\n`;
    report += `- Total Likes: ${analytics.metrics.totalLikes}\n`;
    report += `- Total Retweets: ${analytics.metrics.totalRetweets}\n`;
    report += `- Total Replies: ${analytics.metrics.totalReplies}\n`;
    report += `- Engagement Rate: ${analytics.metrics.engagementRate.toFixed(2)}\n`;
    report += `- Follower Growth: ${analytics.metrics.followerGrowth >= 0 ? '+' : ''}${analytics.metrics.followerGrowth}\n\n`;

    if (analytics.topPosts.length > 0) {
      report += `## Best Performing Posts\n`;
      analytics.topPosts.slice(0, 10).forEach((post, index) => {
        const engagement = post.likes + post.retweets + post.replies;
        report += `${index + 1}. ${post.text.substring(0, 60)}...\n`;
        report += `   ❤️ ${post.likes} | 🔁 ${post.retweets} | 💬 ${post.replies} | Total: ${engagement}\n`;
        report += `   Posted: ${post.createdAt.toLocaleString()}\n\n`;
      });
    }

    if (analytics.hashtagPerformance.length > 0) {
      report += `## Hashtag Performance\n`;
      analytics.hashtagPerformance.slice(0, 10).forEach((hashtag, index) => {
        report += `${index + 1}. #${hashtag.hashtag}\n`;
        report += `   Usage: ${hashtag.usage} | Reach: ${hashtag.reach} | Engagement: ${hashtag.engagement}\n`;
      });
    }

    return report;
  }

  /**
   * Get engagement rate for a specific post
   */
  getPostEngagementRate(postId: string): number | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    const totalEngagement = post.likes + post.retweets + post.replies;
    // In a real app, you'd divide by impressions/reach
    return totalEngagement;
  }

  /**
   * Get best posting times based on historical data
   */
  getBestPostingTimes(): {
    hourOfDay: number;
    dayOfWeek: number;
    averageEngagement: number;
  }[] {
    const timeSlots = new Map<string, { count: number; totalEngagement: number }>();

    this.posts.forEach((post) => {
      const hour = post.createdAt.getHours();
      const day = post.createdAt.getDay();
      const key = `${day}-${hour}`;

      const engagement = post.likes + post.retweets + post.replies;
      const existing = timeSlots.get(key) || { count: 0, totalEngagement: 0 };

      existing.count++;
      existing.totalEngagement += engagement;

      timeSlots.set(key, existing);
    });

    const results = Array.from(timeSlots.entries())
      .map(([key, data]) => {
        const [day, hour] = key.split('-').map(Number);
        return {
          hourOfDay: hour,
          dayOfWeek: day,
          averageEngagement: data.totalEngagement / data.count,
        };
      })
      .sort((a, b) => b.averageEngagement - a.averageEngagement)
      .slice(0, 10);

    return results;
  }

  /**
   * Get growth trend
   */
  getGrowthTrend(days: number = 30): {
    date: Date;
    followers: number;
    growth: number;
  }[] {
    const sortedFollowers = Array.from(this.followers.entries())
      .sort(([dateA], [dateB]) => dateA.getTime() - dateB.getTime());

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filtered = sortedFollowers.filter(
      ([date]) => date >= startDate && date <= endDate
    );

    return filtered.map(([date, followers], index) => {
      const prevFollowers = index > 0 ? filtered[index - 1][1] : followers;
      return {
        date,
        followers,
        growth: followers - prevFollowers,
      };
    });
  }

  /**
   * Export analytics to CSV format
   */
  exportToCSV(startDate: Date, endDate: Date): string {
    const posts = this.posts.filter(
      (post) =>
        post.createdAt >= startDate && post.createdAt <= endDate
    );

    let csv = 'Date,Post ID,Text,Likes,Retweets,Replies,Hashtags\n';

    posts.forEach((post) => {
      const text = post.text.replace(/"/g, '""').replace(/\n/g, ' ');
      const hashtags = post.hashtags.join(' ');
      csv += `${post.createdAt.toISOString()},${post.id},"${text}",${post.likes},${post.retweets},${post.replies},"${hashtags}"\n`;
    });

    return csv;
  }

  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.posts = [];
    this.followers.clear();
    console.log('✓ Analytics data cleared');
  }

  /**
   * Get total posts count
   */
  getTotalPosts(): number {
    return this.posts.length;
  }

  /**
   * Get current follower count
   */
  getCurrentFollowers(): number {
    if (this.followers.size === 0) return 0;

    const latest = Array.from(this.followers.entries())
      .sort(([dateA], [dateB]) => dateB.getTime() - dateA.getTime())[0];

    return latest[1];
  }
}
