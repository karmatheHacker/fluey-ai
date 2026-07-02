import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';

type MathViewProps = {
  math: string;
  style?: StyleProp<TextStyle>;
};

export default function MathView({ math, style }: MathViewProps) {
  return <Text selectable style={style}>{math}</Text>;
}
