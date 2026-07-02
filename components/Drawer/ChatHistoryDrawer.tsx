import { useChatStore } from '@/store/chatStore';
import { clearMessages } from '@/utils/storage';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { MessageSquare, Plus, Search, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatHistoryDrawerProps {
  [key: string]: any;
  onDrawerStateChanged?: (isOpen: boolean) => void;
}

const ChatHistoryDrawer: React.FC<ChatHistoryDrawerProps> = (props) => {
  const { onDrawerStateChanged } = props;

  useEffect(() => {
    onDrawerStateChanged?.(true);
    return () => onDrawerStateChanged?.(false);
  }, [onDrawerStateChanged]);
  const { sessions, createSession, deleteSession } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = useCallback(() => {
    // Create a new empty session
    const sessionId = createSession();
    // Clear messages in the new session
    useChatStore.getState().updateSession(sessionId, []);
    // Clear any saved messages from AsyncStorage
    clearMessages();

    // Navigate to the new chat
    router.push(`/chat/${sessionId}`);
    // Close the drawer if we have navigation prop
    props.navigation?.closeDrawer();

    // Clear the search query
    setSearchQuery('');
  }, [createSession, props.navigation]);

  const handleChatSelect = useCallback((sessionId: string) => {
    // Navigate to the selected chat
    router.push(`/chat/${sessionId}`);
    // Close the drawer if we have navigation prop
    props.navigation?.closeDrawer();
  }, [props.navigation]);

  const handleDeleteChat = useCallback((sessionId: string, sessionTitle: string) => {
    Alert.alert(
      "Delete Chat",
      `Are you sure you want to delete "${sessionTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteSession(sessionId)
        }
      ]
    );
  }, [deleteSession]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4">
        <View className="mb-6 mt-10 py-2">
          <Text className="text-2xl font-bold text-white">Fluey AI</Text>
        </View>

        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 flex-row items-center bg-zinc-800 py-3 px-4 gap-2 rounded-lg">
            <Search size={18} color="#a1a1aa" className="mr-2" />
            <TextInput
              placeholder="Search chat history"
              placeholderTextColor="#a1a1aa"
              className="flex-1 text-white text-base"
              cursorColor={'#fff'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            className="bg-zinc-800 p-4 rounded-lg"
            onPress={handleNewChat}
            activeOpacity={0.7}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="h-[1px] bg-zinc-800 mb-4" />

        <Text className="text-base font-medium text-zinc-400 mb-3">Chat History</Text>
      </View>

      {filteredSessions.length === 0 ? (
        <View className="items-center justify-center py-6">
          <MessageSquare size={24} color="#a1a1aa" />
          <Text className="text-zinc-400 mt-2">No matching chats found</Text>
        </View>
      ) : (
        <FlashList
          data={filteredSessions}
          estimatedItemSize={100}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                className="flex-1 py-3 px-3 bg-zinc-800 rounded-lg"
                onPress={() => handleChatSelect(item.id)}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium mb-1" numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                  <Text className="text-zinc-400 text-xs">
                    {formatDate(item.updatedAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 ml-2"
                onPress={() => handleDeleteChat(item.id, item.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={16} color="#a1a1aa" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatHistoryDrawer;
