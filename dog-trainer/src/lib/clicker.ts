import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useStore } from './store';

const CLICK = require('../../assets/sounds/click.wav');

/** Returns a function that fires the training "click" (sound + haptic, per settings). */
export function useClicker() {
  const { state } = useStore();
  const player = useAudioPlayer(CLICK);
  const { sound, haptics } = state.settings;

  return useCallback(() => {
    if (sound) {
      try {
        player.seekTo(0);
        player.play();
      } catch {}
    }
    if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  }, [player, sound, haptics]);
}

export function tapFeedback(enabled: boolean) {
  if (enabled && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}
