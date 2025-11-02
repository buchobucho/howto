/**
 * Scheduler Service
 * Manages scheduled posts and recurring tasks
 */

import type { ScheduledPost } from '../types/index.js';

export class SchedulerService {
  private scheduledPosts: Map<string, ScheduledPost> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.checkScheduledPosts();
    console.log('✓ Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();

    this.isRunning = false;
    console.log('✓ Scheduler stopped');
  }

  /**
   * Schedule a post
   */
  async schedulePost(
    text: string,
    scheduledAt: Date,
    mediaUrls?: string[]
  ): Promise<ScheduledPost> {
    const post: ScheduledPost = {
      id: this.generateId(),
      text,
      scheduledAt,
      status: 'pending',
      mediaUrls,
      createdAt: new Date(),
    };

    this.scheduledPosts.set(post.id, post);

    // Set up timer if scheduled for the future
    if (this.isRunning && scheduledAt > new Date()) {
      this.setupTimer(post);
    }

    console.log(
      `✓ Scheduled post: ${post.id} at ${scheduledAt.toLocaleString()}`
    );
    return post;
  }

  /**
   * Get all scheduled posts
   */
  getScheduledPosts(status?: 'pending' | 'posted' | 'failed'): ScheduledPost[] {
    const posts = Array.from(this.scheduledPosts.values());

    if (status) {
      return posts.filter((post) => post.status === status);
    }

    return posts.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  /**
   * Get scheduled post by ID
   */
  getScheduledPost(id: string): ScheduledPost | undefined {
    return this.scheduledPosts.get(id);
  }

  /**
   * Update scheduled post
   */
  async updateScheduledPost(
    id: string,
    updates: Partial<ScheduledPost>
  ): Promise<ScheduledPost | null> {
    const post = this.scheduledPosts.get(id);
    if (!post) {
      console.error(`Scheduled post not found: ${id}`);
      return null;
    }

    if (post.status !== 'pending') {
      console.error(`Cannot update post that is not pending: ${id}`);
      return null;
    }

    // Cancel existing timer
    const existingTimer = this.timers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(id);
    }

    // Update post
    const updatedPost = {
      ...post,
      ...updates,
    };

    this.scheduledPosts.set(id, updatedPost);

    // Set up new timer if date was changed
    if (updates.scheduledAt && this.isRunning && updatedPost.scheduledAt > new Date()) {
      this.setupTimer(updatedPost);
    }

    console.log(`✓ Updated scheduled post: ${id}`);
    return updatedPost;
  }

  /**
   * Delete scheduled post
   */
  async deleteScheduledPost(id: string): Promise<boolean> {
    const post = this.scheduledPosts.get(id);
    if (!post) {
      console.error(`Scheduled post not found: ${id}`);
      return false;
    }

    if (post.status !== 'pending') {
      console.error(`Cannot delete post that is not pending: ${id}`);
      return false;
    }

    // Cancel timer
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.scheduledPosts.delete(id);
    console.log(`✓ Deleted scheduled post: ${id}`);
    return true;
  }

  /**
   * Setup timer for a scheduled post
   */
  private setupTimer(post: ScheduledPost): void {
    const now = new Date().getTime();
    const scheduledTime = post.scheduledAt.getTime();
    const delay = scheduledTime - now;

    if (delay <= 0) {
      // Post is already past due, execute immediately
      this.executePost(post.id);
      return;
    }

    // Set up timer
    const timer = setTimeout(() => {
      this.executePost(post.id);
    }, delay);

    this.timers.set(post.id, timer);
  }

