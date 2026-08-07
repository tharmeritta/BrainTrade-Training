import { GoogleGenerativeAI, GenerativeModel, ModelParams } from '@google/generative-ai';
import { DEFAULT_GEMINI_MODEL } from '@/lib/constants';

export function getGeminiModel(params?: Partial<ModelParams>): GenerativeModel | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  return genAI.getGenerativeModel({ 
    model: DEFAULT_GEMINI_MODEL, 
    ...params 
  }, { apiVersion: 'v1beta' });
}
