import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SkillRow } from '../../components/SkillRow';
import { Body, Chip, Screen } from '../../components/ui';
import { PLAN_WEEKS, SKILLS } from '../../data/skills';
import { ageInWeeks, formatAge, planState, type PlanState } from '../../lib/plan';
import { useActiveDog, useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';
import { sz } from '../../lib/scale';

type Filter = 'all' | 'todo' | 'behind' | 'done';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'This week' },
  { id: 'behind', label: 'Behind' },
  { id: 'done', label: 'Done' },
];

const MATCH: Record<Filter, PlanState[]> = {
  all: ['done', 'current', 'behind', 'catchup', 'upcoming'],
  todo: ['current'],
  behind: ['behind', 'catchup'],
  done: ['done'],
};

export default function Skills() {
  const t = useTheme();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<Filter>('all');
  const { state } = useStore();
  const dog = useActiveDog();
  const progress = (dog && state.progress[dog.id]) || {};
  const hasAge = !!dog?.birthDate;
  const now = Date.now();
  const age = ageInWeeks(dog, now);

  useEffect(() => {
    if (params.filter && FILTERS.some((f) => f.id === params.filter)) setFilter(params.filter as Filter);
  }, [params.filter]);

  const visible = SKILLS.filter((s) => MATCH[filter].includes(planState(s, dog, progress[s.id], now)));

  return (
    <Screen>
      {!hasAge && dog && (
        <Pressable
          onPress={() => router.push({ pathname: '/dog-edit', params: { id: dog.id } })}
          style={{ backgroundColor: t.primarySoft, borderRadius: sz(14), padding: sz(14) }}
        >
          <Body>
            <Text style={{ fontWeight: '700' }}>Add {dog.name}'s age</Text> to see which skills are due each week and
            whether you're on track. Tap to add it.
          </Body>
        </Pressable>
      )}

      {hasAge && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: sz(8) }}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} active={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </ScrollView>
      )}

      {visible.length === 0 && (
        <Body muted style={{ textAlign: 'center', paddingVertical: sz(24) }}>
          {filter === 'behind'
            ? 'Nothing overdue. You are on track!'
            : filter === 'todo'
              ? 'No new skills are scheduled this week. A good week to practise or catch up.'
              : 'Nothing here yet.'}
        </Body>
      )}

      {PLAN_WEEKS.map((week) => {
        const skills = visible.filter((s) => s.week === week);
        if (skills.length === 0) return null;
        const isNow = age === week;
        const isPast = age !== null && week < age;
        return (
          <View key={week} style={{ gap: sz(8) }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: sz(8), flexWrap: 'wrap' }}>
              <Text style={{ fontSize: sz(18), fontWeight: '800', color: t.text }}>
                Week {week}
              </Text>
              <Text style={{ fontSize: sz(14), color: t.muted }}>{formatAge(week)} old</Text>
              {isNow && (
                <View style={{ backgroundColor: t.primary, borderRadius: sz(999), paddingHorizontal: sz(8), paddingVertical: sz(2) }}>
                  <Text style={{ color: t.primaryText, fontSize: sz(12), fontWeight: '800' }}>{dog?.name} is here</Text>
                </View>
              )}
              {isPast && !isNow && <Text style={{ fontSize: sz(12), color: t.muted }}>· past</Text>}
            </View>
            {skills.map((s) => (
              <SkillRow key={s.id} skill={s} />
            ))}
          </View>
        );
      })}
    </Screen>
  );
}
