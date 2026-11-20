import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  type PressableProps,
  type ScrollViewProps,
} from 'react-native';
import { STATUS_LABEL, type Status } from '../lib/store';
import { statusColor, useTheme } from '../lib/theme';
import { sz } from '../lib/scale';

export function Screen({ children, contentContainerStyle, ...rest }: ScrollViewProps) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[{ padding: sz(16), paddingBottom: sz(40), gap: sz(16) }, contentContainerStyle]}
      contentInsetAdjustmentBehavior="automatic"
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View
      style={[
        { backgroundColor: t.card, borderRadius: sz(16), padding: sz(16), borderWidth: StyleSheet.hairlineWidth, borderColor: t.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function H1({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[{ fontSize: sz(28), fontWeight: '800', color: t.text }, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[{ fontSize: sz(18), fontWeight: '700', color: t.text }, style]}>{children}</Text>;
}

export function Body({ children, style, muted }: { children: React.ReactNode; style?: TextStyle; muted?: boolean }) {
  const t = useTheme();
  return <Text style={[{ fontSize: sz(15), lineHeight: sz(21), color: muted ? t.muted : t.text }, style]}>{children}</Text>;
}

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: ViewStyle;
  big?: boolean;
};

export function Button({ title, variant = 'primary', style, big, disabled, ...rest }: ButtonProps) {
  const t = useTheme();
  const palette = {
    primary: { bg: t.primary, fg: t.primaryText, border: t.primary },
    secondary: { bg: t.card, fg: t.text, border: t.border },
    danger: { bg: t.dangerSoft, fg: t.danger, border: t.dangerSoft },
    ghost: { bg: 'transparent', fg: t.primary, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: sz(14),
          paddingVertical: sz(big ? 16 : 12),
          paddingHorizontal: sz(18),
          alignItems: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={{ color: palette.fg, fontWeight: '700', fontSize: sz(big ? 17 : 15) }}>{title}</Text>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const t = useTheme();
  const c = statusColor(t, status);
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: sz(10), paddingVertical: sz(4), borderRadius: sz(999) }}>
      <Text style={{ color: c.fg, fontSize: sz(12), fontWeight: '700' }}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        backgroundColor: active ? t.primary : t.card,
        borderColor: active ? t.primary : t.border,
        borderWidth: 1,
        paddingHorizontal: sz(14),
        paddingVertical: sz(8),
        borderRadius: sz(999),
      }}
    >
      <Text style={{ color: active ? t.primaryText : t.text, fontWeight: '600', fontSize: sz(14) }}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ height: sz(8), borderRadius: sz(4), backgroundColor: t.track, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? t.primary, borderRadius: sz(4) }} />
    </View>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: sz(24), fontWeight: '800', color: t.text }}>{value}</Text>
      <Text style={{ fontSize: sz(12), color: t.muted, marginTop: sz(2) }}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: sz(12) }, style]}>{children}</View>;
}
