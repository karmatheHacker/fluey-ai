import { useEffect, useState, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import { useChatStore } from '@/store/chatStore';
import { useChat } from './useChat';
import { generateMessageId } from '@/utils/messageUtils';
import { getAIResponse } from '@/utils/api';
import { generateChatTitle } from '@/utils/titleGenerator';


/**
 * A custom hook to manage chat session state and synchronization
 * This hook handles the connection between the chat UI and the chat store
 */
export const useChatSession = (sessionId: string | undefined) => {
  // Track if we're processing an initial message
  const processingInitialMessage = useRef(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
const [tempTitle, setTempTitle] = useState<string | null>(null);
  
  // Get chat store actions and current session
  const { updateSession, deleteSession, updateSessionTitle } = useChatStore();
  const session = useChatStore(state =>
    state.sessions.find(s => s.id === sessionId)
  );

  // Initialize chat hook with session messages
  const {
    messages,
    setMessages,
    isStreaming,
    addMessage,
    useApiResponse,
    toggleUseApiResponse,
    setIsStreaming,
  } = useChat(session?.messages || []);

  // Process initial message if needed
  useEffect(() => {
    // Skip if no session or no sessionId
    if (!session || !sessionId) return;
    
    const processInitialMessage = async () => {
      // Only process if we have a session with exactly one user message
      // and we're not already processing
      if (session.messages.length === 1 &&
          session.messages[0].isUser &&
          !processingInitialMessage.current) {

        processingInitialMessage.current = true;
        console.log('New session with initial message detected - processing');

        // Generate a title for this new session
        const userMessage = session.messages[0].text;
        console.log('Generating title for initial message:', userMessage);
        setTempTitle(userMessage);
        setIsGeneratingTitle(true);
        
        // Generate title in the background
        generateChatTitle(userMessage)
          .then(title => {
            console.log('Title generated successfully:', title);
            if (sessionId) {
              updateSessionTitle(sessionId, title);
              setIsGeneratingTitle(false);
              setTempTitle(null);
            }
          })
          .catch(error => {
            console.error('Error generating title:', error);
            setIsGeneratingTitle(false);
            setTempTitle(null);
          });

        const streamingMessage: Message = {
          id: generateMessageId(),
          text: '',
          isUser: false,
          isStreaming: true
        };

        try {
          // Add a streaming message first
          setMessages(prev => [...prev, streamingMessage]);

          // Manually trigger the API response
          setIsStreaming(true);

          // Get the user message
          const userMessage = session.messages[0].text;
          
          // Call the API directly
          const apiResponse = await getAIResponse([{
            id: session.messages[0].id,
            text: userMessage,
            isUser: true,
            isStreaming: false
          }]);

          if (apiResponse) {
            // Create a new AI message
            const aiMessage: Message = {
              id: streamingMessage.id, // Use the same ID as the streaming message
              text: apiResponse.content,
              isUser: false,
              isStreaming: false
            };

            // Update the streaming message with the actual content
            setMessages(prev => prev.map(msg =>
              msg.id === streamingMessage.id ? aiMessage : msg
            ));

            // Update the session in the store
            const updatedMessages = [...session.messages, aiMessage];
            updateSession(sessionId, updatedMessages);
          } else {
            // Remove the streaming message if API call failed
            setMessages(prev => prev.filter(msg => msg.id !== streamingMessage.id));
          }
        } catch (error) {
          console.error('Error generating initial response:', error);
          // Remove the streaming message if there was an error
          setMessages(prev => prev.filter(msg => msg.id !== streamingMessage.id));
        } finally {
          setIsStreaming(false);
          processingInitialMessage.current = false;
        }
      }
    };

    // Check if we need to process an initial message
    if (session.messages.length === 1 && session.messages[0].isUser) {
      processInitialMessage();
    }
  }, [session?.id, session?.messages]);

  // Sync messages back to the store when they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      updateSession(sessionId, messages);
    }
  }, [sessionId, messages, updateSession]);

  // Reset messages when session changes
  useEffect(() => {
    // When session changes, update our local messages state
    if (session) {
      // Only update if the messages are different to avoid loops
      const sessionMessagesJson = JSON.stringify(session.messages);
      const currentMessagesJson = JSON.stringify(messages);
      
      if (sessionMessagesJson !== currentMessagesJson) {
        console.log(`Session changed, updating messages (${session.messages.length} messages)`);
        setMessages(session.messages);
      }
    }
  }, [session?.id]);

  const sendMessage = useCallback(async (text: string, forceNextFail = false) => {
    if (text.trim() && !isStreaming && sessionId) {
      // If this is the first message in the chat OR the session title is still "New Chat",
      // we'll use it to generate a title
      const isFirstMessage = session?.messages.length === 0;
      const isDefaultTitle = session?.title === 'New Chat';
      
      console.log('Sending message:', text.trim());
      console.log('Is first message?', isFirstMessage);
      console.log('Is default title?', isDefaultTitle);
      console.log('Current session messages:', session?.messages.length);
      
      if (isFirstMessage || isDefaultTitle) {
        console.log('Generating title for message:', text.trim());
        // Set the temporary title to the user's message
        setTempTitle(text.trim());
        setIsGeneratingTitle(true);
        
        // Generate a title in the background
        generateChatTitle(text.trim()).then(title => {
          console.log('Title generated successfully:', title);
          if (sessionId) {
            updateSessionTitle(sessionId, title);
            setIsGeneratingTitle(false);
            setTempTitle(null);
          }
        }).catch(error => {
          console.error('Error generating title:', error);
          setIsGeneratingTitle(false);
          setTempTitle(null);
        });
      }
      
      await addMessage(text.trim(), true, forceNextFail);
      return true;
    }
    return false;
  }, [addMessage, isStreaming, sessionId, session?.messages.length, updateSessionTitle]);

  // Handle deleting the current session
  const handleDeleteSession = useCallback(() => {
    if (sessionId) {
      deleteSession(sessionId);
      return true;
    }
    return false;
  }, [deleteSession, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // Handle retrying failed messages
  const handleRetry = useCallback(async (messageId: string) => {
    // Mark the failed message as streaming again
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isStreaming: true, failed: false } : msg
    ));
    
    try {
      setIsStreaming(true);
      
      // Get all user messages plus the failed message
      const relevantMessages = messages.filter(msg => msg.isUser || msg.id === messageId);
      
      const apiResponse = await getAIResponse(relevantMessages);
      
      if (apiResponse) {
        // Replace the failed message with the new AI response
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, text: apiResponse.content, isStreaming: false, failed: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error retrying message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, failed: true, isStreaming: false } : msg
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, setIsStreaming, setMessages]);

  return {
    session,
    messages,
    isStreaming,
    sendMessage,
    deleteSession: handleDeleteSession,
    clearMessages,
    toggleUseApiResponse,
    useApiResponse,
    handleRetry,
    isGeneratingTitle,
    tempTitle
  };
};
