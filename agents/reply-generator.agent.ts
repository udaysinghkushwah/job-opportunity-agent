import { BaseAgent } from './base.agent';
import { OpportunityState, GeneratedReply } from '../workflows/state.interface';
import { LLMTool } from '../tools/llm.tool';
import { REPLY_PROMPT_TEMPLATE } from '../prompts/reply.prompt';

export class ReplyGeneratorAgent extends BaseAgent {
  public readonly name = 'ReplyGeneratorAgent';
  private llmTool: LLMTool;

  constructor() {
    super();
    this.llmTool = new LLMTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    if (state.decision?.action !== 'AUTO_REPLY') {
      this.log(state, 'Skipping reply generation (Decision action is not AUTO_REPLY)');
      return state;
    }

    const recruiterName = state.analysis?.recruiterName || 'Hiring Manager';
    const company = state.analysis?.company || 'your team';
    const role = state.analysis?.role || 'the position';
    const rawSubject = state.rawEmail.subject.trim();
    const subject = rawSubject.toLowerCase().startsWith('re:') ? rawSubject : `Re: ${rawSubject}`;
    const emailBodyText = state.rawEmail.body || '';

    this.log(state, `Analyzing email body and generating context-aware reply for "${recruiterName}" at "${company}" for role "${role}"...`);

    const prompt = REPLY_PROMPT_TEMPLATE
      .replace(/{{recruiterName}}/g, recruiterName)
      .replace(/{{company}}/g, company)
      .replace(/{{role}}/g, role)
      .replace(/{{subject}}/g, rawSubject)
      .replace(/{{incomingEmailBody}}/g, emailBodyText);

    // Dynamic smart fallback reply based on incoming email content
    const fallback: GeneratedReply = this.deriveSmartFallbackReply(state, recruiterName, company, role, subject);

    const reply = await this.llmTool.generateJson<GeneratedReply>(
      { userPrompt: prompt },
      fallback
    );

    state.replyContent = reply;
    state.currentStep = 'REPLY_GENERATED';

    this.log(state, 'Context-aware reply generated successfully.', { reply });

    return state;
  }

  private deriveSmartFallbackReply(
    state: OpportunityState,
    recruiterName: string,
    company: string,
    role: string,
    subject: string
  ): GeneratedReply {
    const text = state.rawEmail.body.toLowerCase();
    let body = `Hi ${recruiterName},\n\n`;

    // Acknowledge role and company
    body += `Thank you for reaching out regarding the ${role} position at ${company}.\n\n`;

    // Address interview timing or questions if present in email
    if (text.includes('tomorrow') || text.includes('schedule') || text.includes('availability') || text.includes('call') || text.includes('time')) {
      if (text.includes('3:00') || text.includes('3pm') || text.includes('3 pm')) {
        body += `I am excited about this opportunity and tomorrow at 3:00 PM works great for me for an interview call. `;
      } else {
        body += `I am excited about this opportunity and look forward to scheduling an interview call at your earliest convenience. `;
      }
    } else {
      body += `I appreciate your consideration and am very interested in learning more about the role and team. `;
    }

    body += `Please find my updated resume attached.\n\nBest Regards,\nUday Singh Kushwah`;

    return {
      subject,
      body
    };
  }
}
