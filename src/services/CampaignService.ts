/**
 * Campaign Service
 * Manages lottery campaigns (later lottery, instant lottery)
 */

import type {
  Campaign,
  CampaignType,
  CampaignRules,
  Prize,
  Participant,
  XUser,
} from '../types/index.js';

export class CampaignService {
  private campaigns: Map<string, Campaign> = new Map();

  /**
   * Create a new campaign
   */
  async createCampaign(
    name: string,
    type: CampaignType,
    description: string,
    startDate: Date,
    endDate: Date,
    prizes: Prize[],
    rules: CampaignRules
  ): Promise<Campaign> {
    const campaign: Campaign = {
      id: this.generateId(),
      name,
      type,
      description,
      startDate,
      endDate,
      prizes: prizes.map((p) => ({ ...p, remaining: p.quantity })),
      participants: [],
      status: 'draft',
      rules,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.campaigns.set(campaign.id, campaign);
    console.log(`✓ Created campaign: ${name} (${campaign.id})`);
    return campaign;
  }

  /**
   * Get all campaigns
   */
  getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Get campaign by ID
   */
  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  /**
   * Get active campaigns
   */
  getActiveCampaigns(): Campaign[] {
    const now = new Date();
    return Array.from(this.campaigns.values()).filter(
      (campaign) =>
        campaign.status === 'active' &&
        campaign.startDate <= now &&
        campaign.endDate >= now
    );
  }

  /**
   * Start a campaign
   */
  async startCampaign(id: string): Promise<Campaign | null> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      console.error(`Campaign not found: ${id}`);
      return null;
    }

