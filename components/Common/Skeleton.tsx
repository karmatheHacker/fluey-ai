import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: number | `${number}%`;
    height?: number;
    borderRadius?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
}) => {
    const translateX = useSharedValue(-100);

    React.useEffect(() => {
        translateX.value = withRepeat(
            withSequence(
                withTiming(-100, { duration: 0 }),
                withDelay(
                    500,
                    withTiming(100, { duration: 1000 })
                )
            ),
            -1
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const containerStyle: ViewStyle = {
        width,
        height,
        backgroundColor: '#2a2a2a',
        borderRadius,
        overflow: 'hidden',
    };

    return (
        <View style={containerStyle}>
            <Animated.View style={[
                {
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                },
                animatedStyle
            ]}>
                <LinearGradient
                    colors={['#2a2a2a', '#3a3a3a', '#2a2a2a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            </Animated.View>
        </View>
    );
};
