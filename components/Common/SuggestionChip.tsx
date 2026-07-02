import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface SuggestionChipProps {
    icon: any;
    text: string;
    onPress?: () => void;
}

const SuggestionChip = ({ icon: Icon, text, onPress }: SuggestionChipProps) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
        opacity.value = withSpring(0.8);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
    };

    return (
        <Animated.View style={animatedStyle}>
            <AnimatedTouchableOpacity
                className="bg-zinc-700 p-3 rounded-full flex-row items-center mr-2 mb-2"
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Icon color="white" size={18} className="mr-2" />
                <Text className="text-white ml-1 text-sm">{text}</Text>
            </AnimatedTouchableOpacity>
        </Animated.View>
    );
};

export default SuggestionChip