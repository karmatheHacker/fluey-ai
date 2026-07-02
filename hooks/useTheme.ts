import { useMemo } from 'react';

interface ThemeColors {
    text: string;
    codeBackground: string;
    codeText: string;
    mathBackground: string;
    mathText: string;
}

export const useTheme = () => {
    const colors = useMemo<ThemeColors>(() => ({
        text: '#FFFFFF',
        codeBackground: 'rgba(255, 255, 255, 0.1)',
        codeText: '#FFFFFF',
        mathBackground: 'rgba(255, 255, 255, 0.05)',
        mathText: '#FFFFFF',
    }), []);

    return { colors };
}; 