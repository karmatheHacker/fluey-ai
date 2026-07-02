import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '@/types/chat';

// Keys for AsyncStorage
const STORAGE_KEYS = {
  MESSAGES: 'fluey_ai_messages',
};

/**
 * Save messages to AsyncStorage
 */
export const saveMessages = async (messages: Message[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(messages);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, jsonValue);
  } catch (error) {
    console.error('Error saving messages to storage:', error);
  }
};

/**
 * Load messages from AsyncStorage
 */
export const loadMessages = async (): Promise<Message[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading messages from storage:', error);
    return [];
  }
};

/**
 * Clear all messages from AsyncStorage
 */
export const clearMessages = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.MESSAGES);
  } catch (error) {
    console.error('Error clearing messages from storage:', error);
  }
};
