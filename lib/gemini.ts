import { GoogleGenerativeAI, GenerativeModel, ModelParams } from '@google/generative-ai';

export function getGeminiModel(params?: Partial<ModelParams>): GenerativeModel | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash', 
    ...params 
  });
}
