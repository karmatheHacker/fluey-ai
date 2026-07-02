import { Message } from '@/types/chat';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { MessageItem } from './MessageItem';

interface ChatMessagesProps {
  messages: Message[];
  onRetry: (id: string) => void;
  isStreaming: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  onRetry,
  isStreaming
}) => {
  const listRef = useRef<FlashList<Message>>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 10);
    }
  }, [messages.length]);

  // Handle scrolling during streaming
  useEffect(() => {
    if (isStreaming && messages.length > 0) {
      const scrollInterval = setInterval(() => {
        if (listRef.current) {
          listRef.current.scrollToEnd({ animated: false });
        }
      }, 300);
      return () => clearInterval(scrollInterval);
    }
  }, [isStreaming, messages.length]);

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <MessageItem message={item} onRetry={onRetry} />
          </View>
        )}
        onContentSizeChange={() => {
          if (messages.length > 0 && listRef.current) {
            listRef.current.scrollToEnd({ animated: !isStreaming });
          }
        }}
        estimatedItemSize={100}
        showsVerticalScrollIndicator={false}
        estimatedListSize={{ height: 500, width: 400 }}
        className="flex-1"
        drawDistance={200}
        overrideItemLayout={(layout, item) => {
          if (item.isUser) {
            layout.size = Math.max(50, (item.text?.length || 0) / 5);
          } else if (item.isStreaming) {
            layout.size = 80;
          } else {
            layout.size = Math.max(80, (item.text?.length || 0) / 3);
          }
        }}
        viewabilityConfig={{
          minimumViewTime: 100,
          viewAreaCoveragePercentThreshold: 20,
        }}
        initialScrollIndex={messages.length > 0 ? messages.length - 1 : undefined}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />
    </View>
  );
};

export default ChatMessages;