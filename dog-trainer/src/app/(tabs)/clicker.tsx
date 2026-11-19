import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Body, Card, Row } from '../../components/ui';
import { useClicker } from '../../lib/clicker';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

/** A free-standing clicker for ad-hoc training, walks, or capturing good behaviour. */
export default function Clicker() {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const click = useClicker();
  const [count, setCount] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, padding: 16, gap: 16 }}>
      <Body muted style={{ textAlign: 'center' }}>
        Click the instant your dog does the right thing, then reward. Use it to capture good behaviour anytime.
      </Body>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <Pressable
          onPress={() => {
            click();
            setCount((c) => c + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Clicker"
          style={({ pressed }) => ({
            width: 260,
            height: 260,
            borderRadius: 130,
            backgroundColor: t.primary,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.93 : 1 }],
            borderWidth: 10,
            borderColor: t.primarySoft,
          })}
        >
          <Text style={{ fontSize: 64 }}>🐾</Text>
          <Text style={{ color: t.primaryText, fontSize: 28, fontWeight: '900', letterSpacing: 3 }}>CLICK</Text>
        </Pressable>
        <Pressable onLongPress={() => setCount(0)} hitSlop={10}>
          <Text style={{ color: t.text, fontSize: 40, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
            {count}
          </Text>
          <Text style={{ color: t.muted, fontSize: 12, textAlign: 'center' }}>clicks · long-press to reset</Text>
        </Pressable>
      </View>

      <Card style={{ gap: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body>🔊 Click sound</Body>
          <Switch
            value={state.settings.sound}
            onValueChange={(v) => dispatch({ type: 'updateSettings', patch: { sound: v } })}
            trackColor={{ true: t.primary }}
          />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Body>📳 Vibration</Body>
          <Switch
            value={state.settings.haptics}
            onValueChange={(v) => dispatch({ type: 'updateSettings', patch: { haptics: v } })}
            trackColor={{ true: t.primary }}
          />
        </Row>
      </Card>
    </View>
  );
}
