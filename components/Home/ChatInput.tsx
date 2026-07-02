import {
    Mic,
    Plus,
    Send
} from "lucide-react-native";
import React from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    WithSpringConfig,
    withTiming
} from "react-native-reanimated";

interface ChatInputProps {
    inputText: string;
    onInputChange: (text: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
}

const MIN_HEIGHT = 50;
const MAX_HEIGHT = 120;
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const springConfig: WithSpringConfig = {
    damping: 15,
    stiffness: 100,
    mass: 0.8,
};

const ChatInput: React.FC<ChatInputProps> = ({
    inputText,
    onInputChange,
    onSubmit,
    disabled
}) => {
    const heightAnimation = useSharedValue(MIN_HEIGHT);
    const isFocused = useSharedValue(0);
    const scale = useSharedValue(1);

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });
    const inputStyle = useAnimatedStyle(() => {
        return {
            height: withSpring(heightAnimation.value, springConfig),
            minHeight: MIN_HEIGHT,
            maxHeight: MAX_HEIGHT,
        };
    });

    const handleFocus = () => {
        isFocused.value = withTiming(1, {
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        scale.value = withSpring(1.02);
    };

    const handleBlur = () => {
        isFocused.value = withTiming(0, {
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        scale.value = withSpring(1);
    };


    return (
        <View className="bg-zinc-900">
            <View className={`px-4 pt-2 pb-${Platform.OS === 'ios' ? '6' : '2'}`}>
                <Animated.View
                    style={[containerStyle]}
                    className="flex-row items-center bg-[#232329] rounded-3xl px-3 py-1.5"
                >
                    <TouchableOpacity className="p-1.5 mr-0.5">
                        <Plus color="#a1a1aa" size={22} />
                    </TouchableOpacity>

                    <AnimatedTextInput
                        className="flex-1 text-white text-lg mr-2"
                        style={inputStyle}
                        placeholder="Ask anything"
                        placeholderTextColor="#a1a1aa"
                        value={inputText}
                        onChangeText={onInputChange}
                        onSubmitEditing={onSubmit}
                        editable={!disabled}
                        cursorColor="#fff"
                        keyboardAppearance="dark"
                        returnKeyType="send"
                        enablesReturnKeyAutomatically
                        multiline
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onContentSizeChange={e => {
                            const height = Math.min(
                                Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height),
                                MAX_HEIGHT
                            );
                            heightAnimation.value = height;
                        }}
                    />

                    <TouchableOpacity className="p-1.5 mr-0.5">
                        <Mic color="#a1a1aa" size={22} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onSubmit}
                        disabled={disabled || !inputText.trim()}
                        className={`p-2 mr-1 ${(disabled || !inputText.trim()) ? 'opacity-50' : ''}`}
                    >
                        <Send color="white" size={24} />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

export default ChatInput;