import { router } from 'expo-router';
import { ArrowLeft, Calculator } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MathView from '@/components/Common/MathView';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MathScreen() {

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
                        <Text className="text-white font-bold text-lg">Math Examples</Text>
                    </View>
                </View>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 p-4 bg-zinc-900">
                <View className="mb-6">
                    <Text className="text-white text-2xl font-bold mb-5">Math Examples</Text>

                    <View className="mb-6">
                        <Text className="text-white text-lg font-semibold mb-3">Inline Math Examples:</Text>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <Text className="text-white">
                                The quadratic formula is: {' '}
                                <MathView
                                    math="\color{white}{x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}}"
                                />
                            </Text>
                        </View>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <Text className="text-white">
                                Euler's identity: {' '}
                                <MathView
                                    math="\color{white}{e^{i\pi} + 1 = 0}"
                                />
                            </Text>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-white text-lg font-semibold mb-3">Block Math Examples:</Text>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <MathView
                                math="\color{white}{\int_{a}^{b} f(x) \, dx = F(b) - F(a)}"
                            />
                        </View>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <MathView
                                math="\color{white}{\sum_{i=1}^{n} i = \frac{n(n+1)}{2}}"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-white text-lg font-semibold mb-3">Complex Examples:</Text>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <MathView
                                math="\color{white}{\begin{pmatrix} a & b \\ c & d \end{pmatrix}}"
                            />
                        </View>
                        <View className="my-2 p-3 bg-zinc-800 rounded-lg">
                            <MathView
                                math="\color{white}{\lim_{x \to \infty} \left(1 + \frac{1}{x}\right)^x = e}"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
