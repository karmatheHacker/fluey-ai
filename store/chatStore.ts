import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';

// Define a chat session type
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  lastViewedAt?: number; // Add this to track session activity
}
// Add pagination support
const MESSAGES_PER_PAGE = 50;
// Define the store state
interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  
  // Actions
  createSession: (initialMessage?: string) => string;
  updateSession: (sessionId: string, messages: Message[]) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  clearAllSessions: () => void;
}

// Generate a title from the first user message
const generateTitle = (message: string): string => {
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

// Create the store with persistence
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      
      createSession: (initialMessage?: string) => {
        const id = `session_${Date.now()}`;
        const newSession: ChatSession = {
          id,
          title: initialMessage ? generateTitle(initialMessage) : 'New Chat',
          messages: initialMessage 
            ? [{ id: generateMessageId(), text: initialMessage, isUser: true, isStreaming: false }] 
            : [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id,
        }));
        
        return id;
      },
      
      updateSession: (sessionId, messages) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { 
                  ...session, 
                  messages: messages.slice(-MESSAGES_PER_PAGE), // Keep only recent messages in memory
                  updatedAt: Date.now(),
                  lastViewedAt: Date.now()
                } 
              : session
          ),
        }));
      },
      
      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter(session => session.id !== sessionId);
          const newActiveId = state.activeSessionId === sessionId 
            ? (newSessions.length > 0 ? newSessions[0].id : null) 
            : state.activeSessionId;
            
          return {
            sessions: newSessions,
            activeSessionId: newActiveId,
          };
        });
      },
      
      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },
      
      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId 
              ? { ...session, title } 
              : session
          ),
        }));
      },
      
      clearAllSessions: () => {
        set({ sessions: [], activeSessionId: null });
      },
    }),
    {
      name: 'fluey-chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
