import { Tabs } from 'expo-router/tabs';
import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../lib/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTitleStyle: { color: t.text, fontWeight: '800' },
        headerShadowVisible: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
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
