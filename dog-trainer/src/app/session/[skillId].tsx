import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmAction } from '../../components/ConfirmDialog';
import { Body, Button, Card, H1, H2, Row, Stat } from '../../components/ui';
import { SKILL_BY_ID } from '../../data/skills';
import { tapFeedback, useClicker } from '../../lib/clicker';
import { newId, useActiveDog, useSkillProgress, useStore } from '../../lib/store';
import { formatDuration, successRate } from '../../lib/stats';
import { useTheme } from '../../lib/theme';
import { sz } from '../../lib/scale';

type Rep = 'ok' | 'miss';
const SUGGESTED_SEC = 5 * 60;

export default function TrainingSession() {
  useKeepAwake();
  const { skillId } = useLocalSearchParams<{ skillId: string }>();
  const skill = SKILL_BY_ID[skillId];
  const t = useTheme();
  const { state, dispatch } = useStore();
  const dog = useActiveDog();
  const progress = useSkillProgress(skillId);
  const click = useClicker();

  const startedAt = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reps, setReps] = useState<Rep[]>([]);
  const [finished, setFinished] = useState(false);
  const [note, setNote] = useState('');
  const [advance, setAdvance] = useState(false);

  useEffect(() => {
    if (paused || finished) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused, finished]);

  if (!skill || !dog) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg, padding: sz(16), gap: sz(16) }}>
        <Body>Add a dog first to start training.</Body>
        <Button title="Close" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const successes = reps.filter((r) => r === 'ok').length;
  const misses = reps.length - successes;
  const recent = reps.slice(-10);
  const recentRate = successRate(recent.filter((r) => r === 'ok').length, recent.filter((r) => r === 'miss').length);
  const readyForNext = recent.length >= 10 && (recentRate ?? 0) >= 80;
  const struggling = reps.length >= 3 && reps.slice(-3).every((r) => r === 'miss');
  const stepText = skill.steps[Math.min(progress.step, skill.steps.length - 1)];
  const hasNextStep = progress.step < skill.steps.length - 1;
  const overTime = elapsed >= SUGGESTED_SEC;

  const onClick = () => {
    click();
    setReps((r) => [...r, 'ok']);
  };
  const onMiss = () => {
    tapFeedback(state.settings.haptics);
    setReps((r) => [...r, 'miss']);
  };
  const onUndo = () => setReps((r) => r.slice(0, -1));

  const finish = () => {
    setPaused(true);
    setAdvance(readyForNext && hasNextStep);
    setFinished(true);
  };

  const save = () => {
    dispatch({
      type: 'addSession',
      session: {
        id: newId(),
        dogId: dog.id,
        skillId: skill.id,
        startedAt: startedAt.current,
        durationSec: elapsed,
        successes,
        misses,
        note: note.trim(),
      },
    });
    if (advance && hasNextStep) {
      dispatch({ type: 'setProgress', dogId: dog.id, skillId: skill.id, patch: { step: progress.step + 1 } });
    }
    router.back();
  };

  const discard = () => {
    if (reps.length === 0 && elapsed < 10) return router.back();
    confirmAction({
      title: 'Discard session?',
      message: 'This session will not be saved.',
      cancelText: 'Keep training',
      confirmText: 'Discard',
      onConfirm: () => router.back(),
    });
  };

  if (finished) {
    const rate = successRate(successes, misses);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: sz(16), gap: sz(16) }}>
          <View style={{ alignItems: 'center', gap: sz(6), marginTop: sz(12) }}>
            <Text style={{ fontSize: sz(56) }}>{(rate ?? 0) >= 70 ? '🏆' : '🐾'}</Text>
            <H1>Nice work!</H1>
            <Body muted>
              {dog.name} · {skill.name}
            </Body>
          </View>
          <Card>
            <Row>
              <Stat value={formatDuration(elapsed)} label="time" />
              <Stat value={`${successes}`} label="clicks" />
              <Stat value={rate === null ? '–' : `${rate}%`} label="success" />
            </Row>
          </Card>
          {hasNextStep && (
            <Pressable
              onPress={() => setAdvance((a) => !a)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: sz(12), backgroundColor: t.card, padding: sz(14), borderRadius: sz(14) }}
            >
              <View
                style={{
                  width: sz(24),
                  height: sz(24),
                  borderRadius: sz(6),
                  borderWidth: 2,
                  borderColor: t.primary,
                  backgroundColor: advance ? t.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {advance && <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '700' }}>Move on to step {progress.step + 2}</Body>
                <Body muted style={{ fontSize: sz(13) }}>
                  {readyForNext ? '80%+ on the last 10 reps — ready to level up!' : 'Recommended once you hit 80% over 10 reps.'}
                </Body>
              </View>
            </Pressable>
          )}
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Notes (optional) — e.g. distracted by birds, great focus after a walk"
            placeholderTextColor={t.muted}
            multiline
            style={{
              backgroundColor: t.card,
              color: t.text,
              borderRadius: sz(14),
              padding: sz(14),
              minHeight: sz(90),
              fontSize: sz(15),
              textAlignVertical: 'top',
            }}
          />
          <View style={{ flex: 1 }} />
          <Button big title="Save session" onPress={save} />
          <Button title="Back to training" variant="ghost" onPress={() => { setFinished(false); setPaused(false); }} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flex: 1, padding: sz(16), gap: sz(14) }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={discard} hitSlop={sz(12)}>
            <Text style={{ color: t.muted, fontSize: sz(16), fontWeight: '600' }}>✕ Cancel</Text>
          </Pressable>
          <Pressable onPress={() => setPaused((p) => !p)} hitSlop={sz(12)}>
            <Text
              style={{
                color: overTime ? t.danger : t.text,
                fontSize: sz(22),
                fontWeight: '800',
                fontVariant: ['tabular-nums'],
              }}
            >
              {paused ? '⏸ ' : '⏱ '}
              {formatDuration(elapsed)}
            </Text>
          </Pressable>
          <Pressable onPress={finish} hitSlop={sz(12)}>
            <Text style={{ color: t.primary, fontSize: sz(16), fontWeight: '800' }}>Finish</Text>
          </Pressable>
        </Row>

        <View style={{ gap: sz(4) }}>
          <H2>{skill.name}</H2>
          <Card style={{ padding: sz(12) }}>
            <Body muted style={{ fontSize: sz(12), fontWeight: '700' }}>
              STEP {Math.min(progress.step, skill.steps.length - 1) + 1} OF {skill.steps.length}
            </Body>
            <Body style={{ marginTop: sz(4) }}>{stepText}</Body>
          </Card>
        </View>

        {(readyForNext || struggling || overTime) && (
          <Card
            style={{
              padding: sz(12),
              backgroundColor: readyForNext ? t.successSoft : t.primarySoft,
              borderColor: 'transparent',
            }}
          >
            <Body style={{ fontWeight: '600' }}>
              {readyForNext
                ? hasNextStep
                  ? `🎉 ${recentRate}% on the last 10 — ready for the next step!`
                  : `🎉 ${recentRate}% on the last 10 — ${dog.name} is nailing this!`
                : struggling
                  ? '🤔 3 misses in a row — make it a little easier for the next rep.'
                  : '⏰ 5 minutes — a great time to end on a win and take a break.'}
            </Body>
          </Card>
        )}

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={onClick}
            accessibilityRole="button"
            accessibilityLabel="Click and count a success"
            style={({ pressed }) => ({
              width: sz(230),
              height: sz(230),
              borderRadius: sz(115),
              backgroundColor: t.primary,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
              shadowColor: t.primary,
              shadowOpacity: 0.35,
              shadowRadius: sz(20),
              shadowOffset: { width: sz(0), height: sz(8) },
              elevation: 8,
            })}
          >
            <Text style={{ color: t.primaryText, fontSize: sz(34), fontWeight: '900', letterSpacing: sz(2) }}>CLICK</Text>
            <Text style={{ color: t.primaryText, opacity: 0.85, marginTop: sz(4) }}>mark + reward</Text>
          </Pressable>
        </View>

        <Card>
          <Row>
            <Stat value={`${successes}`} label="✅ success" />
            <Stat value={`${misses}`} label="✖️ miss" />
            <Stat value={recentRate === null ? '–' : `${recentRate}%`} label="last 10" />
          </Row>
          <Row style={{ gap: sz(4), marginTop: sz(12), justifyContent: 'center', minHeight: sz(10) }}>
            {recent.map((r, i) => (
              <View
                key={i}
                style={{ width: sz(18), height: sz(8), borderRadius: sz(4), backgroundColor: r === 'ok' ? t.success : t.danger }}
              />
            ))}
          </Row>
        </Card>

        <Row>
          <Button title="✖️  Miss" variant="danger" style={{ flex: 1 }} onPress={onMiss} />
          <Button title="↩︎ Undo" variant="secondary" disabled={reps.length === 0} onPress={onUndo} />
        </Row>
      </View>
    </SafeAreaView>
  );
}
