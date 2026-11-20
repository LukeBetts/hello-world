import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { confirmAction } from '../../components/ConfirmDialog';
import { SYNC_COPY } from '../../components/SyncBanner';
import { Body, Button, Card, H2, Row, Screen } from '../../components/ui';
import { tapFeedback } from '../../lib/clicker';
import { useStore } from '../../lib/store';
import { useTheme } from '../../lib/theme';

const GOALS = [5, 10, 15, 20, 30];

export default function Dogs() {
  const t = useTheme();
  const { state, dispatch, sync } = useStore();
  const shared = sync !== 'local';

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        {state.dogs.map((d) => {
          const active = d.id === state.activeDogId;
          const count = state.sessions.filter((s) => s.dogId === d.id).length;
          return (
            <Pressable
              key={d.id}
              onPress={() => {
                tapFeedback(state.settings.haptics);
                dispatch({ type: 'setActiveDog', id: d.id });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderRadius: 16,
                backgroundColor: active ? t.primarySoft : t.card,
                borderWidth: 1.5,
                borderColor: active ? t.primary : t.card,
              }}
            >
              <Text style={{ fontSize: 36 }}>{d.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: t.text }}>{d.name}</Text>
                <Body muted style={{ fontSize: 13 }}>
                  {[d.breed, `${count} session${count === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
                </Body>
              </View>
              {active && <Text style={{ color: t.primary, fontWeight: '800' }}>Active</Text>}
              <Pressable onPress={() => router.push({ pathname: '/dog-edit', params: { id: d.id } })} hitSlop={10}>
                <Text style={{ color: t.muted, fontSize: 15, fontWeight: '600' }}>Edit</Text>
              </Pressable>
            </Pressable>
          );
        })}
        <Button title="+ Add a dog" variant="secondary" onPress={() => router.push('/dog-edit')} />
      </View>

      <Card style={{ gap: 10 }}>
        <H2>Daily training goal</H2>
        <Row style={{ gap: 8 }}>
          {GOALS.map((g) => {
            const active = state.settings.dailyGoalMin === g;
            return (
              <Pressable
                key={g}
                onPress={() => dispatch({ type: 'updateSettings', patch: { dailyGoalMin: g } })}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: active ? t.primary : t.track,
                }}
              >
                <Text style={{ fontWeight: '700', color: active ? t.primaryText : t.text }}>{g}m</Text>
              </Pressable>
            );
          })}
        </Row>
        <Body muted style={{ fontSize: 13 }}>
          A few short sessions spread through the day work best.
        </Body>
      </Card>

      <Card style={{ gap: 6 }}>
        <H2>
          {SYNC_COPY[sync].icon} {SYNC_COPY[sync].title}
        </H2>
        <Body muted style={{ fontSize: 13 }}>
          {SYNC_COPY[sync].detail}
        </Body>
        {sync === 'synced' && (
          <Body muted style={{ fontSize: 13 }}>
            To train together, share this page by email from its Share menu and give the person Editor access.
          </Body>
        )}
      </Card>

      <Card style={{ gap: 8 }}>
        <H2>About</H2>
        <Body muted style={{ fontSize: 13 }}>
          Pawsitive uses reward-based (positive reinforcement) methods. For aggression, severe anxiety, or behaviour
          that worries you, please consult a qualified trainer or veterinary behaviourist.
        </Body>
        <Button
          title="Erase all data"
          variant="danger"
          disabled={sync === 'readonly'}
          onPress={() =>
            confirmAction({
              title: 'Erase everything?',
              message: shared
                ? 'All dogs, sessions and progress will be deleted for everyone this page is shared with.'
                : 'All dogs, sessions and progress will be deleted.',
              confirmText: 'Erase',
              onConfirm: () => dispatch({ type: 'reset' }),
            })
          }
        />
      </Card>
    </Screen>
  );
}
