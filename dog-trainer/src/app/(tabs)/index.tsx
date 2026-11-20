import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SyncWarning } from '../../components/SyncBanner';
import { SkillRow } from '../../components/SkillRow';
import { Body, Button, Card, H1, H2, ProgressBar, Row, Screen, Stat } from '../../components/ui';
import { SKILLS, SKILL_BY_ID } from '../../data/skills';
import { useActiveDog, useStore } from '../../lib/store';
import { formatMinutes, minutesOn, startOfDay, streak } from '../../lib/stats';
import { useTheme } from '../../lib/theme';

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
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 72 }}>🐕</Text>
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

  const inProgress = SKILLS.filter((s) => {
    const st = progress[s.id]?.status;
    return st === 'learning' || st === 'reliable';
  });
  const suggestions = inProgress.length
    ? inProgress.slice(0, 4)
    : SKILLS.filter((s) => s.category === 'Foundations' && !progress[s.id]).slice(0, 3);

  const tip = TIPS[new Date().getDate() % TIPS.length];
  const last = dogSessions[0];

  return (
    <Screen>
      <Row>
        <Text style={{ fontSize: 44 }}>{dog.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Body muted>Training with</Body>
          <H1>{dog.name}</H1>
        </View>
      </Row>

      <SyncWarning />

      <Card style={{ gap: 14 }}>
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

      <View style={{ gap: 10 }}>
        <H2>{inProgress.length ? 'Keep working on' : 'Start with the foundations'}</H2>
        {suggestions.map((s) => (
          <SkillRow key={s.id} skill={s} />
        ))}
        <Pressable onPress={() => router.push('/skills')}>
          <Text style={{ color: t.primary, fontWeight: '700', textAlign: 'center', padding: 8 }}>
            Browse all {SKILLS.length} skills →
          </Text>
        </Pressable>
      </View>

      <Card style={{ backgroundColor: t.primarySoft, borderColor: t.primarySoft, gap: 6 }}>
        <Text style={{ fontWeight: '800', color: t.primary }}>💡 Trainer tip</Text>
        <Body>{tip}</Body>
      </Card>
    </Screen>
  );
}
