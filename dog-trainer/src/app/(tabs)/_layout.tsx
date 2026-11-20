import { Tabs } from 'expo-router/tabs';
import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../lib/theme';
import { sz } from '../../lib/scale';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: sz(22), lineHeight: sz(28), opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTitleStyle: { color: t.text, fontWeight: '800', fontSize: sz(20) },
        headerShadowVisible: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.border,
          height: sz(68) + insets.bottom,
          paddingTop: sz(4),
          paddingBottom: insets.bottom + sz(4),
        },
        tabBarLabelStyle: { fontSize: sz(11), lineHeight: sz(14) },
        tabBarIconStyle: { height: sz(28) },
        sceneStyle: { backgroundColor: t.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Today', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="skills"
        options={{ title: 'Skills', tabBarIcon: ({ focused }) => <TabIcon emoji="🎓" focused={focused} /> }}
      />
      <Tabs.Screen
        name="clicker"
        options={{ title: 'Clicker', tabBarIcon: ({ focused }) => <TabIcon emoji="🔘" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} /> }}
      />
      <Tabs.Screen
        name="dogs"
        options={{ title: 'Dogs', tabBarIcon: ({ focused }) => <TabIcon emoji="🐶" focused={focused} /> }}
      />
    </Tabs>
  );
}
