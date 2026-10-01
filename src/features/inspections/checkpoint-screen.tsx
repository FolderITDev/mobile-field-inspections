import { useState } from 'react';
import { View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useRecord } from '@/data/store';
import {
  answerState,
  checklist,
  type Answer,
  type AppRecord,
} from '@/domain/model';
import { createStyles, motion, space, useTheme } from '@/theme';
import {
  Block,
  Button,
  EmptyState,
  Footer,
  Icon,
  Notice,
  ScrollScreen,
  Text,
  TextField,
} from '@/ui';
import { AnswerOptions } from './components/answer-options';
import { EvidencePhotos } from './components/evidence-photos';
import {
  useCheckpointAutosave,
  type SaveStatus,
} from './use-checkpoint-autosave';

const HINT_ENTER = FadeIn.duration(motion.duration.quick).easing(
  motion.easing.easeOut,
);
const HINT_EXIT = FadeOut.duration(motion.duration.press).easing(
  motion.easing.easeOut,
);

export function CheckpointScreen() {
  const { id, key } = useLocalSearchParams<{ id: string; key: string }>();
  const record = useRecord(id);
  const answer = record?.answers.find((a) => a.key === key);
  const index = checklist.findIndex((item) => item.key === key);

  if (!record || !answer || index < 0)
    return (
      <ScrollScreen>
        <EmptyState
          icon="checklist"
          title="Checkpoint not found"
          body="The inspection may have been deleted on this device."
        >
          <Button label="Back" onPress={() => router.back()} />
        </EmptyState>
      </ScrollScreen>
    );

  // Keyed so each checkpoint gets fresh local state and its own autosave.
  return (
    <CheckpointEditor key={key} record={record} answer={answer} index={index} />
  );
}

interface EditorProps {
  record: AppRecord;
  answer: Answer;
  index: number;
}

function CheckpointEditor({ record, answer, index }: EditorProps) {
  const styles = useStyles();
  const item = checklist[index];
  const next = checklist[index + 1];
  const locked = record.status === 'completed';
  const [note, setNote] = useState(answer.note);
  const autosave = useCheckpointAutosave(record.id, item.key);
  const state = answerState({ ...answer, note });

  async function goNext() {
    if (!(await autosave.flush())) return;
    if (next) router.setParams({ key: next.key });
    else router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{ title: `${index + 1} of ${checklist.length}` }}
      />
      <ScrollScreen
        footer={
          <Footer>
            <Button
              label={next ? `Next: ${next.title}` : 'Back to checklist'}
              icon={next ? 'next' : 'checklist'}
              variant={next ? 'primary' : 'secondary'}
              onPress={() => void goNext()}
            />
          </Footer>
        }
      >
        <Block gap={space.sm}>
          <Text variant="eyebrow" tone="muted" caps>
            {item.group} · {item.title}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {item.prompt}
          </Text>
          {!locked && <SaveIndicator status={autosave.status} />}
        </Block>

        <Block gap={space.md}>
          <AnswerOptions
            value={answer.response}
            disabled={locked}
            onChange={(response) => autosave.update({ response })}
          />
          {state === 'findingNeedsContext' && (
            <Animated.View entering={HINT_ENTER} exiting={HINT_EXIT}>
              <FindingHint />
            </Animated.View>
          )}
        </Block>

        <Block>
          {locked ? (
            <View style={styles.readOnly}>
              <Text variant="label">Note</Text>
              <Text variant="body" tone={note ? 'ink' : 'muted'} selectable>
                {note || 'No note added.'}
              </Text>
            </View>
          ) : (
            <TextField
              label="Note"
              requirement={answer.response === 'fail' ? undefined : 'optional'}
              value={note}
              onChangeText={(value) => {
                setNote(value);
                autosave.update({ note: value }, { debounce: true });
              }}
              onBlur={() => void autosave.flush()}
              placeholder="What did you notice?"
              multiline
              maxLength={1000}
            />
          )}
        </Block>

        <Block gap={space.md}>
          <View style={styles.labelRow}>
            <Text variant="label">Photos</Text>
            {!locked && (
              <Text variant="footnote" tone="muted">
                Optional · Up to 2
              </Text>
            )}
          </View>
          <EvidencePhotos
            photos={answer.photos}
            editable={!locked}
            onChange={(photos) => autosave.update({ photos })}
          />
        </Block>

        {autosave.status === 'failed' && (
          <Block>
            <Notice
              message={autosave.error}
              action={
                <Button
                  label="Try again"
                  variant="secondary"
                  compact
                  onPress={() => void autosave.flush()}
                />
              }
            />
          </Block>
        )}
      </ScrollScreen>
    </>
  );
}

/** A stable label, never a spinner that flickers on each keystroke. */
function SaveIndicator({ status }: { status: SaveStatus }) {
  const { colors } = useTheme();
  const styles = useStyles();
  // Keep the row mounted but invisible once saved, so content never shifts.
  const visible = status === 'saving' || status === 'failed';
  const label = status === 'failed' ? 'Not saved' : 'Saving…';
  return (
    <View
      style={[styles.saveRow, !visible && styles.hidden]}
      accessible={visible}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
    >
      <Icon
        name={status === 'failed' ? 'alert' : 'saved'}
        size={13}
        color={status === 'failed' ? colors.attention : colors.tertiary}
        weight="semibold"
      />
      <Text
        variant="footnote"
        tone={status === 'failed' ? 'attention' : 'muted'}
      >
        {label}
      </Text>
    </View>
  );
}

function FindingHint() {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.hint}>
      <Icon name="finding" size={16} color={colors.attention} />
      <Text variant="subhead" style={styles.hintText}>
        A finding needs a note or a photo before the inspection can be
        completed.
      </Text>
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    marginTop: space.xs,
  },
  hidden: { opacity: 0 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  readOnly: { gap: space.sm },
  hint: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
    padding: space.md,
    borderRadius: 10,
    backgroundColor: colors.attentionSubtle,
  },
  hintText: { flex: 1 },
}));
