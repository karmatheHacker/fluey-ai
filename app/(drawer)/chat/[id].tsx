import ChatMessages from '@/components/Chat/ChatMessages';
import { TypewriterText } from '@/components/Chat/TypewriterText';
import CustomBottomSheet from '@/components/Common/BottomSheet';
import HamburgerMenu from '@/components/Common/HamburgerMenu';
import ChatInput from '@/components/Home/ChatInput';
import { useChatSession } from '@/hooks/useChatSession';
import { Message } from '@/types/chat';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { DrawerNavigationProp } from 'expo-router/build/react-navigation/drawer';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Menu } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedScreenContainer } from '../_layout';


const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inputText, setInputText] = useState("");
  const listRef = useRef<FlashList<Message>>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [forceNextFail, setForceNextFail] = useState(false);

  // Use our new chat session hook to manage all chat state
  const {
    session,
    messages,
    isStreaming,
    sendMessage,
    deleteSession,
    toggleUseApiResponse,
    useApiResponse,
    handleRetry,
    isGeneratingTitle,
    tempTitle
  } = useChatSession(id);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 10);
    }
  }, [messages.length]);

  const handleSubmit = useCallback(async () => {
    if (inputText.trim() && !isStreaming) {
      setInputText('');
      const success = await sendMessage(inputText.trim(), forceNextFail);
      if (success) {
        Keyboard.dismiss();
        if (forceNextFail) setForceNextFail(false);
      }
    }
  }, [sendMessage, forceNextFail, inputText, isStreaming]);

  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  // Add a dedicated effect to handle scrolling during streaming
  useEffect(() => {
    // Check if any message is currently streaming
    const streamingMessage = messages.find(msg => msg.isStreaming);

    if (streamingMessage && listRef.current) {
      // Create an interval to scroll while streaming is active
      const scrollInterval = setInterval(() => {
        if (listRef.current) {
          listRef.current.scrollToEnd({ animated: false });
        }
      }, 300); // Check every 300ms

      // Clean up interval when streaming stops
      return () => clearInterval(scrollInterval);
    }
  }, [messages, listRef]);

  const toggleBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      Keyboard.dismiss();
      bottomSheetModalRef.current.present();
    }
  }, []);

  const handleDeleteChat = useCallback(() => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = deleteSession();
            if (success) {
              navigation.navigate('index');
            }
          },
        },
      ]
    );
  }, [deleteSession]);
  const openDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  // If session doesn't exist, return to home
  useEffect(() => {
    if (!session && id) {
      navigation.navigate('index');
    }
  }, [session, id, navigation]);

  if (!session) {
    return null;
  }

  return (
    <AnimatedScreenContainer>
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 bg-zinc-900"
      >
        <SafeAreaView className="flex-1 bg-zinc-900">
          <KeyboardAvoidingView className="flex-1" behavior="padding">
            <StatusBar style="light" />
            <View className="flex-row justify-between items-center p-4 pb-2  mb-2">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={openDrawer}
                  className="mr-3"
                >
                  <Menu color="white" size={24} />
                </TouchableOpacity>
                {isGeneratingTitle ? (
                  <TypewriterText
                    text={tempTitle || session.title}
                    style={{ color: 'white', fontWeight: '500', fontSize: 18 }}
                    durationPerWord={80}
                  />
                ) : (
                  <Text className="text-white text-lg font-medium" numberOfLines={1} ellipsizeMode="tail">
                    {session.title}
                  </Text>
                )}
              </View>
              <View className="flex-row">
                <TouchableOpacity onPress={toggleBottomSheet}>
                  <HamburgerMenu onPress={toggleBottomSheet} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1" style={{ flex: 1 }}>
              <ChatMessages
                messages={messages}
                onRetry={handleRetry}
                isStreaming={isStreaming}
              />
              <ChatInput
                inputText={inputText}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                disabled={isStreaming}
              />
            </View>
          </KeyboardAvoidingView>
          <CustomBottomSheet
            bottomSheetModalRef={bottomSheetModalRef}
            useApiResponse={useApiResponse}
            toggleUseApiResponse={toggleUseApiResponse}
            deleteChat={handleDeleteChat}
            forceNextFail={forceNextFail}
            setForceNextFail={setForceNextFail}
          />
        </SafeAreaView>
      </Animated.View>
    </AnimatedScreenContainer>
  );
}

export default ChatScreen;
