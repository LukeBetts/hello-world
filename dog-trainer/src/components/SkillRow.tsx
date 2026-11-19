import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CATEGORY_EMOJI, type Skill } from '../data/skills';
import { useSkillProgress } from '../lib/store';
import { useTheme } from '../lib/theme';
import { StatusPill } from './ui';

export function SkillRow({ skill }: { skill: Skill }) {
  const t = useTheme();
  const progress = useSkillProgress(skill.id);
  return (
    <Pressable
      onPress={() => router.push(`/skill/${skill.id}`)}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: t.card,
        borderRadius: 14,
        padding: 14,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 26 }}>{CATEGORY_EMOJI[skill.category]}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: t.text }}>{skill.name}</Text>
        <Text style={{ fontSize: 13, color: t.muted, marginTop: 2 }} numberOfLines={1}>
          {'●'.repeat(skill.level)}
          {'○'.repeat(3 - skill.level)} · {skill.summary}
        </Text>
      </View>
      <StatusPill status={progress.status} />
    </Pressable>
  );
}
