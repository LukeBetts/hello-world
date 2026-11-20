import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CATEGORY_EMOJI, type Skill } from '../data/skills';
import { PLAN_LABEL, planState, type PlanState } from '../lib/plan';
import { useActiveDog, useSkillProgress } from '../lib/store';
import { useTheme, type Theme } from '../lib/theme';
import { StatusPill } from './ui';
import { sz } from '../lib/scale';

export function planColor(t: Theme, s: PlanState) {
  switch (s) {
    case 'done':
      return t.success;
    case 'current':
      return t.primary;
    case 'behind':
      return t.danger;
    case 'catchup':
      return '#B7791F';
    default:
      return t.muted;
  }
}

export function SkillRow({ skill, showPlan = true }: { skill: Skill; showPlan?: boolean }) {
  const t = useTheme();
  const dog = useActiveDog();
  const progress = useSkillProgress(skill.id);
  const plan = planState(skill, dog, progress);
  const showTag = showPlan && dog?.birthDate && plan !== 'upcoming';
  const stripe = showTag ? planColor(t, plan) : 'transparent';

  return (
    <Pressable
      onPress={() => router.push(`/skill/${skill.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: sz(12),
        backgroundColor: t.card,
        borderRadius: sz(14),
        padding: sz(14),
        borderLeftWidth: 4,
        borderLeftColor: stripe,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: sz(26) }}>{CATEGORY_EMOJI[skill.category]}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: sz(16), fontWeight: '700', color: t.text }}>{skill.name}</Text>
        <Text style={{ fontSize: sz(13), color: t.muted, marginTop: sz(2) }} numberOfLines={1}>
          {showTag ? (
            <Text style={{ color: planColor(t, plan), fontWeight: '700' }}>{PLAN_LABEL[plan]} · </Text>
          ) : null}
          {skill.summary}
        </Text>
      </View>
      <StatusPill status={progress.status} />
    </Pressable>
  );
}