  /**
   * Execute a scheduled post
   */
  private async executePost(postId: string): Promise<void> {
    const post = this.scheduledPosts.get(postId);
    if (!post) return;

    try {
      console.log(`📤 Executing scheduled post: ${postId}`);
      console.log(`   Text: ${post.text}`);
      if (post.mediaUrls && post.mediaUrls.length > 0) {
        console.log(`   Media: ${post.mediaUrls.join(', ')}`);
      }

      // Simulate posting to X API
      await this.publishPost(post);

      // Update status
      post.status = 'posted';
      this.scheduledPosts.set(postId, post);

      console.log(`✓ Successfully posted: ${postId}`);
    } catch (error) {
      console.error(`❌ Failed to post: ${postId}`, error);
      post.status = 'failed';
      this.scheduledPosts.set(postId, post);
    } finally {
      // Clean up timer
      this.timers.delete(postId);
    }
  }

  /**
   * Publish post to X (mock implementation)
   */
  private async publishPost(post: ScheduledPost): Promise<void> {
    // In real implementation, call X API
    console.log(`🐦 [X API] Publishing post...`);
    console.log(`   ${post.text}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /**
   * Check for pending posts that should be executed
   */
  private checkScheduledPosts(): void {
    if (!this.isRunning) return;

    const now = new Date();
    const pendingPosts = this.getScheduledPosts('pending');

    pendingPosts.forEach((post) => {
      if (post.scheduledAt <= now && !this.timers.has(post.id)) {
        this.executePost(post.id);
      } else if (post.scheduledAt > now && !this.timers.has(post.id)) {
        this.setupTimer(post);
      }
    });

    // Check again in 1 minute
    setTimeout(() => this.checkScheduledPosts(), 60000);
  }

  /**
   * Get upcoming posts (next N posts)
   */
  getUpcomingPosts(limit: number = 10): ScheduledPost[] {
    const now = new Date();
    return this.getScheduledPosts('pending')
      .filter((post) => post.scheduledAt > now)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get past posts
   */
  getPastPosts(limit?: number): ScheduledPost[] {
    const now = new Date();
    let posts = Array.from(this.scheduledPosts.values())
      .filter((post) => post.status === 'posted' || post.status === 'failed')
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

    if (limit) {
      posts = posts.slice(0, limit);
    }

    return posts;
  }

  /**
   * Get scheduler statistics
   */
  getStatistics(): {
    totalScheduled: number;
    pending: number;
    posted: number;
    failed: number;
    upcomingToday: number;
  } {
    const all = Array.from(this.scheduledPosts.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      totalScheduled: all.length,
      pending: all.filter((p) => p.status === 'pending').length,
      posted: all.filter((p) => p.status === 'posted').length,
      failed: all.filter((p) => p.status === 'failed').length,
      upcomingToday: all.filter(
        (p) =>
          p.status === 'pending' &&
          p.scheduledAt >= today &&
          p.scheduledAt < tomorrow
      ).length,
    };
  }

  /**
   * Schedule recurring posts
   */
  async scheduleRecurring(
    text: string,
    startDate: Date,
    interval: 'daily' | 'weekly' | 'monthly',
    count: number,
    mediaUrls?: string[]
  ): Promise<ScheduledPost[]> {
    const posts: ScheduledPost[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      const post = await this.schedulePost(text, new Date(currentDate), mediaUrls);
      posts.push(post);

      // Calculate next date
      switch (interval) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    console.log(
      `✓ Scheduled ${posts.length} recurring posts (${interval})`
    );
    return posts;
  }

  /**
   * Retry failed post
   */
  async retryPost(postId: string): Promise<boolean> {
    const post = this.scheduledPosts.get(postId);
    if (!post) {
      console.error(`Post not found: ${postId}`);
      return false;
    }

    if (post.status !== 'failed') {
      console.error(`Post is not in failed status: ${postId}`);
      return false;
    }

    // Reset status and reschedule
    post.status = 'pending';
    post.scheduledAt = new Date();
    this.scheduledPosts.set(postId, post);

    if (this.isRunning) {
      await this.executePost(postId);
    }

    return true;
  }

  /**
   * Utility: Generate unique ID
   */
  private generateId(): string {
    return `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
