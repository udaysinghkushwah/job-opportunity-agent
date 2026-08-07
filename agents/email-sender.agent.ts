import { BaseAgent } from './base.agent';
import { OpportunityState } from '../workflows/state.interface';
import { GmailTool } from '../tools/gmail.tool';

export class EmailSenderAgent extends BaseAgent {
  public readonly name = 'EmailSenderAgent';
  private gmailTool: GmailTool;

  constructor() {
    super();
    this.gmailTool = new GmailTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    if (state.decision?.action !== 'AUTO_REPLY' || !state.replyContent) {
      this.log(state, 'Skipping email dispatch (No auto-reply payload generated)');
      return state;
    }

    const toEmail = state.rawEmail.from;
    const attachmentPath = state.selectedResume?.filePath;

    this.log(state, `Dispatching email via Gmail API to ${toEmail}...`);

    const result = await this.gmailTool.sendReply({
      to: toEmail,
      subject: state.replyContent.subject,
      body: state.replyContent.body,
      threadId: state.rawEmail.threadId,
      attachmentPath
    });

    state.emailSent = result;
    state.currentStep = 'EMAIL_SENT';
    state.status = 'AUTO_REPLIED';

    this.log(state, `Email sent successfully! MessageId=${result.messageId}`, { result });

    return state;
  }
}
