// /utils/titleGenerator.ts
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateChatTitle = async (message: string): Promise<string> => {
  try {
    console.log('generateChatTitle called with message:', message);
    
    if (!GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY found, using fallback title generation');
      // Fallback to basic title generation if no API key
      return generateBasicTitle(message);
    }

    console.log('Preparing Gemini API request for title generation');
    const prompt = `Generate a very short, concise title (max 4-5 words) for a chat that starts with this message: "${message}". 
    The title should be catchy and descriptive of the main topic. 
    Return ONLY the title text, nothing else.`;

    console.log('Sending request to Gemini API');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });
    console.log('Received response from Gemini API:', response);

    // Clean up the response
    let title = response?.text?.trim() ?? '';
    console.log('Raw title from API:', title);
    
    // Remove quotes if present
    title = title.replace(/^["']|["']$/g, '');
    console.log('Title after removing quotes:', title);
    
    // Limit length
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
    console.log('Final title:', title);

    return title || generateBasicTitle(message);
  } catch (error) {
    console.error('Error generating title:', error);
    return generateBasicTitle(message);
  }
};

// Fallback title generator
const generateBasicTitle = (message: string): string => {
  // Truncate to first 30 characters if longer
  if (message.length <= 30) {
    return message;
  }
  
  // Try to find a natural break point (period, question mark, etc.)
  const breakPoints = ['. ', '? ', '! '];
  for (const breakPoint of breakPoints) {
    const index = message.indexOf(breakPoint);
    if (index > 0 && index < 30) {
      return message.substring(0, index + 1);
    }
  }
  
  // If no natural break, truncate at a word boundary
  const truncated = message.substring(0, 30);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 10) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};