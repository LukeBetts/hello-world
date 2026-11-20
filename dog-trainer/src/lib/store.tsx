import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { connectCloud, type Cloud, type Remote } from './cloud';

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
  /** Who logged it (shared web version only). */
  by?: string;
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

/**
 * Where data is kept:
 * - local:      on this device only (native app, or the web page outside Claude)
 * - connecting: looking for shared data
 * - synced:     shared with everyone the page is shared with, up to date
 * - offline:    shared, but the latest data can't be reached right now
 * - readonly:   shared, but this person can only view
 */
export type SyncStatus = 'local' | 'connecting' | 'synced' | 'offline' | 'readonly';

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
  | { type: 'remote'; remote: Remote }
  | { type: 'addDog'; dog: Dog }
  | { type: 'updateDog'; dog: Dog }
  | { type: 'removeDog'; id: string }
  | { type: 'setActiveDog'; id: string }
  | { type: 'setProgress'; dogId: string; skillId: string; patch: Partial<SkillProgress> }
  | { type: 'addSession'; session: Session }
  | { type: 'removeSession'; id: string }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'reset' };

/** Actions that change shared data (and so need write access when synced). */
const SHARED_ACTIONS = new Set<Action['type']>(['addDog', 'updateDog', 'removeDog', 'setProgress', 'addSession', 'removeSession', 'reset']);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'remote': {
      const { dogs, sessions, progress } = action.remote;
      const activeDogId = dogs.some((d) => d.id === state.activeDogId) ? state.activeDogId : (dogs[0]?.id ?? null);
      return { ...state, dogs, sessions, progress, activeDogId };
    }
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
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
}

/** Send the difference between two states to the shared store. */
function syncDiff(cloud: Cloud, prev: State, next: State): Promise<unknown>[] {
  const ops: Promise<unknown>[] = [];
  const prevDogs = new Map(prev.dogs.map((d) => [d.id, d]));
  const nextDogs = new Map(next.dogs.map((d) => [d.id, d]));
  for (const [id, d] of nextDogs) if (prevDogs.get(id) !== d) ops.push(cloud.putDog(d));
  for (const id of prevDogs.keys()) if (!nextDogs.has(id)) ops.push(cloud.deleteDog(id));

  const prevSessions = new Map(prev.sessions.map((s) => [s.id, s]));
  const nextSessions = new Map(next.sessions.map((s) => [s.id, s]));
  for (const [id, s] of nextSessions) if (prevSessions.get(id) !== s) ops.push(cloud.putSession(s));
  for (const id of prevSessions.keys()) if (!nextSessions.has(id)) ops.push(cloud.deleteSession(id));

  for (const dogId of new Set([...Object.keys(prev.progress), ...Object.keys(next.progress)])) {
    const a = prev.progress[dogId] ?? {};
    const b = next.progress[dogId] ?? {};
    for (const skillId of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!b[skillId]) ops.push(cloud.deleteProgress(dogId, skillId));
      else if (a[skillId] !== b[skillId]) ops.push(cloud.putProgress(dogId, skillId, b[skillId]));
    }
  }
  return ops;
}

const STORAGE_KEY = 'pawsitive/state/v1';
const UPLOADED_KEY = 'pawsitive/uploaded-local/v1';

