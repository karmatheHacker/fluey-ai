import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MarkdownRenderer } from '../components/Chat/MarkdownRenderer';


const MARKDOWN_EXAMPLES = [
  {
    label: 'Headings',
    content: `# Header 1\n## Header 2\n### Header 3\n#### Header 4\n##### Header 5\n###### Header 6`,
  },
  {
    label: 'Horizontal Rule',
    content: `---`,
  },
  {
    label: 'Paragraph, Bold, Italic, Strikethrough, Inline Code',
    content: `This is a paragraph with **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.`,
  },
  {
    label: 'Unordered List',
    content: `- Unordered item 1\n- Unordered item 2\n  - Nested item 2.1\n  - Nested item 2.2\n- Unordered item 3`,
  },
  {
    label: 'Ordered List',
    content: `1. Ordered item 1\n2. Ordered item 2\n   1. Nested ordered 2.1\n   2. Nested ordered 2.2\n3. Ordered item 3`,
  },
  {
    label: 'Blockquotes',
    content: `> Blockquote level 1\n>> Blockquote level 2`,
  },
  {
    label: 'Links and Images',
    content: `[Link to OpenAI](https://openai.com)\n\n![OpenAI Logo](https://openai.com/favicon.ico)`,
  },
  {
    label: 'Table',
    content: `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`,
  },
  {
    label: 'Indented Code Block',
    content: `    def my_function():\n        print(\"This is a code block.\")`,
  },
  {
    label: 'Fenced Code Block',
    content: '```python\ndef another_function():\n    return True\n```',
  },
  {
    label: 'Inline Math',
    content: 'Inline math: $E=mc^2$ and $a^2 + b^2 = c^2$',
  },
  {
    label: 'Block Math',
    content: '$$\n\\int_{a}^{b} x^2 dx\n$$',
  },
  {
    label: 'Mixed Formatting',
    content: 'Mixing **bold _italic_** and `inline code` in a sentence.',
  },
];

export default function MarkdownTestScreen() {


  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
       <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-800">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => router.back()}
                    >
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <Text className="text-white font-bold text-lg">Markdown Examples</Text>
                    </View>
                </View>
                <View className="w-10" />
            </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
    
        {MARKDOWN_EXAMPLES.map((example, idx) => (
          <View key={idx} style={{ marginBottom: 32 }}>
            <Text style={{ color: '#aaa', marginBottom: 4 }}>{example.label}</Text>
            <View style={{ borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, backgroundColor: '#111' }}>
              <MarkdownRenderer content={example.content} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
} 