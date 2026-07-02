import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Message } from '@/types/chat';

// Create a separate interface file to avoid circular dependency
interface AIResponse {
    id: string;
    provider: string;
    model: string;
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getGeminiResponse = async (messages: Message[]): Promise<AIResponse> => {
    try {
        console.log('Processing messages for Gemini API:', messages.length);
        
        // Convert our app messages to Gemini chat format
        const geminiMessages = messages.map(msg => ({
            role: msg.isUser ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
        
        console.log('Formatted messages for Gemini:', JSON.stringify(geminiMessages.slice(0, 2)));
        
        // Use the chat model
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ],
        });
        
        // Create a chat session
        const chat = model.startChat({
            history: geminiMessages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 2048,
            },
        });
        
        // Get the last message to send as the current query
        const lastMessage = messages[messages.length - 1];
        
        // Send the last message to the chat
        const result = await chat.sendMessage(lastMessage.text);
        const response = await result.response;
        const responseText = response.text();
        
        console.log('Gemini API Response received, length:', responseText.length);

        return {
            id: `gemini-${Date.now()}`,
            provider: 'google-gemini',
            model: 'gemini-1.5-flash',
            content: responseText,
            usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            }
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};