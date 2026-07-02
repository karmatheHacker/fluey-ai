import { Message } from '@/types/chat';
import { getGeminiResponse } from './geminiApi';

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const SITE_URL = 'https://fluey-ai.vercel.app';
const SITE_NAME = 'Fluey AI';

// Fallback responses for when API is not available
const FALLBACK_RESPONSES = [
    "I'm here to help! What would you like to know?",
    "That's an interesting question. Let me think about that...",
    "I understand what you're saying. Here's what I think about it...",
    "Thanks for sharing. Based on what you've told me, I would suggest...",
    "I've analyzed your message and here's my response...",
];

export interface AIResponse {
    id: string;
    provider: string;
    model: string;
    content: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
};

// Function to generate a fallback response
export const generateFallbackResponse = (messages: Message[]): AIResponse => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    let responseIndex = 0;

    // Use the last character of the message as a simple hash to select a response
    if (lastUserMessage && lastUserMessage.text.length > 0) {
        const charCode = lastUserMessage.text.charCodeAt(lastUserMessage.text.length - 1);
        responseIndex = charCode % FALLBACK_RESPONSES.length;
    }

    const content = FALLBACK_RESPONSES[responseIndex];
    const messageLength = messages.reduce((sum, msg) => sum + msg.text.length, 0);

    return {
        id: `fallback-${Date.now()}`,
        provider: "local-fallback",
        model: "fallback-model",
        content,
        usage: {
            prompt_tokens: Math.ceil(messageLength / 4),
            completion_tokens: Math.ceil(content.length / 4),
            total_tokens: Math.ceil((messageLength + content.length) / 4)
        }
    };
};

export async function getAIResponse(
    messages: Message[],
    { simulateFlaky = false }: { simulateFlaky?: boolean } = {}
) {
    // Simulate network delay

    if (simulateFlaky) { 
        throw new Error('Network error: Simulated flaky network');
    }

    try {
        console.log('==== API REQUEST STARTED ====');
        console.log('Messages to process:', messages.length);

        // Log the first message for debugging
        if (messages.length > 0) {
            console.log('First message:', {
                isUser: messages[0].isUser,
                text: messages[0].text.substring(0, 50) + (messages[0].text.length > 50 ? '...' : '')
            });
        }

        if (!OPENROUTER_API_KEY && !GEMINI_API_KEY) {
            await new Promise(res => setTimeout(res, 1200 + Math.random() * 1200));
            console.log('No API keys configured. Using fallback response mechanism.');
            return generateFallbackResponse(messages);
        }

        // Prefer Gemini if available
        if (GEMINI_API_KEY) {
            return getGeminiResponse(messages);
        }

        console.log('Preparing API request with key:', OPENROUTER_API_KEY ? '(Key exists)' : '(No key)');

        // Create the messages array for the API request
        const apiMessages = messages.map(msg => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text
        }));

        console.log('API messages prepared:', apiMessages.length);

        const requestBody = {
            "model": "featherless/qwerky-72b:free",
            messages: apiMessages
        };

        console.log('Request body prepared:', JSON.stringify(requestBody).substring(0, 100) + '...');

        // Make the API request
        console.log('Sending fetch request to OpenRouter API...');
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed with status ${response.status}:`, errorText);
            console.log('Falling back to local response generation');
            const fallbackResponse = generateFallbackResponse(messages);
            console.log('Generated fallback response after error:', fallbackResponse.content.substring(0, 50));
            return fallbackResponse;
        }

        // Parse the response JSON
        console.log('Parsing API response JSON...');
        const data = await response.json();

        // Check if the response has the expected structure
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('API response missing expected structure:', JSON.stringify(data).substring(0, 200));
            const fallbackResponse = generateFallbackResponse(messages);
            console.log('Generated fallback response due to malformed API response:', fallbackResponse.content.substring(0, 50));
            return fallbackResponse;
        }

        // Log the full response data for debugging
        console.log('API Response received successfully');
        console.log('Response ID:', data.id || 'undefined');
        console.log('Provider:', data.provider || 'undefined');
        console.log('Model:', data.model || 'undefined');
        console.log('Content:', data.choices[0].message.content.substring(0, 50) + '...');

        // Create a safe usage object if it's missing
        const usage = data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
        };

        console.log('Usage:', usage);

        // Return structured response data
        const result = {
            id: data.id || `local-${Date.now()}`,
            provider: data.provider || 'openrouter',
            model: data.model || 'unknown',
            content: data.choices[0].message.content,
            usage: usage
        };

        console.log('==== API REQUEST COMPLETED SUCCESSFULLY ====');
        return result;
    } catch (error) {
        console.error('==== API ERROR ====');
        console.error('Error getting AI response:', error);
        console.log('Falling back to local response generation due to error');
        const fallbackResponse = generateFallbackResponse(messages);
        console.log('Generated fallback response after exception:', fallbackResponse.content.substring(0, 50));
        return fallbackResponse;
    }
}