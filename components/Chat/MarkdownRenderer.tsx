import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import MathView from '@/components/Common/MathView';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

interface MarkdownRendererProps {
    content: string;
}

const AnimatedBlock: React.FC<{
    index: number,
    currentIndex: Animated.SharedValue<number>,
    blockType?: string,
    children: React.ReactNode,
    key?: string
}> = ({ index, currentIndex, blockType = 'default', children }) => {
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.95);

    const getAnimationDuration = () => {
        'worklet';
        switch (blockType) {
            case 'heading': return 300;
            case 'list': return 200;
            case 'code': return 250;
            default: return 150;
        }
    };

    const getAnimationDelay = () => {
        'worklet';
        switch (blockType) {
            case 'list': return index * 100;
            case 'code': return 150;
            default: return 0;
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        const isVisible = currentIndex.value >= index;
        const duration = getAnimationDuration();
        const delay = getAnimationDelay();

        return {
            opacity: withTiming(isVisible ? 1 : 0, { duration }),
            transform: [
                { translateY: withDelay(delay, withTiming(isVisible ? 0 : translateY.value, { duration })) },
                { scale: withDelay(delay, withTiming(isVisible ? 1 : scale.value, { duration })) }
            ]
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const { colors } = useTheme();
    const currentBlockIndex = useSharedValue(-1);
    const blockTimeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
    const BLOCK_DELAY = 80; // Slightly faster base delay for smoother experience

    useEffect(() => {
        // Reset animation when content changes
        currentBlockIndex.value = -1;
        blockTimeoutsRef.current.forEach(clearTimeout);
        blockTimeoutsRef.current = [];

        // Start animation
        const blocks = content.split('\n\n');
        blocks.forEach((_, i) => {
            const timeout = setTimeout(() => {
                currentBlockIndex.value = i;
            }, i * BLOCK_DELAY);
            blockTimeoutsRef.current.push(timeout);
        });

        return () => {
            blockTimeoutsRef.current.forEach(clearTimeout);
            blockTimeoutsRef.current = [];
        };
    }, [content]);

    const markdownStyles = StyleSheet.create({
        // The main container
        body: {
            color: colors.text,
            backgroundColor: 'transparent',
        },

        // Headings
        heading1: {
            color: colors.text,
            fontSize: 32,
            fontWeight: 'bold',
            marginTop: 20,
            marginBottom: 10,
            lineHeight: 40,
        },
        heading2: {
            color: colors.text,
            fontSize: 28,
            fontWeight: 'bold',
            marginTop: 16,
            marginBottom: 8,
            lineHeight: 36,
        },
        heading3: {
            color: colors.text,
            fontSize: 24,
            fontWeight: 'bold',
            marginTop: 16,
            marginBottom: 8,
            lineHeight: 32,
        },
        heading4: {
            color: colors.text,
            fontSize: 20,
            fontWeight: 'bold',
            marginTop: 14,
            marginBottom: 8,
            lineHeight: 28,
        },
        heading5: {
            color: colors.text,
            fontSize: 18,
            fontWeight: 'bold',
            marginTop: 12,
            marginBottom: 8,
            lineHeight: 26,
        },
        heading6: {
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            marginTop: 12,
            marginBottom: 8,
            lineHeight: 24,
        },

        // Horizontal Rule
        hr: {
            backgroundColor: colors.text,
            height: 1,
            marginVertical: 8,
        },

        // Emphasis
        strong: {
            fontWeight: 'bold',
            color: colors.text,
        },
        em: {
            fontStyle: 'italic',
            color: colors.text,
        },
        s: {
            textDecorationLine: 'line-through',
            color: colors.text,
        },

        // Blockquotes
        blockquote: {
            backgroundColor: '#1a1a1a',
            borderColor: colors.text,
            borderLeftWidth: 4,
            marginLeft: 5,
            paddingHorizontal: 5,
            marginVertical: 8,
        },

        // Lists
        bullet_list: {
            marginVertical: 8,
        },
        ordered_list: {
            marginVertical: 8,
            paddingLeft: 20,
        },
        list_item: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginVertical: 4,
        },
        bullet_list_icon: {
            marginLeft: 10,
            marginRight: 10,
            color: colors.text,
            lineHeight: 24,
        },
        bullet_list_content: {
            flex: 1,
        },
        ordered_list_icon: {
            color: colors.text,
            fontWeight: '400',
            marginRight: 8,
            fontSize: 16,
            lineHeight: 24,
        },
        ordered_list_content: {
            color: colors.text,
            flex: 1,
            fontSize: 16,
            lineHeight: 24,
        },

        // Code
        code_inline: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },
        code_block: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },
        fence: {
            backgroundColor: '#1a1a1a',
            color: colors.codeText,
            padding: 12,
            borderRadius: 8,
            marginVertical: 8,
            ...Platform.select({
                ios: {
                    fontFamily: 'Courier',
                },
                android: {
                    fontFamily: 'monospace',
                },
            }),
        },

        // Tables
        table: {
            borderWidth: 1,
            borderColor: colors.text,
            borderRadius: 3,
            marginVertical: 8,
        },
        thead: {},
        tbody: {},
        th: {
            flex: 1,
            padding: 5,
            color: colors.text,
            fontWeight: 'bold',
        },
        tr: {
            borderBottomWidth: 1,
            borderColor: colors.text,
            flexDirection: 'row',
        },
        td: {
            flex: 1,
            padding: 5,
            color: colors.text,
        },

        // Links
        link: {
            textDecorationLine: 'underline',
            color: colors.text,
        },
        blocklink: {
            flex: 1,
            borderColor: colors.text,
            borderBottomWidth: 1,
        },

        // Images
        image: {
            flex: 1,
        },

        // Text Output
        text: {
            color: colors.text,
            fontSize: 16,
            lineHeight: 24,
        },
        textgroup: {},
        paragraph: {
            marginTop: 10,
            marginBottom: 10,
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
        },
        hardbreak: {
            width: '100%',
            height: 1,
        },
        softbreak: {},

        // Math container
        mathContainer: {
            marginVertical: 8,
            alignItems: 'center',
            backgroundColor: 'transparent',
            color: "white",
        },
    });

    return (
        <Markdown
            style={markdownStyles}
            mergeStyle={true}
            rules={{
                text: (node, children, parent, styles) => {
                    // Render inline math within text
                    const regex = /\$(.+?)\$/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    while ((match = regex.exec(node.content)) !== null) {
                        if (match.index > lastIndex) {
                            parts.push(
                                <Text
                                    key={`text-${node.key}-${lastIndex}-${match.index}`}
                                    style={styles.text}
                                >
                                    {node.content.slice(lastIndex, match.index)}
                                </Text>
                            );
                        }
                        parts.push(
                            <MathView
                                key={`math-inline-${node.key}-${match.index}`}
                                math={match[1]}
                                style={{ marginHorizontal: 2, color: 'white' }}
                            />
                        );
                        lastIndex = match.index + match[0].length;
                    }
                    if (lastIndex < node.content.length) {
                        parts.push(
                            <Text
                                key={`text-${node.key}-${lastIndex}-end`}
                                style={styles.text}
                            >
                                {node.content.slice(lastIndex)}
                            </Text>
                        );
                    }
                    if (parts.length > 0) {
                        return <Text key={`container-${node.key}`} style={styles.text}>{parts}</Text>;
                    }
                    // Default text rendering
                    return <Text key={`text-${node.key}`} style={styles.text}>{node.content}</Text>;
                },
                paragraph: (node, children, parent, styles) => {
                    const blockIndex = node.index || 0;

                    // Handle block math
                    const blockMathMatch = node.content?.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/m);
                    if (blockMathMatch) {
                        return (
                            <AnimatedBlock index={blockIndex} currentIndex={currentBlockIndex}>
                                <View key={`math-block-${node.key}`} style={markdownStyles.mathContainer}>
                                    <MathView math={blockMathMatch[1]} style={{ marginVertical: 4, color: 'white' }} />
                                </View>
                            </AnimatedBlock>
                        );
                    }

                    return (
                        <AnimatedBlock index={blockIndex} currentIndex={currentBlockIndex}>
                            <View key={`paragraph-${node.key}`} style={styles.paragraph}>
                                <Text style={styles.text}>{children}</Text>
                            </View>
                        </AnimatedBlock>
                    );
                },
                strong: (node, children, parent, styles) => (
                    <Text key={`strong-${node.key}`} style={[styles.text, styles.strong]}>{children}</Text>
                ),
                em: (node, children, parent, styles) => (
                    <Text key={`em-${node.key}`} style={[styles.text, styles.em]}>{children}</Text>
                ),
                s: (node, children, parent, styles) => (
                    <Text key={`s-${node.key}`} style={[styles.text, styles.s]}>{children}</Text>
                ),
                code_inline: (node, children, parent, styles) => (
                    <Text key={`code-inline-${node.key}`} style={[styles.text, styles.code_inline]}>{node.content}</Text>
                ),
                code_block: (node, children, parent, styles) => (
                    <Text
                        key={`code-block-${node.key}`}
                        className='text-base'
                        style={[styles.code_block]}
                    >
                        {node.content}
                    </Text>
                ),
                heading1: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading1-${node.key}`} style={styles.heading1}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                heading2: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading2-${node.key}`} style={styles.heading2}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                heading3: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading3-${node.key}`} style={styles.heading3}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                heading4: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading4-${node.key}`} style={styles.heading4}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                heading5: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading5-${node.key}`} style={styles.heading5}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                heading6: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <Text key={`heading6-${node.key}`} style={styles.heading6}>
                            {children}
                        </Text>
                    </AnimatedBlock>
                ),
                blockquote: (node, children, parent, styles) => (
                    <AnimatedBlock index={node.index || 0} currentIndex={currentBlockIndex}>
                        <View key={`blockquote-${node.key}`} style={styles.blockquote}>
                            {children}
                        </View>
                    </AnimatedBlock>
                ),
                bullet_list: (node, children, parent, styles) => (
                    <AnimatedBlock key={`bullet-block-${node.key}`} index={node.index || 0} currentIndex={currentBlockIndex} blockType="list">
                        <View style={styles.bullet_list}>
                            {React.Children.map(children, (child, index) =>
                                React.cloneElement(child as React.ReactElement, {
                                    key: `bullet-item-${node.key}-${index}`,
                                    index
                                })
                            )}
                        </View>
                    </AnimatedBlock>
                ),
                ordered_list: (node, children, parent, styles) => (
                    <AnimatedBlock key={`ordered-block-${node.key}`} index={node.index || 0} currentIndex={currentBlockIndex} blockType="list">
                        <View style={styles.ordered_list}>
                            {React.Children.map(children, (child, index) =>
                                React.cloneElement(child as React.ReactElement, {
                                    key: `ordered-item-${node.key}-${index}`,
                                    index
                                })
                            )}
                        </View>
                    </AnimatedBlock>
                ),
                list_item: (node, children, parent, styles) => (
                    <View key={`list-item-${node.key}`} style={styles.list_item}>
                        {React.Children.map(children, (child, index) =>
                            React.cloneElement(child as React.ReactElement, {
                                key: `list-content-${node.key}-${index}`
                            })
                        )}
                    </View>
                ),
                bullet_list_icon: (node, children, parent, styles) => (
                    <Text key={`bullet-icon-${node.key}`} style={styles.bullet_list_icon}>•</Text>
                ),
                ordered_list_item: (node, children, parent, styles) => (
                    <View key={`ordered-list-item-${node.key}`} style={styles.list_item}>
                        <Text style={styles.ordered_list_icon}>{`${node.index + 1}.`}</Text>
                        <View style={styles.ordered_list_content}>
                            {children}
                        </View>
                    </View>
                ),
                link: (node, children, parent, styles) => (
                    <Text key={`link-${node.key}`} style={styles.link}>{children}</Text>
                ),
                hr: (node, children, parent, styles) => (
                    <View key={`hr-${node.key}`} style={styles.hr} />
                ),
            }}
        >
            {content}
        </Markdown>
    );
};
