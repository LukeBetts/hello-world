import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../lib/theme';
import { Button } from './ui';

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
};

let show: ((o: ConfirmOptions) => void) | null = null;

/**
 * Ask the user to confirm a destructive action.
 * Uses the native alert on iOS/Android, and an in-app dialog on the web
 * (browser alert/confirm dialogs aren't always available).
 */
export function confirmAction(o: ConfirmOptions) {
  if (Platform.OS !== 'web') {
    Alert.alert(o.title, o.message, [
      { text: o.cancelText ?? 'Cancel', style: 'cancel' },
      { text: o.confirmText, style: 'destructive', onPress: o.onConfirm },
    ]);
    return;
  }
  show?.(o);
}

/** Mount once near the root of the app. Renders nothing on native. */
export function ConfirmHost() {
  const t = useTheme();
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    show = setOpts;
    return () => {
      show = null;
    };
  }, []);

  if (Platform.OS !== 'web' || !opts) return null;
  const close = () => setOpts(null);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={close}>
      <Pressable
        onPress={close}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          onPress={() => {}}
          style={{ width: '100%', maxWidth: 360, backgroundColor: t.card, borderRadius: 18, padding: 20, gap: 12 }}
        >
          <Text style={{ fontSize: 18, fontWeight: '800', color: t.text }}>{opts.title}</Text>
          {!!opts.message && <Text style={{ fontSize: 15, lineHeight: 21, color: t.muted }}>{opts.message}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Button title={opts.cancelText ?? 'Cancel'} variant="secondary" style={{ flex: 1 }} onPress={close} />
            <Button
              title={opts.confirmText}
              variant="danger"
              style={{ flex: 1 }}
              onPress={() => {
                close();
                opts.onConfirm();
              }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
