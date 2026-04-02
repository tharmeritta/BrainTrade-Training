import { GoogleGenerativeAI, GenerativeModel, ModelParams } from '@google/generative-ai';

export function getGeminiModel(params?: Partial<ModelParams>): GenerativeModel | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // Using v1beta as requested for Gemini 3 Flash
  return genAI.getGenerativeModel({ 
    model: 'gemini-3-flash', 
    ...params 
  }, { apiVersion: 'v1beta' });
}
