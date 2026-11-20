import { PLAN_START_WEEK, PLAN_WEEKS, SKILLS, type Skill } from '../data/skills';
import type { Dog, SkillProgress } from './store';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Where a skill sits in the dog's weekly plan:
 * - done:     Reliable or Mastered
 * - current:  scheduled for the dog's current week of age
 * - behind:   scheduled for an earlier week (since you added the dog) and not done yet
 * - catchup:  scheduled before you added the dog (e.g. an older rescue) and not done yet
 * - upcoming: scheduled for a later week
 */
export type PlanState = 'done' | 'current' | 'behind' | 'catchup' | 'upcoming';

export const PLAN_LABEL: Record<PlanState, string> = {
  done: 'Done',
  current: 'This week',
  behind: 'Behind',
  catchup: 'Catch up',
  upcoming: 'Upcoming',
};

/** The dog's age in whole weeks, or null if their age isn't known. */
export function ageInWeeks(dog: Dog | null, at = Date.now()): number | null {
  if (!dog?.birthDate) return null;
  return Math.max(0, Math.floor((at - dog.birthDate) / WEEK_MS));
}

/** "10 weeks", "4 months", "2 years". */
export function formatAge(weeks: number) {
  if (weeks < 16) return `${weeks} week${weeks === 1 ? '' : 's'}`;
  const months = Math.floor((weeks * 7) / 30.44);
  if (months < 24) return `${months} months`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export function birthDateFromAge(amount: number, unit: AgeUnit, now = Date.now()) {
  const days = unit === 'weeks' ? amount * 7 : unit === 'months' ? amount * 30.44 : amount * 365.25;
  return Math.round(now - days * 24 * 60 * 60 * 1000);
}

export type AgeUnit = 'weeks' | 'months' | 'years';

/** A friendly way to show an age in the age picker. */
export function ageForInput(birthDate: number, now = Date.now()): { amount: number; unit: AgeUnit } {
  const weeks = Math.max(0, Math.floor((now - birthDate) / WEEK_MS));
  if (weeks < 16) return { amount: weeks, unit: 'weeks' };
  const months = Math.round((weeks * 7) / 30.44);
  if (months < 24) return { amount: months, unit: 'months' };
  return { amount: Math.round(months / 12), unit: 'years' };
}

const isDone = (p?: SkillProgress) => p?.status === 'reliable' || p?.status === 'mastered';

export function planState(skill: Skill, dog: Dog | null, progress: SkillProgress | undefined, now = Date.now()): PlanState {
  if (isDone(progress)) return 'done';
  const age = ageInWeeks(dog, now);
  if (age === null || skill.week > age) return 'upcoming';
  if (skill.week === age) return 'current';
  const ageWhenAdded = ageInWeeks(dog, dog?.createdAt ?? now) ?? 0;
  return skill.week < ageWhenAdded ? 'catchup' : 'behind';
}

export type PlanSummary = {
  age: number | null;
  /** Skills scheduled for this week of age. */
  current: Skill[];
  behind: Skill[];
  catchup: Skill[];
  done: Skill[];
  upcoming: Skill[];
  /** The next plan week after this one, if any. */
  nextWeek: number | null;
  /** True once the dog is older than the last week of the plan. */
  planFinished: boolean;
};

export function summarizePlan(dog: Dog | null, progress: Record<string, SkillProgress>, now = Date.now()): PlanSummary {
  const age = ageInWeeks(dog, now);
  const out: PlanSummary = {
    age,
    current: [],
    behind: [],
    catchup: [],
    done: [],
    upcoming: [],
    nextWeek: null,
    planFinished: age !== null && age > PLAN_WEEKS[PLAN_WEEKS.length - 1],
  };
  for (const s of SKILLS) out[planState(s, dog, progress[s.id], now)].push(s);
  out.nextWeek = PLAN_WEEKS.find((w) => w > (age ?? PLAN_START_WEEK - 1)) ?? null;
  return out;
}
