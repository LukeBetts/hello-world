import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Body, Button, Screen } from '../components/ui';
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

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existing) {
      dispatch({ type: 'updateDog', dog: { ...existing, name: trimmed, breed: breed.trim(), emoji } });
    } else {
      dispatch({ type: 'addDog', dog: { id: newId(), name: trimmed, breed: breed.trim(), emoji, createdAt: Date.now() } });
    }
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert(`Remove ${existing.name}?`, 'Their sessions and progress will be deleted too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          dispatch({ type: 'removeDog', id: existing.id });
          router.back();
        },
      },
    ]);
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

      <Button big title={existing ? 'Save' : 'Add dog'} disabled={!name.trim()} onPress={save} />
      {existing && <Button title="Remove dog" variant="danger" onPress={remove} />}
    </Screen>
  );
}
