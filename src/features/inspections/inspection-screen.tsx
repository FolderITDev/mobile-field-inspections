import { useState } from 'react';
import { View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useRecord, useStore } from '@/data/store';
import { checklist, summarize, type AppRecord } from '@/domain/model';
import { useAction } from '@/hooks/use-action';
import { confirmDestructive } from '@/lib/confirm';
import { formatDateTime } from '@/lib/format';
import { createStyles, motion, space, useTheme } from '@/theme';
import {
  Block,
  Button,
  EmptyState,
  Footer,
  Icon,
  Notice,
  ProgressBar,
  ScrollScreen,
  Section,
  Separator,
  Text,
} from '@/ui';
import { CHECKLIST_TEXT_INSET, ChecklistRow } from './components/checklist-row';

const COMPLETED_ENTER = FadeIn.duration(motion.duration.enter).easing(
  motion.easing.easeOut,
);

const groups = [...new Set(checklist.map((item) => item.group))];

export function InspectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const stored = useRecord(id);
  /** Keeps a deleted inspection on screen while the back transition runs. */
  const [leaving, setLeaving] = useState<AppRecord>();
  const record = stored ?? leaving;
  const [openedAs] = useState(stored?.status);
  const { remove } = useStore();
  const { colors } = useTheme();
  const styles = useStyles();
  const action = useAction();

  if (!record)
    return (
      <ScrollScreen>
        <EmptyState
          icon="checklist"
          title="Inspection not found"
          body="It may have been deleted on this device."
        >
          <Button label="Back to inspections" onPress={() => router.back()} />
        </EmptyState>
      </ScrollScreen>
    );

  const summary = summarize(record);
  const completed = record.status === 'completed';
  const justCompleted = completed && openedAs === 'draft';
  const next = checklist.find((item) => item.key === summary.nextKey);
  const remaining = summary.total - summary.recorded;

  function openCheckpoint(key: string) {
    router.push({ pathname: '/checkpoint/[id]', params: { id, key } });
  }

  const deleteInspection = async () => {
    const confirmed = await confirmDestructive({
      title: `Delete ${record.site}?`,
      message:
        'The inspection, its notes and photos will be removed from this device. This cannot be undone.',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;
    await action.run(async () => {
      setLeaving(record);
      await remove([record.id]);
      router.back();
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: completed ? 'Report' : 'Inspection' }} />
      <ScrollScreen
        footer={
          completed ? undefined : (
            <Footer>
              {next ? (
                <>
                  <Text variant="footnote" tone="muted" align="center">
                    {remaining} {remaining === 1 ? 'checkpoint' : 'checkpoints'}{' '}
                    left
                  </Text>
                  <Button
                    label={`Continue: ${next.title}`}
                    icon="next"
                    onPress={() => openCheckpoint(next.key)}
                  />
                </>
              ) : (
                <Button
                  label="Review and complete"
                  icon="completed"
                  onPress={() =>
                    router.push({ pathname: '/review/[id]', params: { id } })
                  }
                />
              )}
            </Footer>
          )
        }
      >
        <Block gap={space.sm}>
          <Text variant="eyebrow" tone="muted" caps>
            General facilities
          </Text>
          <Text variant="display" accessibilityRole="header">
            {record.site}
          </Text>
          <Animated.View
            key={record.status}
            entering={justCompleted ? COMPLETED_ENTER : undefined}
            style={styles.status}
          >
            <Icon
              name={completed ? 'completed' : 'device'}
              size={15}
              color={completed ? colors.accent : colors.muted}
            />
            <Text variant="footnote" tone={completed ? 'accent' : 'muted'}>
              {completed
                ? `Completed ${formatDateTime(record.completedAt!)} · Read-only`
                : 'Draft'}
            </Text>
          </Animated.View>
        </Block>

        <Block gap={space.sm}>
          <View style={styles.progressHeading}>
            <Text variant="label" tabular>
              {summary.recorded} of {summary.total} recorded
            </Text>
            {summary.findings > 0 && (
              <View style={styles.status}>
                <Icon name="finding" size={14} color={colors.attention} />
                <Text variant="footnote" tone="attention" tabular>
                  {summary.findings} need{summary.findings === 1 ? 's' : ''}{' '}
                  attention
                </Text>
              </View>
            )}
          </View>
          <ProgressBar
            value={summary.recorded}
            total={summary.total}
            accessibilityLabel="Checklist progress"
          />
        </Block>

        {groups.map((group) => (
          <Section key={group} title={group}>
            {checklist
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => item.group === group)
              .map(({ item, index }, position) => (
                <View key={item.key}>
                  {position > 0 && <Separator inset={CHECKLIST_TEXT_INSET} />}
                  <ChecklistRow
                    index={index}
                    title={item.title}
                    answer={record.answers.find((a) => a.key === item.key)!}
                    next={!completed && item.key === summary.nextKey}
                    onPress={() => openCheckpoint(item.key)}
                  />
                </View>
              ))}
          </Section>
        ))}

        <Block gap={space.lg}>
          <Notice message={action.error} />
          <View style={styles.destructive}>
            <Button
              label="Delete inspection"
              icon="trash"
              variant="destructive"
              compact
              busy={action.busy}
              onPress={() => void deleteInspection()}
            />
          </View>
        </Block>
      </ScrollScreen>
    </>
  );
}

const useStyles = createStyles(() => ({
  status: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
  progressHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  destructive: { alignItems: 'flex-start', marginLeft: -space.sm },
}));
