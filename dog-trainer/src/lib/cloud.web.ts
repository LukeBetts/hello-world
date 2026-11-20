import type { Dog, Session, SkillProgress, Status } from './store';
import type { Cloud, Remote } from './cloud';

export type { Cloud, Remote } from './cloud';

/*
 * When the web build runs as a Claude artifact, data is stored in the artifact's
 * shared database so everyone the page is shared with sees the same dogs,
 * sessions and progress.
 *
 *   dogs/<dogId>                 Dog
 *   sessions/<sessionId>         Session
 *   progress/<dogId>__<skillId>  { dogId, skillId, status, step }
 */

type Snap = { docs: { id: string; data(): Record<string, unknown> | undefined }[]; metadata: { fromCache: boolean } };
type DocRef = {
  set(d: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
};
type Coll = { doc(id: string): DocRef; onSnapshot(next: (s: Snap) => void, err: (e: { code: string }) => void): () => void };
type DB = { collection(path: string): Coll };
type User = {
  id(): Promise<string | null>;
  can(name: string): Promise<boolean | null>;
  profiles(ids: string[]): Promise<Record<string, { name?: string }>>;
};
type ClaudeHost = { use(name: string): Promise<unknown> };

const STATUSES: Status[] = ['new', 'learning', 'reliable', 'mastered'];
const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

// Shared data comes from other people: check its shape before using it.
function toDog(id: string, d: Record<string, unknown>): Dog | null {
  const name = str(d.name, 60);
  if (!name) return null;
  const birthDate = num(d.birthDate);
  return {
    id,
    name,
    breed: str(d.breed, 60),
    emoji: str(d.emoji, 16) || '🐶',
    createdAt: num(d.createdAt),
    ...(birthDate > 0 ? { birthDate } : {}),
  };
}

function toSession(id: string, d: Record<string, unknown>): Session | null {
  const dogId = str(d.dogId, 100);
  const skillId = str(d.skillId, 100);
  if (!dogId || !skillId) return null;
  return {
    id,
    dogId,
    skillId,
    startedAt: num(d.startedAt),
    durationSec: num(d.durationSec),
    successes: num(d.successes),
    misses: num(d.misses),
    note: str(d.note, 2000),
    by: str(d.by, 200) || undefined,
  };
}

function toProgress(d: Record<string, unknown>) {
  const dogId = str(d.dogId, 100);
  const skillId = str(d.skillId, 100);
  const status = STATUSES.includes(d.status as Status) ? (d.status as Status) : 'new';
  if (!dogId || !skillId) return null;
  return { dogId, skillId, p: { status, step: Math.max(0, Math.floor(num(d.step))) } };
}

const progressId = (dogId: string, skillId: string) => `${dogId}__${skillId}`;

export async function connectCloud(): Promise<Cloud | null> {
  const host = (globalThis as { claude?: ClaudeHost }).claude;
  if (!host || typeof host.use !== 'function') return null;

  let db: DB | null = null;
  let user: User | null = null;
  try {
    [db, user] = (await Promise.all([host.use('db'), host.use('user').catch(() => null)])) as [DB | null, User | null];
  } catch {
    return null;
  }
  if (!db) return null;
  const store = db;

  // One write at a time per document.
  const queues = new Map<string, Promise<void>>();
  const write = (path: string, op: () => Promise<void>) => {
    const prev = queues.get(path) ?? Promise.resolve();
    const next = prev.catch(() => {}).then(op);
    queues.set(path, next);
    return next;
  };
  const withRetry = async (op: () => Promise<void>) => {
    try {
      await op();
    } catch (e) {
      if ((e as { code?: string })?.code !== 'unavailable') throw e;
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
      await op();
    }
  };
  const put = (coll: string, id: string, data: Record<string, unknown>) =>
    write(`${coll}/${id}`, () => withRetry(() => store.collection(coll).doc(id).set(data)));
  const del = (coll: string, id: string) =>
    write(`${coll}/${id}`, () => withRetry(() => store.collection(coll).doc(id).delete()));

  return {
    subscribe(onData, onError) {
      const parts: { dogs?: Snap; sessions?: Snap; progress?: Snap } = {};
      const emit = () => {
        if (!parts.dogs || !parts.sessions || !parts.progress) return;
        const dogs = parts.dogs.docs.map((d) => toDog(d.id, d.data() ?? {})).filter((d): d is Dog => !!d);
        dogs.sort((a, b) => a.createdAt - b.createdAt);
        const sessions = parts.sessions.docs
          .map((d) => toSession(d.id, d.data() ?? {}))
          .filter((s): s is Session => !!s)
          .sort((a, b) => b.startedAt - a.startedAt);
        const progress: Remote['progress'] = {};
        for (const d of parts.progress.docs) {
          const p = toProgress(d.data() ?? {});
          if (p) (progress[p.dogId] ??= {})[p.skillId] = p.p;
        }
        const definitive =
          !parts.dogs.metadata.fromCache && !parts.sessions.metadata.fromCache && !parts.progress.metadata.fromCache;
        onData({ dogs, sessions, progress }, definitive);
      };
      const fail = (e: { code: string }) => onError(e?.code ?? 'unavailable');
      const unsubs = (['dogs', 'sessions', 'progress'] as const).map((name) =>
        store.collection(name).onSnapshot((s) => {
          parts[name] = s;
          emit();
        }, fail),
      );
      return () => unsubs.forEach((u) => u());
    },
    putDog: (d) => put('dogs', d.id, { ...d }),
    deleteDog: (id) => del('dogs', id),
    putSession: (s) => {
      const { by, ...rest } = s;
      return put('sessions', s.id, by ? { ...rest, by } : rest);
    },
    deleteSession: (id) => del('sessions', id),
    putProgress: (dogId, skillId, p) => put('progress', progressId(dogId, skillId), { dogId, skillId, ...p }),
    deleteProgress: (dogId, skillId) => del('progress', progressId(dogId, skillId)),
    async myId() {
      try {
        return (await user?.id()) ?? null;
      } catch {
        return null;
      }
    },
    async canWrite() {
      try {
        return user ? await user.can('data.write') : null;
      } catch {
        return null;
      }
    },
    async names(ids) {
      if (!user || ids.length === 0) return {};
      try {
        const ps = await user.profiles(ids);
        const out: Record<string, string> = {};
        for (const id of ids) out[id] = ps?.[id]?.name || '';
        return out;
      } catch {
        return {};
      }
    },
  };
}
