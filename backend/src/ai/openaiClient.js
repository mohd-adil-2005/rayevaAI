import { config } from '../config.js';

/**
 * Lightweight Gemini client that mimics the subset of the OpenAI SDK we use:
 * client.chat.completions.create({ model, messages, temperature })
 *
 * We map OpenAI-style chat messages to Gemini's generateContent format and then
 * map the response back to an OpenAI-like shape.
 */
class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    // Use v1 and the latest flash model for free-tier compatibility
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
  }

  async chatCompletionsCreate(payload) {
    const { model, messages = [], temperature } = payload || {};
    const sysMsgs = messages.filter((m) => m.role === 'system');
    const otherMsgs = messages.filter((m) => m.role !== 'system');

    const systemText = sysMsgs.map((m) => m.content).join('\n');
    const userText = otherMsgs.map((m) => m.content).join('\n');
    const prompt = systemText ? `${systemText}\n\n${userText}` : userText;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: typeof temperature === 'number' ? temperature : 0.3,
      },
    };

    const targetModel = model || 'gemini-2.5-flash';
    const url = `${this.baseUrl}/models/${encodeURIComponent(targetModel)}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p) => p.text || '').join('');

    return {
      model: targetModel,
      choices: [
        {
          message: {
            role: 'assistant',
            content: text,
          },
        },
      ],
      _rawGemini: data,
    };
  }
}

let client = null;

export function getOpenAIClient() {
  const key = config.llmApiKey;
  if (!key) {
    throw new Error('LLM API key is not set. Add your Gemini API key to OPENAI_API_KEY (or DEEPSEEK_API_KEY) in backend/.env.');
  }
  if (!client) {
    const svc = new GeminiClient(key);
    client = {
      chat: {
        completions: {
          create: (payload) => svc.chatCompletionsCreate(payload),
        },
      },
    };
  }
  return client;
}
