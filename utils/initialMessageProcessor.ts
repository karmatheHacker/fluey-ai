import { Message } from '@/types/chat';
import { getAIResponse } from '@/utils/api';
import { generateMessageId } from '@/utils/messageUtils';

export const processInitialMessage = async (
    session: { messages: Message[]; id: string } | undefined,
    processingInitialMessage: React.MutableRefObject<boolean>,
    setIsStreaming: (isStreaming: boolean) => void,
    setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
    setLastApiResponse: (response: any) => void,
    updateSession: (id: string, messages: Message[]) => void
) => {
    // Only process if we have a session with exactly one user message
    // and we're not already processing
    if (session &&
        session.messages.length === 1 &&
        session.messages[0].isUser &&
        !processingInitialMessage.current) {

        processingInitialMessage.current = true;
        console.log('New session with initial message detected - WILL PROCESS');

        // Get the user message
        const userMessage = session.messages[0].text;
        console.log('Initial user message to process:', userMessage);

        // Add initial empty message for API response
        const responseId = generateMessageId();
        setMessages(prev => [...prev, {
            id: responseId,
            text: '',
            isUser: false,
            isStreaming: true
        }]);

        try {
            // Manually trigger the API response
            console.log('Setting isStreaming to true');
            setIsStreaming(true);

            // Call the API directly - use the imported function
            console.log('Calling getAIResponse with session messages');
            const apiResponse = await getAIResponse([{
                id: session.messages[0].id,
                text: userMessage,
                isUser: true,
                isStreaming: false
            }]);

            console.log('API response received:', apiResponse ? 'success' : 'null');

            if (apiResponse) {
                console.log('Creating AI message with response content');
                // Create a new AI message
                const aiMessage: Message = {
                    id: responseId,
                    text: apiResponse.content,
                    isUser: false,
                    isStreaming: false
                };

                console.log('Updating messages state with AI response');
                // Update the existing streaming message
                setMessages(prev => prev.map(msg =>
                    msg.id === responseId ? aiMessage : msg
                ));

                console.log('Updating lastApiResponse state');
                // Update the lastApiResponse state
                setLastApiResponse(apiResponse);

                console.log('Updating session in store');
                // Update the session in the store
                if (session.id) {
                    const updatedMessages = [...session.messages, aiMessage];
                    console.log('Updating session with messages count:', updatedMessages.length);
                    updateSession(session.id, updatedMessages);
                }
            } else {
                console.error('API response was null or undefined');
                // Remove the streaming message if API call failed
                setMessages(prev => prev.filter(msg => msg.id !== responseId));
            }
        } catch (error) {
            console.error('Error generating initial response:', error);
            // Remove the streaming message if there was an error
            setMessages(prev => prev.filter(msg => msg.id !== responseId));
        } finally {
            console.log('Setting isStreaming to false');
            setIsStreaming(false);
        }
    } else {
        if (processingInitialMessage.current) {
            console.log('Initial message already processed, skipping');
        } else if (!session) {
            console.log('No session available, skipping initial message processing');
        } else if (session.messages.length !== 1) {
            console.log('Session has', session.messages.length, 'messages, not processing initial message');
        } else if (!session.messages[0].isUser) {
            console.log('First message is not from user, skipping initial message processing');
        }
    }
}; 