declare module 'react-native-math-view' {
    import { ViewProps, TextStyle, ViewStyle } from 'react-native';

    interface MathViewProps extends ViewProps {
        math: string;
        style?: ViewStyle | TextStyle | {
            color?: string;
            backgroundColor?: string;
            [key: string]: any;
        };
    }

    const MathView: React.FC<MathViewProps>;
    export default MathView;
}