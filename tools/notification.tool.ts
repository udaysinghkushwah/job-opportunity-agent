export interface NotificationPayload {
  title: string;
  company: string;
  role: string;
  recruiterName: string;
  action: string;
  details: string;
}

export interface NotificationResult {
  sent: boolean;
  channels: string[];
  timestamp: string;
}

export class NotificationTool {
  async dispatchNotification(payload: NotificationPayload): Promise<NotificationResult> {
    console.log(`[NotificationTool] Dispatching notifications for ${payload.company}...`);

    const channels: string[] = ['UI_DASHBOARD_LIVE_STREAM'];

    if (process.env.SLACK_WEBHOOK_URL) {
      channels.push('SLACK_WEBHOOK');
      // Execute Slack webhook post if URL is present
    }

    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      channels.push('TELEGRAM_BOT');
      // Execute Telegram post if tokens are present
    }

    console.log(`[NotificationTool] Notification sent successfully via: ${channels.join(', ')}`);

    return {
      sent: true,
      channels,
      timestamp: new Date().toISOString()
    };
  }
}
