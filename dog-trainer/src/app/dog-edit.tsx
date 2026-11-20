import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { confirmAction } from '../components/ConfirmDialog';
import { Body, Button, Screen } from '../components/ui';
import { ageForInput, birthDateFromAge, type AgeUnit } from '../lib/plan';
import { newId, useStore } from '../lib/store';
import { useTheme } from '../lib/theme';

const EMOJIS = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🐾'];

export default function DogEdit() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, dispatch } = useStore();
  const existing = state.dogs.find((d) => d.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🐶');
  const initialAge = existing?.birthDate ? ageForInput(existing.birthDate) : null;
  const [ageText, setAgeText] = useState(initialAge ? String(initialAge.amount) : '');
  const [ageUnit, setAgeUnit] = useState<AgeUnit>(initialAge?.unit ?? 'weeks');

  const ageAmount = Number(ageText.replace(',', '.'));
  const ageValid = ageText.trim() !== '' && Number.isFinite(ageAmount) && ageAmount >= 0 && ageAmount <= (ageUnit === 'years' ? 25 : ageUnit === 'months' ? 300 : 1300);
  const ageChanged = !initialAge || initialAge.amount !== ageAmount || initialAge.unit !== ageUnit;

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed || !ageValid) return;
    // Only recalculate the birth date when the age was changed, so it doesn't drift.
    const birthDate = existing?.birthDate && !ageChanged ? existing.birthDate : birthDateFromAge(ageAmount, ageUnit);
    if (existing) {
      dispatch({ type: 'updateDog', dog: { ...existing, name: trimmed, breed: breed.trim(), emoji, birthDate } });
    } else {
      dispatch({
        type: 'addDog',
        dog: { id: newId(), name: trimmed, breed: breed.trim(), emoji, createdAt: Date.now(), birthDate },
      });
    }
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    confirmAction({
      title: `Remove ${existing.name}?`,
      message: 'Their sessions and progress will be deleted too.',
      confirmText: 'Remove',
      onConfirm: () => {
        dispatch({ type: 'removeDog', id: existing.id });
        router.back();
      },
    });
  };

  const input = {
    backgroundColor: t.card,
    color: t.text,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: t.border,
  } as const;

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existing ? `Edit ${existing.name}` : 'Add a dog' }} />

      <View style={{ gap: 6 }}>
        <Body style={{ fontWeight: '700' }}>Name</Body>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Biscuit"
          placeholderTextColor={t.muted}
          style={input}
          autoFocus={!existing}
          returnKeyType="next"
        />
      </View>

      <View style={{ gap: 6 }}>
        <Body style={{ fontWeight: '700' }}>Age today</Body>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={ageText}
            onChangeText={setAgeText}
            placeholder="e.g. 9"
            placeholderTextColor={t.muted}
            keyboardType="decimal-pad"
            style={[input, { width: 90, textAlign: 'center' }]}
            accessibilityLabel="Age"
          />
          {(['weeks', 'months', 'years'] as AgeUnit[]).map((u) => (
            <Pressable
              key={u}
              onPress={() => setAgeUnit(u)}
              accessibilityRole="button"
              accessibilityState={{ selected: ageUnit === u }}
              style={{
                flex: 1,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ageUnit === u ? t.primary : t.card,
                borderWidth: 1,
                borderColor: ageUnit === u ? t.primary : t.border,
              }}
            >
              <Text style={{ fontWeight: '700', color: ageUnit === u ? t.primaryText : t.text }}>{u}</Text>
            </Pressable>
          ))}
        </View>
        <Body muted style={{ fontSize: 13 }}>
          Used to build a week-by-week training plan. A rough age is fine.
        </Body>
      </View>

      <View style={{ gap: 6 }}>
        <Body style={{ fontWeight: '700' }}>Breed (optional)</Body>
        <TextInput
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g. Border Collie"
          placeholderTextColor={t.muted}
          style={input}
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Body style={{ fontWeight: '700' }}>Avatar</Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: emoji === e ? t.primarySoft : t.card,
                borderWidth: 2,
                borderColor: emoji === e ? t.primary : t.border,
              }}
            >
              <Text style={{ fontSize: 28 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Button big title={existing ? 'Save' : 'Add dog'} disabled={!name.trim() || !ageValid} onPress={save} />
      {existing && <Button title="Remove dog" variant="danger" onPress={remove} />}
    </Screen>
  );
}
