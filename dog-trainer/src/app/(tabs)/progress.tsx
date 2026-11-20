import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { confirmAction } from '../../components/ConfirmDialog';
import { Body, Card, H2, ProgressBar, Row, Screen, Stat } from '../../components/ui';
import { planColor } from '../../components/SkillRow';
import { CATEGORY_EMOJI, SKILLS, SKILL_BY_ID } from '../../data/skills';
import { formatAge, PLAN_LABEL, summarizePlan } from '../../lib/plan';
import { useActiveDog, usePeopleNames, useStore } from '../../lib/store';
import { formatMinutes, lastNDays, relativeDay, streak, successRate } from '../../lib/stats';
import { useTheme } from '../../lib/theme';
import { sz } from '../../lib/scale';

export default function Progress() {
  const t = useTheme();
  const { state, dispatch, myId } = useStore();
  const dog = useActiveDog();

  const sessions = useMemo(() => state.sessions.filter((s) => s.dogId === dog?.id), [state.sessions, dog?.id]);
  const week = lastNDays(sessions, 7);
  const maxMin = Math.max(state.settings.dailyGoalMin, ...week.map((d) => d.minutes));
  const weekMin = week.reduce((a, d) => a + d.minutes, 0);
  const totals = sessions.reduce((a, s) => ({ ok: a.ok + s.successes, miss: a.miss + s.misses }), { ok: 0, miss: 0 });
  const rate = successRate(totals.ok, totals.miss);
  const progress = (dog && state.progress[dog.id]) || {};
  const plan = summarizePlan(dog, progress);
  const people = useMemo(() => [...new Set(sessions.map((s) => s.by).filter((b): b is string => !!b))], [sessions]);
  const names = usePeopleNames(people);
  const showWho = people.length > 1;
  const whoLabel = (by?: string) => (by === myId ? 'You' : (by && names[by]) || 'Someone');

  if (!dog) {
    return (
      <Screen>
        <Body muted>Add a dog on the Dogs tab to start tracking progress.</Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Row>
          <Stat value={`${streak(sessions)}🔥`} label="day streak" />
          <Stat value={formatMinutes(weekMin)} label="this week" />
          <Stat value={rate === null ? '–' : `${rate}%`} label="all-time success" />
        </Row>
      </Card>

      <Card style={{ gap: sz(12) }}>
        <H2>Last 7 days</H2>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: sz(120), gap: sz(8) }}>
          {week.map((d) => {
            const h = maxMin === 0 ? 0 : (d.minutes / maxMin) * 100;
            const hitGoal = d.minutes >= state.settings.dailyGoalMin;
            return (
              <View key={d.start} style={{ flex: 1, alignItems: 'center', gap: sz(6) }}>
                <View style={{ height: sz(100), width: '100%', justifyContent: 'flex-end' }}>
                  <View
                    style={{
                      height: sz(Math.max(h, d.minutes > 0 ? 4 : 2)),
                      backgroundColor: d.minutes === 0 ? t.track : hitGoal ? t.success : t.primary,
                      borderRadius: sz(6),
                    }}
                  />
                </View>
                <Text style={{ fontSize: sz(11), color: t.muted }}>
                  {new Date(d.start).toLocaleDateString(undefined, { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </View>
        <Body muted style={{ fontSize: sz(12) }}>
          Green = hit your {state.settings.dailyGoalMin}-minute daily goal
        </Body>
      </Card>

      <Card style={{ gap: sz(12) }}>
        <H2>Training plan</H2>
        {dog.birthDate ? (
          <>
            <Row style={{ gap: sz(6) }}>
              {(
                [
                  ['done', plan.done.length],
                  ['current', plan.current.length],
                  ['behind', plan.behind.length + plan.catchup.length],
                  ['upcoming', plan.upcoming.length],
                ] as const
              ).map(([key, n]) => (
                <View key={key} style={{ flex: 1, alignItems: 'center', gap: sz(2) }}>
                  <Text style={{ fontSize: sz(22), fontWeight: '800', color: planColor(t, key) }}>{n}</Text>
                  <Text style={{ fontSize: sz(12), color: t.muted }}>{PLAN_LABEL[key].toLowerCase()}</Text>
                </View>
              ))}
            </Row>
            <ProgressBar value={plan.done.length / SKILLS.length} color={t.success} />
            <Body muted style={{ fontSize: sz(13) }}>
              {plan.done.length} of {SKILLS.length} skills Reliable or Mastered. {dog.name} is {formatAge(plan.age ?? 0)} old.
            </Body>
          </>
        ) : (
          <Body muted>Add {dog.name}'s age on the Dogs tab to see the weekly plan.</Body>
        )}
      </Card>

      <View style={{ gap: sz(8) }}>
        <H2>History</H2>
        {sessions.length === 0 && <Body muted>No sessions yet. Pick a skill and start training!</Body>}
        {sessions.slice(0, 50).map((s) => {
          const skill = SKILL_BY_ID[s.skillId];
          const r = successRate(s.successes, s.misses);
          return (
            <Pressable
              key={s.id}
              onPress={() => skill && router.push(`/skill/${skill.id}`)}
              onLongPress={() =>
                confirmAction({
                  title: 'Delete session?',
                  message: `${skill?.name ?? 'Session'} · ${relativeDay(s.startedAt)}`,
                  confirmText: 'Delete',
                  onConfirm: () => dispatch({ type: 'removeSession', id: s.id }),
                })
              }
            >
              <Card style={{ paddingVertical: sz(12), gap: sz(2) }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Body style={{ fontWeight: '700', flex: 1 }} >
                    {skill ? `${CATEGORY_EMOJI[skill.category]} ${skill.name}` : 'Unknown skill'}
                  </Body>
                  <Body muted style={{ fontSize: sz(13) }}>
                    {relativeDay(s.startedAt)}
                  </Body>
                </Row>
                <Body muted style={{ fontSize: sz(13) }}>
                  {Math.max(1, Math.round(s.durationSec / 60))} min · ✅ {s.successes} · ✖️ {s.misses}
                  {r !== null ? ` · ${r}%` : ''}
                  {showWho ? ` · ${whoLabel(s.by)}` : ''}
                </Body>
                {!!s.note && <Body style={{ fontSize: sz(14), marginTop: sz(4) }}>“{s.note}”</Body>}
              </Card>
            </Pressable>
          );
        })}
        {sessions.length > 0 && (
          <Body muted style={{ fontSize: sz(12), textAlign: 'center' }}>
            Long-press a session to delete it.
          </Body>
        )}
      </View>
    </Screen>
  );
}
