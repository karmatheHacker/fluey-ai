import React, { useEffect, useRef } from 'react';
import { TextStyle, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface AnimatedWordProps {
  word: string;
  index: number;
  currentIndex: Animated.SharedValue<number>;
  style?: TextStyle;
  isLast: boolean;
}

const AnimatedWord: React.FC<AnimatedWordProps> = ({
  word,
  index,
  currentIndex,
  style,
  isLast,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: currentIndex.value >= index ? withTiming(1, { duration: 250 }) : 0,
  })) as TextStyle;

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {word + (isLast ? '' : ' ')}
    </Animated.Text>
  );
};

interface TypewriterTextProps {
  text: string | undefined | null;
  durationPerWord?: number; // ms per word
  style?: TextStyle;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  durationPerWord = 80,
  style,
}) => {
  const safeText = typeof text === 'string' ? text : '';
  const words = safeText.split(' ');
  
  // Create a single shared value for the current word index
  const currentWordIndex = useSharedValue(-1);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Reset the animation
    currentWordIndex.value = -1;

    // Start the animation
    words.forEach((_, i) => {
      const timeout = setTimeout(() => {
        currentWordIndex.value = i;
      }, i * durationPerWord);
      timeoutsRef.current.push(timeout);
    });

    // Cleanup
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
      currentWordIndex.value = -1;
    };
  }, [safeText, durationPerWord, words.length]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {words.map((word, i) => (
        <AnimatedWord
          key={i}
          word={word}
          index={i}
          currentIndex={currentWordIndex}
          style={style}
          isLast={i === words.length - 1}
        />
      ))}
    </View>
  );
};