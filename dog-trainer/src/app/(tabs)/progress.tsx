import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { confirmAction } from '../../components/ConfirmDialog';
import { Body, Card, H2, ProgressBar, Row, Screen, Stat } from '../../components/ui';
import { CATEGORIES, CATEGORY_EMOJI, SKILLS, SKILL_BY_ID } from '../../data/skills';
import { useActiveDog, useStore } from '../../lib/store';
import { formatMinutes, lastNDays, relativeDay, streak, successRate } from '../../lib/stats';
import { useTheme } from '../../lib/theme';

export default function Progress() {
  const t = useTheme();
  const { state, dispatch } = useStore();
  const dog = useActiveDog();

  const sessions = useMemo(() => state.sessions.filter((s) => s.dogId === dog?.id), [state.sessions, dog?.id]);
  const week = lastNDays(sessions, 7);
  const maxMin = Math.max(state.settings.dailyGoalMin, ...week.map((d) => d.minutes));
  const weekMin = week.reduce((a, d) => a + d.minutes, 0);
  const totals = sessions.reduce((a, s) => ({ ok: a.ok + s.successes, miss: a.miss + s.misses }), { ok: 0, miss: 0 });
  const rate = successRate(totals.ok, totals.miss);
  const progress = (dog && state.progress[dog.id]) || {};

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

      <Card style={{ gap: 12 }}>
        <H2>Last 7 days</H2>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
          {week.map((d) => {
            const h = maxMin === 0 ? 0 : (d.minutes / maxMin) * 100;
            const hitGoal = d.minutes >= state.settings.dailyGoalMin;
            return (
              <View key={d.start} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <View style={{ height: 100, width: '100%', justifyContent: 'flex-end' }}>
                  <View
                    style={{
                      height: Math.max(h, d.minutes > 0 ? 4 : 2),
                      backgroundColor: d.minutes === 0 ? t.track : hitGoal ? t.success : t.primary,
                      borderRadius: 6,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 11, color: t.muted }}>
                  {new Date(d.start).toLocaleDateString(undefined, { weekday: 'narrow' })}
                </Text>
              </View>
            );
          })}
        </View>
        <Body muted style={{ fontSize: 12 }}>
          Green = hit your {state.settings.dailyGoalMin}-minute daily goal
        </Body>
      </Card>

      <Card style={{ gap: 12 }}>
        <H2>Skills by category</H2>
        {CATEGORIES.map((c) => {
          const skills = SKILLS.filter((s) => s.category === c);
          const score =
            skills.reduce((a, s) => {
              const st = progress[s.id]?.status;
              return a + (st === 'mastered' ? 1 : st === 'reliable' ? 0.66 : st === 'learning' ? 0.33 : 0);
            }, 0) / skills.length;
          const mastered = skills.filter((s) => progress[s.id]?.status === 'mastered').length;
          return (
            <View key={c} style={{ gap: 6 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body>
                  {CATEGORY_EMOJI[c]} {c}
                </Body>
                <Body muted style={{ fontSize: 13 }}>
                  {mastered}/{skills.length} mastered
                </Body>
              </Row>
              <ProgressBar value={score} color={score >= 1 ? t.success : t.primary} />
            </View>
          );
        })}
      </Card>

      <View style={{ gap: 8 }}>
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
              <Card style={{ paddingVertical: 12, gap: 2 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Body style={{ fontWeight: '700', flex: 1 }} >
                    {skill ? `${CATEGORY_EMOJI[skill.category]} ${skill.name}` : 'Unknown skill'}
                  </Body>
                  <Body muted style={{ fontSize: 13 }}>
                    {relativeDay(s.startedAt)}
                  </Body>
                </Row>
                <Body muted style={{ fontSize: 13 }}>
                  {Math.max(1, Math.round(s.durationSec / 60))} min · ✅ {s.successes} · ✖️ {s.misses}
                  {r !== null ? ` · ${r}%` : ''}
                </Body>
                {!!s.note && <Body style={{ fontSize: 14, marginTop: 4 }}>“{s.note}”</Body>}
              </Card>
            </Pressable>
          );
        })}
        {sessions.length > 0 && (
          <Body muted style={{ fontSize: 12, textAlign: 'center' }}>
            Long-press a session to delete it.
          </Body>
        )}
      </View>
    </Screen>
  );
}
