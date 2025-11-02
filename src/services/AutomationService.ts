/**
 * Automation Service
 * Handles automated DM/Reply sending based on triggers
 */

import type {
  AutomationRule,
  AutomationTrigger,
  AutomationAction,
  XPost,
  XUser,
} from '../types/index.js';

export class AutomationService {
  private rules: Map<string, AutomationRule> = new Map();
  private executionHistory: Map<string, Date[]> = new Map();

  /**
   * Create a new automation rule
   */
  async createRule(
    name: string,
    type: 'dm' | 'reply' | 'auto_reply',
    trigger: AutomationTrigger,
    action: AutomationAction
  ): Promise<AutomationRule> {
    const rule: AutomationRule = {
      id: this.generateId(),
      name,
      type,
      trigger,
      action,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(rule.id, rule);
    console.log(`✓ Created automation rule: ${name} (${rule.id})`);
    return rule;
  }

  /**
   * Get all automation rules
   */
  getRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(id: string): AutomationRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Update automation rule
   */
  async updateRule(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    const rule = this.rules.get(id);
    if (!rule) {
      console.error(`Rule not found: ${id}`);
      return null;
    }

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };

    this.rules.set(id, updatedRule);
    console.log(`✓ Updated automation rule: ${id}`);
    return updatedRule;
  }

  /**
   * Delete automation rule
   */
  async deleteRule(id: string): Promise<boolean> {
    const deleted = this.rules.delete(id);
    if (deleted) {
      this.executionHistory.delete(id);
      console.log(`✓ Deleted automation rule: ${id}`);
    }
    return deleted;
  }

  /**
   * Enable/disable rule
   */
  async toggleRule(id: string, enabled: boolean): Promise<boolean> {
    const rule = this.rules.get(id);
    if (!rule) return false;

    rule.enabled = enabled;
    rule.updatedAt = new Date();
    this.rules.set(id, rule);
    console.log(`✓ ${enabled ? 'Enabled' : 'Disabled'} automation rule: ${id}`);
    return true;
  }

  /**
   * Process a post and execute matching automation rules
   */
  async processPost(post: XPost, user: XUser): Promise<void> {
    const enabledRules = Array.from(this.rules.values()).filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      if (this.shouldTrigger(rule, post, user)) {
        await this.executeAction(rule, post, user);
      }
    }
  }

  /**
   * Check if automation rule should be triggered
   */
  private shouldTrigger(rule: AutomationRule, post: XPost, user: XUser): boolean {
    const { trigger } = rule;
    const { conditions } = trigger;

    // Check minimum followers requirement
    if (conditions.minFollowers && user.followers < conditions.minFollowers) {
      return false;
    }

    // Check trigger type
    switch (trigger.type) {
      case 'keyword':
        if (conditions.keywords && conditions.keywords.length > 0) {
          return conditions.keywords.some((keyword) =>
            post.text.toLowerCase().includes(keyword.toLowerCase())
          );
        }
        break;

      case 'hashtag':
        if (conditions.hashtags && conditions.hashtags.length > 0) {
          return conditions.hashtags.some((hashtag) =>
            post.hashtags.some((postHashtag) =>
              postHashtag.toLowerCase() === hashtag.toLowerCase()
            )
          );
        }
        break;

      case 'mention':
        // Simplified: check if post contains @ mention
        return post.text.includes('@');

      case 'like':
      case 'retweet':
      case 'follow':
        // These would be handled by webhook events in real implementation
        return true;
    }

    return false;
  }

  /**
   * Execute automation action
   */
  private async executeAction(
    rule: AutomationRule,
    post: XPost,
    user: XUser
  ): Promise<void> {
    const { action } = rule;

    // Apply delay if specified
    if (action.delay && action.delay > 0) {
      await this.delay(action.delay * 1000);
    }

    // Replace template variables
    const message = this.replaceTemplateVariables(action.template, post, user);

    // Execute action based on type
    switch (action.type) {
      case 'send_dm':
        await this.sendDM(user, message);
        break;

      case 'send_reply':
        await this.sendReply(post, message);
        break;

      case 'send_secret_reply':
        await this.sendSecretReply(post, user, message);
        break;
    }

    // Record execution
    this.recordExecution(rule.id);
    console.log(`✓ Executed automation: ${rule.name} for user @${user.username}`);
  }

  /**
   * Replace template variables in message
   */
  private replaceTemplateVariables(template: string, post: XPost, user: XUser): string {
    return template
      .replace(/{username}/g, user.username)
      .replace(/{displayName}/g, user.displayName)
      .replace(/{postText}/g, post.text)
      .replace(/{postId}/g, post.id);
  }

  /**
   * Send DM (mock implementation)
   */
  private async sendDM(user: XUser, message: string): Promise<void> {
    console.log(`📩 [DM] To: @${user.username}`);
    console.log(`   Message: ${message}`);
    // In real implementation, call X API
  }

  /**
   * Send reply (mock implementation)
   */
  private async sendReply(post: XPost, message: string): Promise<void> {
    console.log(`💬 [Reply] To post: ${post.id}`);
    console.log(`   Message: ${message}`);
    // In real implementation, call X API
  }

  /**
   * Send secret reply (mock implementation)
   * Secret replies are only visible to the recipient
   */
  private async sendSecretReply(post: XPost, user: XUser, message: string): Promise<void> {
    console.log(`🔒 [Secret Reply] To: @${user.username} (Post: ${post.id})`);
    console.log(`   Message: ${message}`);
    // In real implementation, use X API's hidden reply feature
  }

  /**
   * Record rule execution
   */
  private recordExecution(ruleId: string): void {
    const history = this.executionHistory.get(ruleId) || [];
    history.push(new Date());
    this.executionHistory.set(ruleId, history);
  }

  /**
   * Get execution history for a rule
   */
  getExecutionHistory(ruleId: string): Date[] {
    return this.executionHistory.get(ruleId) || [];
  }

  /**
   * Get execution statistics
   */
  getStatistics(ruleId: string): {
    totalExecutions: number;
    lastExecution: Date | null;
    averagePerDay: number;
  } {
    const history = this.executionHistory.get(ruleId) || [];
    const totalExecutions = history.length;
    const lastExecution = history.length > 0 ? history[history.length - 1] : null;

    let averagePerDay = 0;
    if (history.length > 1) {
      const firstExecution = history[0];
      const daysDiff =
        (lastExecution!.getTime() - firstExecution.getTime()) / (1000 * 60 * 60 * 24);
      averagePerDay = daysDiff > 0 ? totalExecutions / daysDiff : totalExecutions;
    }

    return {
      totalExecutions,
      lastExecution,
      averagePerDay,
    };
  }

  /**
   * Utility: Generate unique ID
   */
  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
