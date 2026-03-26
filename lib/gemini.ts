import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let _geminiModel: GenerativeModel | null = null;

export function getGeminiModel(): GenerativeModel | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!_geminiModel) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    _geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return _geminiModel;
}
