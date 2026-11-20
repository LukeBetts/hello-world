import type { Dog, Session, SkillProgress } from './store';

/** Shared data that syncs between everyone using the app. */
export type Remote = {
  dogs: Dog[];
  sessions: Session[];
  progress: Record<string, Record<string, SkillProgress>>;
};

export type Cloud = {
  /** Live updates. `definitive` is false while the data may be a cached copy. */
  subscribe(onData: (r: Remote, definitive: boolean) => void, onError: (code: string) => void): () => void;
  putDog(d: Dog): Promise<void>;
  deleteDog(id: string): Promise<void>;
  putSession(s: Session): Promise<void>;
  deleteSession(id: string): Promise<void>;
  putProgress(dogId: string, skillId: string, p: SkillProgress): Promise<void>;
  deleteProgress(dogId: string, skillId: string): Promise<void>;
  /** The current person's id, or null if unknown. */
  myId(): Promise<string | null>;
  /** false = this person can only view; null = unknown. */
  canWrite(): Promise<boolean | null>;
  /** Display names for person ids. */
  names(ids: string[]): Promise<Record<string, string>>;
};

/** Native builds keep everything on the device. Web builds hosted on Claude sync (see cloud.web.ts). */
export async function connectCloud(): Promise<Cloud | null> {
  return null;
}
