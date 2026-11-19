import { useColorScheme } from 'react-native';
import type { Status } from './store';

const light = {
  bg: '#F7F4EF',
  card: '#FFFFFF',
  text: '#1F1A17',
  muted: '#6F6660',
  border: '#E8E1D8',
  primary: '#E8742C',
  primaryText: '#FFFFFF',
  primarySoft: '#FCE7D8',
  success: '#2F9E62',
  successSoft: '#DDF3E6',
  danger: '#D2483E',
  dangerSoft: '#F9DEDB',
  track: '#EFE9E1',
};

const dark: typeof light = {
  bg: '#141210',
  card: '#1F1C19',
  text: '#F4EFEA',
  muted: '#A69C93',
  border: '#332E29',
  primary: '#F08A45',
  primaryText: '#1A1208',
  primarySoft: '#3A2617',
  success: '#4CC27F',
  successSoft: '#173323',
  danger: '#EF6A5F',
  dangerSoft: '#3A1C19',
  track: '#2A2622',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export function statusColor(t: Theme, s: Status) {
  switch (s) {
    case 'mastered':
      return { fg: t.success, bg: t.successSoft };
    case 'reliable':
      return { fg: '#3B82C4', bg: t === dark ? '#16263A' : '#DCEAF7' };
    case 'learning':
      return { fg: t.primary, bg: t.primarySoft };
    default:
      return { fg: t.muted, bg: t.track };
  }
}
