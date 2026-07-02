import ChatHistoryDrawer from '@/components/Drawer/ChatHistoryDrawer';
import { useDrawerProgress } from 'expo-router/build/react-navigation/drawer';
import type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export function AnimatedScreenContainer({ children }: { children: React.ReactNode }) {
  const drawerProgress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      drawerProgress.value,
      [0, 1],
      [1, 0.95]
    );

    return {
      flex: 1,
      backgroundColor: '#18181b',
      borderRadius: interpolate(drawerProgress.value, [0, 1], [0, 10]),
      overflow: 'hidden',
      transform: [{ scale }],
      elevation: 5,
    };
  });

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: '#18181b' }, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
export default function DrawerLayout() {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  const onDrawerStateChanged = (isOpen: boolean) => {
    scale.value = withSpring(isOpen ? 0.9 : 1, {
      damping: 15,
      stiffness: 100
    });
  };


  return (
    <React.Fragment>
      <StatusBar style="light" backgroundColor="#18181b" />
      <Drawer
        defaultStatus="closed"
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: '#18181b',
            width: '80%',
          },
          drawerType: 'front',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          drawerContentStyle: {
            paddingTop: insets.top,
          },
          drawerActiveTintColor: '#ffffff',
          drawerInactiveTintColor: '#a1a1aa',
        }}
        drawerContent={(props: DrawerContentComponentProps) => (
          <ChatHistoryDrawer {...props} onDrawerStateChanged={onDrawerStateChanged} />
        )}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="chat/[id]"
          options={{
            title: 'Chat',
            drawerLabel: 'Chat',
          }}
        />
      </Drawer>
    </React.Fragment>
  );
}
