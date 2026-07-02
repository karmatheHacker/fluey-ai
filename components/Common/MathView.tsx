import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import NativeMathView from 'react-native-math-view';

type MathViewProps = {
  math: string;
  style?: StyleProp<TextStyle | ViewStyle>;
};

export default NativeMathView as ComponentType<MathViewProps>;