    campaign.status = 'active';
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    console.log(`✓ Started campaign: ${campaign.name}`);
    return campaign;
  }

  /**
   * End a campaign
   */
  async endCampaign(id: string): Promise<Campaign | null> {
    const campaign = this.campaigns.get(id);
    if (!campaign) {
      console.error(`Campaign not found: ${id}`);
      return null;
    }

    campaign.status = 'ended';
    campaign.updatedAt = new Date();
    this.campaigns.set(id, campaign);
    console.log(`✓ Ended campaign: ${campaign.name}`);
    return campaign;
  }

  /**
   * Enter a user into a campaign
   */
  async enterCampaign(campaignId: string, user: XUser): Promise<boolean> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      console.error(`Campaign not found: ${campaignId}`);
      return false;
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      console.log(`Campaign is not active: ${campaignId}`);
      return false;
    }

    // Check if user already entered
    const alreadyEntered = campaign.participants.some((p) => p.userId === user.id);
    if (alreadyEntered) {
      console.log(`User already entered: @${user.username}`);
      return false;
    }

    // Create participant entry
    const participant: Participant = {
      userId: user.id,
      username: user.username,
      enteredAt: new Date(),
      won: false,
    };

    // Handle instant lottery
    if (campaign.type === 'instant_web' || campaign.type === 'instant_auto') {
      const result = await this.runInstantLottery(campaign, participant);
      if (result.won && result.prizeId) {
        participant.won = true;
        participant.prizeId = result.prizeId;
        await this.notifyWinner(campaign, participant, result.prizeId);
      } else {
        await this.notifyLoser(campaign, participant);
      }
    }

    campaign.participants.push(participant);
    this.campaigns.set(campaignId, campaign);

    console.log(
      `✓ User entered campaign: @${user.username} → ${campaign.name}${
        participant.won ? ' 🎉 WON!' : ''
      }`
    );
    return true;
  }

  /**
   * Run instant lottery for a participant
   */
  private async runInstantLottery(
    campaign: Campaign,
    participant: Participant
  ): Promise<{ won: boolean; prizeId?: string }> {
    // Check if there are remaining prizes
    const availablePrizes = campaign.prizes.filter((p) => p.remaining > 0);
    if (availablePrizes.length === 0) {
      return { won: false };
    }

    // Determine if user wins based on probability
    const winProbability = campaign.rules.winProbability || 10; // Default 10%
    const random = Math.random() * 100;

    if (random < winProbability) {
      // User wins - select a random prize
      const prize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
      prize.remaining--;

      return {
        won: true,
        prizeId: prize.id,
      };
    }

    return { won: false };
  }

  /**
   * Run later lottery (draw winners at the end)
   */
  async runLaterLottery(campaignId: string): Promise<Participant[]> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      console.error(`Campaign not found: ${campaignId}`);
      return [];
    }

    if (campaign.type !== 'later_lottery') {
      console.error(`Campaign is not a later lottery: ${campaignId}`);
      return [];
    }

    const winners: Participant[] = [];
    const eligibleParticipants = campaign.participants.filter((p) => !p.won);

    // Draw winners for each prize
    for (const prize of campaign.prizes) {
      for (let i = 0; i < prize.quantity; i++) {
        if (eligibleParticipants.length === 0) break;

        // Select random winner
        const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
        const winner = eligibleParticipants.splice(randomIndex, 1)[0];

        winner.won = true;
        winner.prizeId = prize.id;
        winners.push(winner);

        await this.notifyWinner(campaign, winner, prize.id);
      }
    }

    this.campaigns.set(campaignId, campaign);
    console.log(`✓ Lottery completed: ${winners.length} winners selected`);
    return winners;
  }

  /**
   * Notify winner (mock implementation)
   */
  private async notifyWinner(
    campaign: Campaign,
    participant: Participant,
    prizeId: string
  ): Promise<void> {
    const prize = campaign.prizes.find((p) => p.id === prizeId);
    if (!prize) return;

    console.log(`🎉 [Winner] @${participant.username}`);
    console.log(`   Campaign: ${campaign.name}`);
    console.log(`   Prize: ${prize.name}`);

    if (campaign.type === 'instant_auto') {
      // Send auto-reply
      console.log(`   ↳ Sending auto-reply DM...`);
    } else if (campaign.type === 'instant_web') {
      // Show web page
      console.log(`   ↳ Showing winner page at: ${this.getWinnerPageUrl(campaign.id)}`);
    }
  }

  /**
   * Notify loser (mock implementation)
   */
  private async notifyLoser(campaign: Campaign, participant: Participant): Promise<void> {
    console.log(`😢 [Loser] @${participant.username}`);
    console.log(`   Campaign: ${campaign.name}`);

    if (campaign.type === 'instant_auto') {
      console.log(`   ↳ Sending consolation auto-reply...`);
    } else if (campaign.type === 'instant_web') {
      console.log(`   ↳ Showing try-again page at: ${this.getLoserPageUrl(campaign.id)}`);
    }
  }

  /**
   * Get campaign statistics
   */
  getCampaignStats(id: string): {
    totalParticipants: number;
    totalWinners: number;
    winRate: number;
    prizesRemaining: number;
    prizesDistributed: number;
  } | null {
    const campaign = this.campaigns.get(id);
    if (!campaign) return null;

    const totalParticipants = campaign.participants.length;
    const totalWinners = campaign.participants.filter((p) => p.won).length;
    const winRate = totalParticipants > 0 ? (totalWinners / totalParticipants) * 100 : 0;

    const totalPrizes = campaign.prizes.reduce((sum, p) => sum + p.quantity, 0);
    const prizesRemaining = campaign.prizes.reduce((sum, p) => sum + p.remaining, 0);
    const prizesDistributed = totalPrizes - prizesRemaining;

    return {
      totalParticipants,
      totalWinners,
      winRate,
      prizesRemaining,
      prizesDistributed,
    };
  }

  /**
   * Get winners for a campaign
   */
  getWinners(campaignId: string): Participant[] {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return [];

    return campaign.participants.filter((p) => p.won);
  }

  /**
   * Export campaign results
   */
  exportResults(campaignId: string): string {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return '';

    const stats = this.getCampaignStats(campaignId);
    const winners = this.getWinners(campaignId);

    let report = `# Campaign Results: ${campaign.name}\n\n`;
    report += `## Overview\n`;
    report += `- Type: ${campaign.type}\n`;
    report += `- Period: ${campaign.startDate.toLocaleDateString()} - ${campaign.endDate.toLocaleDateString()}\n`;
    report += `- Status: ${campaign.status}\n\n`;

    if (stats) {
      report += `## Statistics\n`;
      report += `- Total Participants: ${stats.totalParticipants}\n`;
      report += `- Total Winners: ${stats.totalWinners}\n`;
      report += `- Win Rate: ${stats.winRate.toFixed(2)}%\n`;
      report += `- Prizes Distributed: ${stats.prizesDistributed}/${stats.prizesDistributed + stats.prizesRemaining}\n\n`;
    }

    report += `## Winners\n`;
    winners.forEach((winner, index) => {
      const prize = campaign.prizes.find((p) => p.id === winner.prizeId);
      report += `${index + 1}. @${winner.username} - ${prize?.name || 'Unknown Prize'}\n`;
    });

    return report;
  }

  /**
   * Utility: Generate unique ID
   */
  private generateId(): string {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utility: Get winner page URL
   */
  private getWinnerPageUrl(campaignId: string): string {
    return `https://example.com/campaign/${campaignId}/winner`;
  }

  /**
   * Utility: Get loser page URL
   */
  private getLoserPageUrl(campaignId: string): string {
    return `https://example.com/campaign/${campaignId}/try-again`;
  }
}
