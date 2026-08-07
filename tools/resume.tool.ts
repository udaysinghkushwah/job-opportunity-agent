import fs from 'fs';
import path from 'path';

export interface ResumeMatchResult {
  category: 'Backend' | 'AI' | 'Healthcare' | 'Leadership' | 'General';
  resumeName: string;
  filePath: string;
  reason: string;
}

export class ResumeTool {
  private resumesDir: string;

  constructor() {
    this.resumesDir = path.join(__dirname, '../storage/resumes');
  }

  selectBestResume(role: string, jd: string): ResumeMatchResult {
    const text = `${role} ${jd}`.toLowerCase();

    // Use word boundary regex to avoid false positives like "availability" matching "ai"
    if (/\b(ai|llm|ml|rag|agent|agents|prompt|gpt|claude|gemini)\b/i.test(text)) {
      return {
        category: 'AI',
        resumeName: 'resume_ai.pdf',
        filePath: path.join(this.resumesDir, 'resume_ai.pdf'),
        reason: 'Matched AI/LLM domain keywords'
      };
    }

    if (/\b(health|healthcare|hipaa|fhir|clinical|medical|patient|ehr)\b/i.test(text)) {
      return {
        category: 'Healthcare',
        resumeName: 'resume_healthcare.pdf',
        filePath: path.join(this.resumesDir, 'resume_healthcare.pdf'),
        reason: 'Matched Healthcare domain keywords'
      };
    }

    if (/\b(lead|manager|director|vp|head|management|leadership)\b/i.test(text)) {
      return {
        category: 'Leadership',
        resumeName: 'resume_leadership.pdf',
        filePath: path.join(this.resumesDir, 'resume_leadership.pdf'),
        reason: 'Matched Leadership domain keywords'
      };
    }

    // Default Fallback: Backend Resume PDF
    return {
      category: 'Backend',
      resumeName: 'resume_backend.pdf',
      filePath: path.join(this.resumesDir, 'resume_backend.pdf'),
      reason: 'Default backend engineering PDF resume matched for core technical role'
    };
  }

  getAvailableResumes(): string[] {
    if (!fs.existsSync(this.resumesDir)) return [];
    return fs.readdirSync(this.resumesDir);
  }
}
