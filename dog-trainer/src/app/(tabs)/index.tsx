import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SyncWarning } from '../../components/SyncBanner';
import { SkillRow } from '../../components/SkillRow';
import { Body, Button, Card, H1, H2, ProgressBar, Row, Screen, Stat } from '../../components/ui';
import { PLAN_START_WEEK, SKILLS, SKILL_BY_ID } from '../../data/skills';
import { formatAge, summarizePlan } from '../../lib/plan';
import { useActiveDog, useStore } from '../../lib/store';
import { formatMinutes, minutesOn, startOfDay, streak } from '../../lib/stats';
import { useTheme } from '../../lib/theme';
import { sz } from '../../lib/scale';

const TIPS = [
  'Keep sessions short — 3 to 5 minutes, a few times a day, beats one long session.',
  'End every session on a success, even if you have to ask for something easy.',
  'If your dog gets it wrong 3 times in a row, make it easier.',
  'Use tiny, soft treats: pea-sized is plenty.',
  'Mark the exact moment of the behaviour — timing is everything.',
  'Train before meals, when your dog is a little bit hungry.',
  'Practise in new places to help your dog generalise what they know.',
];

export default function Today() {
  const t = useTheme();
  const { state } = useStore();
  const dog = useActiveDog();

  const dogSessions = useMemo(
    () => state.sessions.filter((s) => s.dogId === dog?.id),
    [state.sessions, dog?.id],
  );

  if (!dog) {
    return (
      <Screen contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: sz(12) }}>
          <Text style={{ fontSize: sz(72) }}>🐕</Text>
          <H1 style={{ textAlign: 'center' }}>Welcome to Pawsitive</H1>
          <Body muted style={{ textAlign: 'center' }}>
            Step-by-step, reward-based training plans, a built-in clicker, and progress tracking for your dog.
          </Body>
        </View>
        <Button big title="Add your dog" onPress={() => router.push('/dog-edit')} />
      </Screen>
    );
  }

  const progress = state.progress[dog.id] ?? {};
  const todayMin = minutesOn(dogSessions, startOfDay(Date.now()));
  const goal = state.settings.dailyGoalMin;
  const currentStreak = streak(dogSessions);
  const mastered = Object.values(progress).filter((p) => p.status === 'mastered').length;

  const plan = summarizePlan(dog, progress);
  const overdue = [...plan.behind, ...plan.catchup];
  const dueSoFar = plan.done.length + plan.current.length + overdue.length;
  const nextSkills = plan.nextWeek ? SKILLS.filter((s) => s.week === plan.nextWeek) : [];

  const tip = TIPS[new Date().getDate() % TIPS.length];
  const last = dogSessions[0];

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: sz(44) }}>{dog.emoji}</Text>
        <View style={{ flex: 1 }}>
          <H1>{dog.name}</H1>
          <Body muted>
            {plan.age === null
              ? 'Age not set'
              : plan.age < PLAN_START_WEEK
                ? `${formatAge(plan.age)} old · plan starts at ${PLAN_START_WEEK} weeks`
                : `${formatAge(plan.age)} old · week ${plan.age} of the plan`}
          </Body>
        </View>
      </Row>

      <SyncWarning />

      {plan.age === null ? (
        <Card style={{ gap: sz(10), backgroundColor: t.primarySoft, borderColor: t.primarySoft }}>
          <H2>Get a weekly plan</H2>
          <Body>Add {dog.name}'s age and we'll schedule new skills for each week, and show you if you fall behind.</Body>
          <Button title={`Add ${dog.name}'s age`} onPress={() => router.push({ pathname: '/dog-edit', params: { id: dog.id } })} />
        </Card>
      ) : (
        <Card style={{ gap: sz(12) }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <H2>
              {plan.behind.length > 0
                ? `${plan.behind.length} skill${plan.behind.length === 1 ? '' : 's'} behind`
                : plan.planFinished && overdue.length === 0
                  ? 'Plan complete 🎓'
                  : 'On track ✅'}
            </H2>
            <Body muted>
              {plan.done.length}/{SKILLS.length} done
            </Body>
          </Row>
          <ProgressBar
            value={dueSoFar === 0 ? 0 : plan.done.length / dueSoFar}
            color={plan.behind.length > 0 ? t.danger : t.success}
          />
          <Body muted style={{ fontSize: sz(13) }}>
            {dueSoFar === 0
              ? `The first skills are scheduled at ${PLAN_START_WEEK} weeks old.`
              : `${plan.done.length} of the ${dueSoFar} skills due by now are Reliable or Mastered.`}
            {plan.catchup.length > 0
              ? ` ${plan.catchup.length} skill${plan.catchup.length === 1 ? ' was' : 's were'} scheduled before you added ${dog.name}: work through them when you can.`
              : ''}
          </Body>
          {overdue.length > 0 && (
            <Button
              title={plan.behind.length > 0 ? 'See what to catch up on' : 'See catch-up skills'}
              variant="secondary"
              onPress={() => router.push({ pathname: '/skills', params: { filter: 'behind' } })}
            />
          )}
        </Card>
      )}

      {plan.age !== null && (
        <View style={{ gap: sz(10) }}>
          <H2>{plan.current.length > 0 ? 'This week' : 'No new skills this week'}</H2>
          {plan.current.length === 0 && (
            <Body muted>
              {overdue.length > 0
                ? 'A good week to catch up on earlier skills.'
                : 'A good week to practise what you have learned so far.'}
            </Body>
          )}
          {plan.current.map((s) => (
            <SkillRow key={s.id} skill={s} />
          ))}
          {plan.behind.slice(0, 3).map((s) => (
            <SkillRow key={s.id} skill={s} />
          ))}
          {plan.current.length === 0 && nextSkills.length > 0 && (
            <>
              <Body style={{ fontWeight: '700', marginTop: sz(6) }}>
                Coming up at {formatAge(plan.nextWeek!)} old
              </Body>
              {nextSkills.map((s) => (
                <SkillRow key={s.id} skill={s} />
              ))}
            </>
          )}
        </View>
      )}

      <Card style={{ gap: sz(14) }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>Today's goal</H2>
          <Body muted>
            {formatMinutes(todayMin)} / {goal} min
          </Body>
        </Row>
        <ProgressBar value={todayMin / goal} color={todayMin >= goal ? t.success : t.primary} />
        <Row>
          <Stat value={`${currentStreak}🔥`} label="day streak" />
          <Stat value={`${dogSessions.length}`} label="sessions" />
          <Stat value={`${mastered}/${SKILLS.length}`} label="mastered" />
        </Row>
      </Card>

      {last && SKILL_BY_ID[last.skillId] && (
        <Button
          big
          title={`▶  Practise ${SKILL_BY_ID[last.skillId].name} again`}
          onPress={() => router.push(`/session/${last.skillId}`)}
        />
      )}

      <Pressable onPress={() => router.push('/skills')}>
        <Text style={{ color: t.primary, fontWeight: '700', textAlign: 'center', padding: sz(8) }}>
          See the full plan →
        </Text>
      </Pressable>

      <Card style={{ backgroundColor: t.primarySoft, borderColor: t.primarySoft, gap: sz(6) }}>
        <Text style={{ fontWeight: '800', color: t.primary }}>💡 Trainer tip</Text>
        <Body>{tip}</Body>
      </Card>
    </Screen>
  );
}
