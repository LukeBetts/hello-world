import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, H1, H2, Row, Screen, Stat, StatusPill } from '../../components/ui';
import { planColor } from '../../components/SkillRow';
import { CATEGORY_EMOJI, SKILL_BY_ID } from '../../data/skills';
import { formatAge, PLAN_LABEL, planState } from '../../lib/plan';
import { tapFeedback } from '../../lib/clicker';
import { STATUS_LABEL, STATUS_ORDER, useActiveDog, useSkillProgress, useStore } from '../../lib/store';
import { formatMinutes, relativeDay, successRate } from '../../lib/stats';
import { statusColor, useTheme } from '../../lib/theme';

export default function SkillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const skill = SKILL_BY_ID[id];
  const t = useTheme();
  const { state, dispatch } = useStore();
  const dog = useActiveDog();
  const progress = useSkillProgress(id);
  const plan = skill ? planState(skill, dog, progress) : 'upcoming';

  if (!skill) {
    return (
      <Screen>
        <Body>Skill not found.</Body>
      </Screen>
    );
  }

  const sessions = state.sessions.filter((s) => s.dogId === dog?.id && s.skillId === skill.id);
  const totals = sessions.reduce(
    (acc, s) => ({ ok: acc.ok + s.successes, miss: acc.miss + s.misses, sec: acc.sec + s.durationSec }),
    { ok: 0, miss: 0, sec: 0 },
  );
  const rate = successRate(totals.ok, totals.miss);

  const setStep = (step: number) => {
    if (!dog) return;
    tapFeedback(state.settings.haptics);
    dispatch({
      type: 'setProgress',
      dogId: dog.id,
      skillId: skill.id,
      patch: { step, status: progress.status === 'new' ? 'learning' : progress.status },
    });
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: skill.category }} />

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 40 }}>{CATEGORY_EMOJI[skill.category]}</Text>
        <H1>{skill.name}</H1>
        <Body muted>{skill.summary}</Body>
        <Body style={{ fontSize: 14, marginTop: 4 }}>
          📅 Scheduled at <Text style={{ fontWeight: '700' }}>{formatAge(skill.week)} old</Text>
          {dog?.birthDate ? (
            <Text style={{ color: planColor(t, plan), fontWeight: '700' }}> · {PLAN_LABEL[plan]}</Text>
          ) : null}
        </Body>
      </View>

      {dog && (
        <Button big title={`▶  Start training ${dog.name}`} onPress={() => router.push(`/session/${skill.id}`)} />
      )}

      <Card style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <H2>Status</H2>
          <StatusPill status={progress.status} />
        </Row>
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {STATUS_ORDER.map((s) => {
            const active = progress.status === s;
            const c = statusColor(t, s);
            return (
              <Pressable
                key={s}
                disabled={!dog}
                onPress={() => {
                  if (!dog) return;
                  tapFeedback(state.settings.haptics);
                  dispatch({ type: 'setProgress', dogId: dog.id, skillId: skill.id, patch: { status: s } });
                }}
                style={{
                  flexGrow: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: active ? c.bg : 'transparent',
                  borderWidth: 1,
                  borderColor: active ? c.fg : t.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? c.fg : t.muted }}>{STATUS_LABEL[s]}</Text>
              </Pressable>
            );
          })}
        </Row>
        <Body muted style={{ fontSize: 13 }}>
          🎯 Goal: {skill.goal}
        </Body>
      </Card>

      {sessions.length > 0 && (
        <Card>
          <Row>
            <Stat value={`${sessions.length}`} label="sessions" />
            <Stat value={formatMinutes(totals.sec / 60)} label="trained" />
            <Stat value={rate === null ? '–' : `${rate}%`} label="success" />
          </Row>
        </Card>
      )}

      <View style={{ gap: 8 }}>
        <H2>Steps</H2>
        <Body muted style={{ fontSize: 13 }}>
          Tap a step to mark it as the one you're working on.
        </Body>
        {skill.steps.map((step, i) => {
          const done = i < progress.step || progress.status === 'mastered';
          const current = i === progress.step && progress.status !== 'mastered';
          return (
            <Pressable
              key={i}
              onPress={() => setStep(i)}
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 14,
                borderRadius: 14,
                backgroundColor: current ? t.primarySoft : t.card,
                borderWidth: 1,
                borderColor: current ? t.primary : t.card,
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done ? t.success : current ? t.primary : t.track,
                }}
              >
                <Text style={{ color: done || current ? '#fff' : t.muted, fontWeight: '800', fontSize: 13 }}>
                  {done ? '✓' : i + 1}
                </Text>
              </View>
              <Body style={{ flex: 1, opacity: done ? 0.6 : 1 }}>{step}</Body>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ gap: 8 }}>
        <H2>Tips</H2>
        {skill.tips.map((tip, i) => (
          <Body key={i}>• {tip}</Body>
        ))}
      </Card>

      {sessions.length > 0 && (
        <View style={{ gap: 8 }}>
          <H2>Recent sessions</H2>
          {sessions.slice(0, 5).map((s) => (
            <Card key={s.id} style={{ paddingVertical: 12 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body style={{ fontWeight: '600' }}>{relativeDay(s.startedAt)}</Body>
                <Body muted>
                  ✅ {s.successes} · ✖️ {s.misses} · {Math.max(1, Math.round(s.durationSec / 60))} min
                </Body>
              </Row>
              {!!s.note && <Body muted style={{ marginTop: 4 }}>{s.note}</Body>}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
