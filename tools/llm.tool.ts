import dotenv from 'dotenv';
dotenv.config();

export interface LLMRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export class LLMTool {
  async generateJson<T>(request: LLMRequest, fallbackMock: T): Promise<T> {
    const provider = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
    console.log(`[LLMTool] Invoking provider '${provider}'...`);

    if (provider === 'openai') {
      if (process.env.OPENAI_API_KEY) {
        try {
          const response = await this.callOpenAI(request);
          const jsonText = this.cleanJsonResponse(response);
          return JSON.parse(jsonText) as T;
        } catch (err: any) {
          console.warn(`[LLMTool] OpenAI API error (${err.message}). Falling back to mock engine.`);
        }
      } else {
        console.warn(`[LLMTool] LLM_PROVIDER is 'openai' but OPENAI_API_KEY is missing in .env. Falling back to mock engine.`);
      }
    }

    if (provider === 'gemini') {
      if (process.env.GEMINI_API_KEY) {
        try {
          const response = await this.callGemini(request);
          const jsonText = this.cleanJsonResponse(response);
          return JSON.parse(jsonText) as T;
        } catch (err: any) {
          console.warn(`[LLMTool] Gemini API error (${err.message}). Falling back to mock engine.`);
        }
      } else {
        console.warn(`[LLMTool] LLM_PROVIDER is 'gemini' but GEMINI_API_KEY is missing in .env. Falling back to mock engine.`);
      }
    }

    // Default: Smart Mock Fallback Engine based on prompt keywords
    return fallbackMock;
  }

  private cleanJsonResponse(raw: string): string {
    return raw.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  private async callOpenAI(request: LLMRequest): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: request.systemPrompt || 'You output valid JSON.' },
          { role: 'user', content: request.userPrompt }
        ],
        temperature: request.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error ${response.status}: ${await response.text()}`);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }

  private async callGemini(request: LLMRequest): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${request.systemPrompt || ''}\n\n${request.userPrompt}` }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error ${response.status}: ${await response.text()}`);
    }

    const data: any = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}