type Ctx = {
  state: State;
  ready: boolean;
  dispatch: (action: Action) => void;
  sync: SyncStatus;
  /** Set when a change couldn't be saved; cleared by dismissNotice. */
  notice: string | null;
  dismissNotice: () => void;
  myId: string | null;
  cloud: Cloud | null;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncStatus>('local');
  const [notice, setNotice] = useState<string | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [cloud, setCloud] = useState<Cloud | null>(null);
  const loaded = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const syncRef = useRef(sync);
  syncRef.current = sync;
  /** The last shared data received, used to undo a change that couldn't be saved. */
  const lastRemote = useRef<Remote | null>(null);

  // 1. Load what's saved on this device.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as State;
          rawDispatch({
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

  // 2. On the web page hosted by Claude, switch to shared data.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    connectCloud().then(async (c) => {
      if (cancelled || !c) return;
      setCloud(c);
      setSync('connecting');
      const [id, writable] = await Promise.all([c.myId(), c.canWrite()]);
      if (cancelled) return;
      setMyId(id);
      const readOnly = writable === false;

      timer = setTimeout(() => setSync((s) => (s === 'connecting' ? 'offline' : s)), 10000);
      let first = true;
      unsubscribe = c.subscribe(
        (remote, definitive) => {
          lastRemote.current = remote;
          if (first && definitive) {
            first = false;
            // Carry over anything logged on this device before sharing was turned on.
            const local = stateRef.current;
            const remoteEmpty = remote.dogs.length === 0 && remote.sessions.length === 0;
            AsyncStorage.getItem(UPLOADED_KEY)
              .catch(() => null)
              .then((done) => {
                if (remoteEmpty && local.dogs.length > 0 && !done && !readOnly) {
                  Promise.all(syncDiff(c, { ...local, dogs: [], sessions: [], progress: {} }, local))
                    .then(() => AsyncStorage.setItem(UPLOADED_KEY, '1'))
                    .catch(() => {});
                } else {
                  AsyncStorage.setItem(UPLOADED_KEY, '1').catch(() => {});
                  rawDispatch({ type: 'remote', remote });
                }
              });
          } else if (!first || remote.dogs.length > 0) {
            rawDispatch({ type: 'remote', remote });
          }
          if (definitive) {
            clearTimeout(timer);
            setSync(readOnly ? 'readonly' : 'synced');
          }
        },
        () => {
          clearTimeout(timer);
          setSync('offline');
        },
      );
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, [ready]);

  // Save a copy on this device (also the offline fallback).
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const dispatch = useCallback(
    (action: Action) => {
      const shared = SHARED_ACTIONS.has(action.type);
      if (shared && syncRef.current === 'readonly') {
        setNotice("You can view this dog's training but can't make changes. Ask the owner to invite you as an Editor.");
        return;
      }
      if (shared && cloud && syncRef.current !== 'local') {
        const prev = stateRef.current;
        const next = reducer(prev, action);
        stateRef.current = next;
        rawDispatch(action);
        Promise.all(syncDiff(cloud, prev, next)).catch((e: { code?: string }) => {
          if (lastRemote.current) rawDispatch({ type: 'remote', remote: lastRemote.current });
          if (e?.code === 'invalid_argument') {
            setSync('readonly');
            setNotice("This change couldn't be saved because you can only view. Ask the owner to invite you as an Editor.");
          } else if (e?.code === 'quota_exceeded') {
            setNotice('Storage is full, so this change was not saved. Delete some old sessions and try again.');
          } else {
            setNotice("This change couldn't be saved. Check your connection and try again.");
          }
        });
        return;
      }
      rawDispatch(action);
    },
    [cloud],
  );

  // Tag sessions with who logged them when synced.
  const tagged = useCallback(
    (action: Action) => {
      if (action.type === 'addSession' && myId && !action.session.by) {
        dispatch({ ...action, session: { ...action.session, by: myId } });
      } else dispatch(action);
    },
    [dispatch, myId],
  );

  const value = useMemo(
    () => ({ state, dispatch: tagged, ready, sync, notice, dismissNotice: () => setNotice(null), myId, cloud }),
    [state, tagged, ready, sync, notice, myId, cloud],
  );
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

/** Display names for the people who logged sessions (shared version only). */
export function usePeopleNames(ids: string[]) {
  const { cloud } = useStore();
  const key = [...new Set(ids)].sort().join(',');
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!cloud || !key) return;
    let live = true;
    cloud.names(key.split(',')).then((n) => live && setNames(n));
    return () => {
      live = false;
    };
  }, [cloud, key]);
  return names;
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
