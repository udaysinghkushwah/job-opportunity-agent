import { BaseAgent } from './base.agent';
import { OpportunityState, ExtractedEmailAnalysis } from '../workflows/state.interface';
import { LLMTool } from '../tools/llm.tool';
import { ANALYSIS_PROMPT_TEMPLATE } from '../prompts/analysis.prompt';

export class EmailAnalysisAgent extends BaseAgent {
  public readonly name = 'EmailAnalysisAgent';
  private llmTool: LLMTool;

  constructor() {
    super();
    this.llmTool = new LLMTool();
  }

  public async execute(state: OpportunityState): Promise<OpportunityState> {
    this.log(state, 'Extracting structured role, recruiter, and opportunity details via LLM...');

    const prompt = ANALYSIS_PROMPT_TEMPLATE
      .replace('{{from}}', state.rawEmail.from)
      .replace('{{subject}}', state.rawEmail.subject)
      .replace('{{body}}', state.rawEmail.body);

    // Smart Fallback Extractor if LLM Provider is offline/mock/rate-limited
    const fallback: ExtractedEmailAnalysis = this.deriveFallbackAnalysis(state);

    const analysis = await this.llmTool.generateJson<ExtractedEmailAnalysis>(
      { userPrompt: prompt },
      fallback
    );

    state.analysis = analysis;
    state.currentStep = 'ANALYSIS_COMPLETE';
    state.status = 'ANALYZED';

    this.log(state, `Extracted Opportunity: Company="${analysis.company}", Role="${analysis.role}", Recruiter="${analysis.recruiterName}", ResumeRequested=${analysis.resumeRequested}`, {
      analysis
    });

    return state;
  }

  private deriveFallbackAnalysis(state: OpportunityState): ExtractedEmailAnalysis {
    const text = `${state.rawEmail.subject} ${state.rawEmail.body}`.toLowerCase();
    
    // Check for spam / promotional emails
    if (text.includes('unsubscribe') || text.includes('marketing') || text.includes('crypto loan') || text.includes('discount')) {
      return {
        company: 'Unknown Advertiser',
        recruiterName: 'Marketing System',
        role: 'Promotional Spam',
        type: 'Spam_Marketing',
        jd: 'Promotional spam email ignored',
        resumeRequested: false,
        confidenceScore: 0.95
      };
    }

    // Dynamic Recruiter Name extraction:
    // 1. Try to extract "Hi [Name]" or "Dear [Name]" from body
    // 2. Or try "Regards, [Name]" / "Best, [Name]"
    // 3. Fallback to sender's display name or email prefix
    let recruiterName = 'Hiring Manager';

    // Check greeting in body, e.g., "Hi Alex," or "Hello Sarah,"
    const greetingMatch = state.rawEmail.body.match(/(?:Hi|Hello|Dear)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (greetingMatch && greetingMatch[1]) {
      recruiterName = greetingMatch[1].trim();
    } else {
      const signoffMatch = state.rawEmail.body.match(/(?:Regards|Best|Thanks|Sincerely),\s*\n?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
      if (signoffMatch && signoffMatch[1]) {
        recruiterName = signoffMatch[1].trim();
      } else {
        const fromStr = state.rawEmail.from || '';
        const nameMatch = fromStr.match(/^"?([^"<]+)"?\s*</);
        if (nameMatch && nameMatch[1].trim()) {
          recruiterName = nameMatch[1].trim().replace(/^"|"$/g, '');
        } else {
          const emailPrefix = fromStr.split('@')[0].replace(/[._-]/g, ' ');
          if (emailPrefix && emailPrefix.length > 2) {
            recruiterName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
          }
        }
      }
    }

    // Dynamic Company extraction:
    // 1. Look for "...at [Company]" or "...with [Company]" or "...from [Company]" in body/subject
    // 2. Or extract from sender email domain
    let company = 'your company';
    const atCompanyMatch = state.rawEmail.body.match(/(?:at|with|from)\s+([A-Z][A-Za-z0-9\s&]{2,20}?)(?:\.|\s+for|\s+regarding|\s+is|\s+we|\n|$)/);
    if (atCompanyMatch && atCompanyMatch[1] && !['the', 'our', 'a', 'this'].includes(atCompanyMatch[1].toLowerCase().trim())) {
      company = atCompanyMatch[1].trim();
    } else {
      const fromStr = state.rawEmail.from || '';
      const domainMatch = fromStr.match(/@([a-zA-Z0-9.-]+)/);
      if (domainMatch && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domainMatch[1])) {
        const compName = domainMatch[1].split('.')[0];
        company = compName.charAt(0).toUpperCase() + compName.slice(1);
      }
    }

    // Dynamic Role extraction:
    let role = 'Senior Software Engineer';
    const roleMatch = `${state.rawEmail.subject} ${state.rawEmail.body}`.match(/(?:position|role|opportunity|hiring for|seeking a|looking for a|for the)\s+(?:of\s+)?([A-Z][A-Za-z0-9\s-]{3,30}?)(?:\.|\s+at|\s+with|\s+in|\s+position|\n|$)/i);
    if (roleMatch && roleMatch[1] && roleMatch[1].length > 3) {
      role = roleMatch[1].trim();
    } else if (text.includes('node') || text.includes('backend')) {
      role = 'Senior Node.js Engineer';
    } else if (/\b(ai|llm|agent)\b/i.test(text)) {
      role = 'Senior AI Engineer';
    } else if (text.includes('full stack') || text.includes('fullstack')) {
      role = 'Full Stack Engineer';
    }

    const resumeRequested = text.includes('resume') || text.includes('cv') || text.includes('profile');
    const isInterview = text.includes('interview') || text.includes('schedule') || text.includes('call');

    let interviewDate: string | undefined;
    if (text.includes('tomorrow')) interviewDate = 'Tomorrow 3:00 PM';

    return {
      company,
      recruiterName,
      recruiterEmail: state.rawEmail.from,
      role,
      type: isInterview ? 'Interview' : 'General_Inquiry',
      ctc: 'Competitive / Market Rate',
      location: 'Remote / On-site',
      jd: state.rawEmail.body,
      resumeRequested,
      interviewDate,
      confidenceScore: 0.92
    };
  }
}
