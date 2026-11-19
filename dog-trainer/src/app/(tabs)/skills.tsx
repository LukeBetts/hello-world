import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SkillRow } from '../../components/SkillRow';
import { Chip, H2, Screen } from '../../components/ui';
import { CATEGORIES, CATEGORY_EMOJI, SKILLS, type Category } from '../../data/skills';

export default function Skills() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const categories = filter === 'All' ? CATEGORIES : [filter];

  return (
    <Screen>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip label="All" active={filter === 'All'} onPress={() => setFilter('All')} />
        {CATEGORIES.map((c) => (
          <Chip key={c} label={`${CATEGORY_EMOJI[c]} ${c}`} active={filter === c} onPress={() => setFilter(c)} />
        ))}
      </ScrollView>

      {categories.map((cat) => (
        <View key={cat} style={{ gap: 8 }}>
          <H2>{cat}</H2>
          {SKILLS.filter((s) => s.category === cat).map((s) => (
            <SkillRow key={s.id} skill={s} />
          ))}
        </View>
      ))}
    </Screen>
  );
}
