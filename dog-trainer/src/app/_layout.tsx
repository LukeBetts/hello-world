import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, useWindowDimensions, View } from 'react-native';
import { ConfirmHost } from '../components/ConfirmDialog';
import { SyncNotice } from '../components/SyncBanner';
import { scaleFactor, sz } from '../lib/scale';
import { StoreProvider, useStore } from '../lib/store';
import { useTheme } from '../lib/theme';

function RootStack() {
  const t = useTheme();
  const { ready } = useStore();
  // Re-render everything at the new size if the screen width changes.
  useWindowDimensions();
  const scaleKey = Math.round(scaleFactor() * 100);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <ActivityIndicator color={t.primary} />
      </View>
    );
  }

  return (
    <Stack
      key={scaleKey}
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTintColor: t.primary,
        headerTitleStyle: { color: t.text, fontSize: sz(17) },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: t.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="skill/[id]" options={{ title: '' , headerBackTitle: 'Back' }} />
      <Stack.Screen
        name="session/[skillId]"
        options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="dog-edit" options={{ presentation: 'modal', title: 'Dog' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="auto" />
      <RootStack />
      <SyncNotice />
      <ConfirmHost />
    </StoreProvider>
  );
}
