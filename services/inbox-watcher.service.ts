import { GmailTool, FetchedEmail } from '../tools/gmail.tool';
import { workflowEngine } from '../workflows/opportunity.graph';

export class InboxWatcherService {
  private gmailTool = new GmailTool();
  private processedMessageIds = new Set<string>();
  private intervalId: NodeJS.Timeout | null = null;
  private isPolling = false;

  startWatching(intervalMs: number = 15000) {
    if (this.isPolling) {
      console.log('[InboxWatcher] Poller is already active.');
      return;
    }

    this.isPolling = true;
    console.log(`\n============================================================`);
    console.log(`📡 REAL-TIME GMAIL INBOX WATCHER ACTIVATED`);
    console.log(`User: ${process.env.GMAIL_USER || 'Configured Gmail'}`);
    console.log(`Polling interval: ${intervalMs / 1000}s for unread recruiter emails...`);
    console.log(`============================================================\n`);

    // Run initial check immediately
    this.checkInbox();

    // Schedule recurring check
    this.intervalId = setInterval(() => {
      this.checkInbox();
    }, intervalMs);
  }

  stopWatching() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isPolling = false;
    console.log('[InboxWatcher] Stopped inbox watching.');
  }

  async checkInbox() {
    try {
      // Fetch UNSEEN (unread) emails from Gmail inbox
      const unreadEmails = await this.gmailTool.fetchInboxEmails(5, true);

      if (!unreadEmails || unreadEmails.length === 0) {
        return;
      }

      for (const email of unreadEmails) {
        if (!this.processedMessageIds.has(email.messageId)) {
          this.processedMessageIds.add(email.messageId);
          console.log(`\n⚡ [InboxWatcher] NEW UNREAD EMAIL DETECTED!`);
          console.log(`Subject: "${email.subject}" from "${email.from}"`);
          console.log(`Launching Multi-Agent Pipeline...\n`);

          // Process email autonomously through the 8-agent graph
          await workflowEngine.processEmail(email);
        }
      }
    } catch (err: any) {
      console.error('[InboxWatcher] Error checking inbox:', err.message);
    }
  }

  getStatus() {
    return {
      active: this.isPolling,
      processedCount: this.processedMessageIds.size,
      user: process.env.GMAIL_USER
    };
  }
}

export const inboxWatcher = new InboxWatcherService();
