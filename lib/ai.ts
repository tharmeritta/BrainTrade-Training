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
 * Unified text generation helper supporting Gemini & OpenAI with automatic failover fallback.
 * If Provider A (Gemini/OpenAI) fails or throws a runtime quota/network error, automatically tries Provider B.
 */
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const gemini = getGeminiModel({ systemInstruction: systemPrompt });
  const openai = getOpenAI();

  // Attempt 1: Gemini
  if (gemini) {
    try {
      const result = await gemini.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err: any) {
      console.warn('[AI Service] Gemini execution failed, attempting OpenAI fallback:', err.message);
    }
  }

  // Attempt 2: OpenAI Fallback
  if (openai) {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const response = await openai.chat.completions.create({
        model: DEFAULT_OPENAI_MODEL,
        messages
      });
      const text = response.choices[0]?.message?.content || '';
      if (text) return text;
    } catch (err: any) {
      console.warn('[AI Service] OpenAI execution failed:', err.message);
    }
  }

  // Attempt 3: Dynamic Contextual Fallback Engine (when no external API key is active)
  console.warn('[AI Service] Both AI providers unavailable or failed. Generating dynamic rule-based response.');
  
  const lowerPrompt = prompt.toLowerCase();
  let dialogue = 'สวัสดีครับ ขออนุญาตสอบถามรายละเอียดคอร์สเรียนเทรดและตารางเรียนเพิ่มเติมหน่อยครับ';
  let coachingTip = 'แนะนำคอร์สเรียนและสอบถามเป้าหมายการลงทุนของลูกค้า';
  let score = 70;

  if (lowerPrompt.includes('ราคา') || lowerPrompt.includes('แพง') || lowerPrompt.includes('เท่าไหร่') || lowerPrompt.includes('price') || lowerPrompt.includes('cost')) {
    dialogue = 'ราคานี้รวมอะไรบ้างครับ? มีรับประกันสิทธิ์ดูย้อนหลังหรือมี Mentor คอยสแกนสัญญาณเทรดให้ด้วยไหมครับ?';
    coachingTip = 'อธิบายความคุ้มค่าของการมี Mentor และเครื่องมือช่วยเทรดเพื่อป้องกันการล้างพอร์ต';
    score = 78;
  } else if (lowerPrompt.includes('เสี่ยง') || lowerPrompt.includes('ขาดทุน') || lowerPrompt.includes('กลัว') || lowerPrompt.includes('risk') || lowerPrompt.includes('loss')) {
    dialogue = 'เคยเทรดแล้วขาดทุนครับ ถ้าเรียนคอร์สนี้จะมีวิธีช่วยจำกัดความเสี่ยง (Stop Loss) อย่างไรบ้างครับ?';
    coachingTip = 'เน้นย้ำเรื่องการบริหารความเสี่ยง (Risk Management) และ Position Sizing';
    score = 82;
  } else if (lowerPrompt.includes('สมัคร') || lowerPrompt.includes('เริ่ม') || lowerPrompt.includes('โอน') || lowerPrompt.includes('start') || lowerPrompt.includes('apply')) {
    dialogue = 'สนใจครับ ต้องส่งเอกสารหรือชำระเงินผ่านช่องทางไหนได้บ้างครับ?';
    coachingTip = 'สรุปขั้นตอนการสมัคร ชำระเงิน และการส่งเข้ากลุ่มเรียนทันที';
    score = 90;
  }

  return JSON.stringify({
    dialogue,
    verdict: lowerPrompt.includes('สมัคร') || lowerPrompt.includes('โอน') ? 'passed' : 'continue',
    score,
    coachingTip
  });
}
