import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore, type SyncStatus } from '../lib/store';
import { useTheme } from '../lib/theme';
import { sz } from '../lib/scale';

export const SYNC_COPY: Record<SyncStatus, { icon: string; title: string; detail: string }> = {
  local: {
    icon: '📱',
    title: 'Saved on this device',
    detail: 'Your dogs and sessions are stored on this phone only.',
  },
  connecting: {
    icon: '⏳',
    title: 'Connecting…',
    detail: 'Loading the shared training log.',
  },
  synced: {
    icon: '✅',
    title: 'Shared and up to date',
    detail: 'Everyone you share this page with sees the same dogs, sessions and progress. Changes show up for them straight away.',
  },
  offline: {
    icon: '⚠️',
    title: "Can't reach the shared log",
    detail: 'What you see may be out of date. Changes will be sent when the connection comes back.',
  },
  readonly: {
    icon: '👀',
    title: 'View only',
    detail: "You can see this dog's training but can't log sessions. Ask the owner to invite you by email as an Editor.",
  },
};

/** A dismissable message shown when a change couldn't be saved. */
export function SyncNotice() {
  const t = useTheme();
  const { notice, dismissNotice } = useStore();
  if (!notice) return null;
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: sz(12), right: sz(12), bottom: sz(96) }}>
      <Pressable
        onPress={dismissNotice}
        accessibilityRole="alert"
        style={{
          backgroundColor: t.text,
          borderRadius: sz(14),
          padding: sz(14),
          flexDirection: 'row',
          gap: sz(10),
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: sz(12),
          elevation: 6,
        }}
      >
        <Text style={{ flex: 1, color: t.bg, fontSize: sz(14), lineHeight: sz(20) }}>{notice}</Text>
        <Text style={{ color: t.bg, fontWeight: '800' }}>✕</Text>
      </Pressable>
    </View>
  );
}

/** A one-line warning for the Today screen when sharing isn't working normally. */
export function SyncWarning() {
  const t = useTheme();
  const { sync } = useStore();
  if (sync !== 'offline' && sync !== 'readonly') return null;
  const c = SYNC_COPY[sync];
  return (
    <View style={{ backgroundColor: t.dangerSoft, borderRadius: sz(12), padding: sz(12) }}>
      <Text style={{ color: t.text, fontSize: sz(14), lineHeight: sz(20) }}>
        {c.icon} <Text style={{ fontWeight: '700' }}>{c.title}.</Text> {c.detail}
      </Text>
    </View>
  );
}
