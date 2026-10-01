import { useState } from 'react';
import { View } from 'react-native';
import { router, Stack } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { useStore } from '@/data/store';
import { checklist, createInspection } from '@/domain/model';
import { useAction } from '@/hooks/use-action';
import { useUnsavedGuard } from '@/hooks/use-unsaved-guard';
import { haptics } from '@/lib/haptics';
import { createStyles, space } from '@/theme';
import {
  Block,
  HeaderButton,
  Notice,
  ScrollScreen,
  Section,
  Separator,
  Text,
  TextField,
} from '@/ui';

const groups = [...new Set(checklist.map((item) => item.group))].map(
  (group) => ({
    group,
    items: checklist.filter((item) => item.group === group),
  }),
);

export function NewInspectionScreen() {
  const { add } = useStore();
  const styles = useStyles();
  const action = useAction();
  const [site, setSite] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const allowLeave = useUnsavedGuard(
    Boolean(site.trim()),
    'This inspection has not been started yet.',
  );
  const error = site.trim() ? null : 'Enter the site you are inspecting.';

  function start() {
    setSubmitted(true);
    if (error) {
      haptics.error();
      return;
    }
    void action.run(async () => {
      const record = createInspection(randomUUID(), site);
      await add(record);
      haptics.success();
      allowLeave();
      router.replace({
        pathname: '/inspection/[id]',
        params: { id: record.id },
      });
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <HeaderButton
              label="Cancel"
              accessibilityLabel="Cancel"
              onPress={() => router.back()}
            />
          ),
          headerRight: () => (
            <HeaderButton
              label="Start"
              prominent
              accessibilityLabel="Start inspection"
              busy={action.busy}
              onPress={start}
            />
          ),
        }}
      />
      <ScrollScreen>
        <Block gap={space.lg}>
          <TextField
            label="Site"
            requirement="required"
            value={site}
            onChangeText={setSite}
            placeholder="North workshop"
            hint="The building or area you are walking."
            error={submitted ? error : null}
            autoCapitalize="words"
            autoFocus
            maxLength={100}
            returnKeyType="go"
            onSubmitEditing={start}
          />
          <Notice message={action.error} />
        </Block>
        <Section title="General facilities · 8 checkpoints">
          {groups.map(({ group, items }, index) => (
            <View key={group}>
              {index > 0 && <Separator inset={space.gutter} />}
              <View style={styles.group}>
                <Text variant="label">{group}</Text>
                <Text variant="subhead" tone="muted">
                  {items.map((item) => item.title).join(' · ')}
                </Text>
              </View>
            </View>
          ))}
        </Section>
      </ScrollScreen>
    </>
  );
}

const useStyles = createStyles(() => ({
  group: {
    gap: space.xxs,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.gutter,
  },
}));
