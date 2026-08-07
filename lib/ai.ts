import { GoogleGenerativeAI, GenerativeModel, ModelParams } from '@google/generative-ai';
import OpenAI from 'openai';
import { DEFAULT_GEMINI_MODEL, DEFAULT_OPENAI_MODEL } from '@/lib/constants';

let _openai: OpenAI | null = null;

export function getGeminiModel(params?: Partial<ModelParams>): GenerativeModel | null {
  if (!process.env.GEMINI_API_KEY) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ 
    model: DEFAULT_GEMINI_MODEL, 
    ...params 
  }, { apiVersion: 'v1beta' });
}

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/**
 * Unified text generation helper supporting Gemini (default) with OpenAI fallback.
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const gemini = getGeminiModel({ systemInstruction: systemPrompt });
  if (gemini) {
    const result = await gemini.generateContent(prompt);
    return result.response.text();
  }

  const openai = getOpenAI();
  if (openai) {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const response = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages
    });
    return response.choices[0]?.message?.content || '';
  }

  throw new Error('No AI provider API key configured (GEMINI_API_KEY or OPENAI_API_KEY).');
}
