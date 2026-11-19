import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

export type Status = 'new' | 'learning' | 'reliable' | 'mastered';

export const STATUS_LABEL: Record<Status, string> = {
  new: 'Not started',
  learning: 'Learning',
  reliable: 'Reliable',
  mastered: 'Mastered',
};

export const STATUS_ORDER: Status[] = ['new', 'learning', 'reliable', 'mastered'];

export type Dog = {
  id: string;
  name: string;
  breed: string;
  emoji: string;
  createdAt: number;
};

export type SkillProgress = {
  status: Status;
  /** Index of the step the dog is currently working on. */
  step: number;
};

export type Session = {
  id: string;
  dogId: string;
  skillId: string;
  startedAt: number;
  durationSec: number;
  successes: number;
  misses: number;
  note: string;
};

export type Settings = {
  sound: boolean;
  haptics: boolean;
  /** Daily goal in minutes. */
  dailyGoalMin: number;
};

export type State = {
  version: 1;
  dogs: Dog[];
  activeDogId: string | null;
  progress: Record<string, Record<string, SkillProgress>>;
  sessions: Session[];
  settings: Settings;
};

const initialState: State = {
  version: 1,
  dogs: [],
  activeDogId: null,
  progress: {},
  sessions: [],
  settings: { sound: true, haptics: true, dailyGoalMin: 10 },
};

type Action =
  | { type: 'hydrate'; state: State }
  | { type: 'addDog'; dog: Dog }
  | { type: 'updateDog'; dog: Dog }
  | { type: 'removeDog'; id: string }
  | { type: 'setActiveDog'; id: string }
  | { type: 'setProgress'; dogId: string; skillId: string; patch: Partial<SkillProgress> }
  | { type: 'addSession'; session: Session }
  | { type: 'removeSession'; id: string }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'addDog':
      return { ...state, dogs: [...state.dogs, action.dog], activeDogId: action.dog.id };
    case 'updateDog':
      return { ...state, dogs: state.dogs.map((d) => (d.id === action.dog.id ? action.dog : d)) };
    case 'removeDog': {
      const dogs = state.dogs.filter((d) => d.id !== action.id);
      const { [action.id]: _removed, ...progress } = state.progress;
      return {
        ...state,
        dogs,
        progress,
        sessions: state.sessions.filter((s) => s.dogId !== action.id),
        activeDogId: state.activeDogId === action.id ? (dogs[0]?.id ?? null) : state.activeDogId,
      };
    }
    case 'setActiveDog':
      return { ...state, activeDogId: action.id };
    case 'setProgress': {
      const dogProgress = state.progress[action.dogId] ?? {};
      const current = dogProgress[action.skillId] ?? { status: 'new', step: 0 };
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.dogId]: { ...dogProgress, [action.skillId]: { ...current, ...action.patch } },
        },
      };
    }
    case 'addSession': {
      // Starting a session on a new skill moves it to "learning".
      const { dogId, skillId } = action.session;
      const current = state.progress[dogId]?.[skillId];
      const withSession = { ...state, sessions: [action.session, ...state.sessions] };
      if (!current || current.status === 'new') {
        return reducer(withSession, { type: 'setProgress', dogId, skillId, patch: { status: 'learning' } });
      }
      return withSession;
    }
    case 'removeSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = 'pawsitive/state/v1';

type Ctx = {
  state: State;
  ready: boolean;
  dispatch: React.Dispatch<Action>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as State;
          dispatch({
            type: 'hydrate',
            state: { ...initialState, ...parsed, settings: { ...initialState.settings, ...parsed.settings } },
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useActiveDog() {
  const { state } = useStore();
  return state.dogs.find((d) => d.id === state.activeDogId) ?? null;
}

export function useSkillProgress(skillId: string): SkillProgress {
  const { state } = useStore();
  const dogId = state.activeDogId;
  return (dogId && state.progress[dogId]?.[skillId]) || { status: 'new', step: 0 };
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
