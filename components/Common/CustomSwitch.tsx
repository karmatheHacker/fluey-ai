import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withRepeat,
  Easing,
  useSharedValue,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  isLoading?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value,
  onValueChange,
  activeColor = '#007AFF',
  inactiveColor = '#3e3e3e',
  thumbColor = '#f4f3f4',
  isLoading = false,
}) => {
  const progress = useDerivedValue(() => 
    withTiming(value ? 1 : 0, {
      duration: 200,
      easing: Easing.linear
    })
  );

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(
        withTiming(1, {
          duration: 800,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [isLoading]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [inactiveColor, activeColor]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(progress.value * 20, {
          duration: 150,
          easing: Easing.linear
        }),
      },
    ],
  }));

  const spinnerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(rotation.value, [0, 1], [0, 360])}deg` }
      ],
    };
  });

  return (
    <Pressable onPress={() => !isLoading && onValueChange(!value)}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle, { backgroundColor: thumbColor }]}>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
                <Svg width="14" height="14" viewBox="0 0 14 14">
                  <Circle 
                    cx="7" 
                    cy="7" 
                    r="5" 
                    stroke={value ? activeColor : '#d3d3d3'} 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="12 20"
                    fill="none"
                  />
                </Svg>
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    width: 14,
    height: 14,
    position: 'relative',
  },
});

export default CustomSwitch;