import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRecord, useStore } from '@/data/store';
import {
  answerState,
  checklist,
  completeInspection,
  summarize,
} from '@/domain/model';
import { useAction } from '@/hooks/use-action';
import { haptics } from '@/lib/haptics';
import { ordinal } from '@/lib/format';
import { createStyles, space } from '@/theme';
import {
  Block,
  Button,
  EmptyState,
  Footer,
  HeaderButton,
  Notice,
  ScrollScreen,
  Section,
  Separator,
  Text,
} from '@/ui';
import { AnswerLabel } from './components/answer-label';
import { EvidenceThumb } from './components/evidence-photos';

export function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useRecord(id);
  const { change } = useStore();
  const styles = useStyles();
  const action = useAction();
  /** Set once the write succeeds, so the dismiss animation keeps this screen intact. */
  const [completed, setCompleted] = useState(false);

  if (!record || (record.status === 'completed' && !completed))
    return (
      <ScrollScreen>
        <EmptyState
          icon="completed"
          title={record ? 'Already completed' : 'Inspection not found'}
          body={
            record
              ? 'This inspection is read-only.'
              : 'It may have been deleted on this device.'
          }
        >
          <Button label="Close" onPress={() => router.back()} />
        </EmptyState>
      </ScrollScreen>
    );

  const summary = summarize(record);
  const findings = checklist
    .map((item, index) => ({
      item,
      index,
      answer: record.answers.find((a) => a.key === item.key)!,
    }))
    .filter(({ answer }) => answer.response === 'fail');
  const ready = summary.recorded === summary.total;

  function complete() {
    void action.run(async () => {
      await change(id, (old) => completeInspection(old));
      haptics.success();
      setCompleted(true);
      router.back();
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
        }}
      />
      <ScrollScreen
        footer={
          <Footer>
            <Button
              label="Complete inspection"
              icon="completed"
              busy={action.busy}
              disabled={!ready}
              onPress={complete}
            />
          </Footer>
        }
      >
        <Block gap={space.xs}>
          <Text variant="eyebrow" tone="muted" caps>
            General facilities
          </Text>
          <Text variant="display" accessibilityRole="header">
            {record.site}
          </Text>
        </Block>

        <View style={styles.tally}>
          <Tally value={summary.passed} label="Passed" first />
          <View style={styles.tallyRule} />
          <Tally value={summary.findings} label="Need attention" />
          <View style={styles.tallyRule} />
          <Tally value={summary.notApplicable} label="Not applicable" />
        </View>

        <Section title="Findings">
          {findings.length === 0 ? (
            <Text variant="body" tone="muted" style={styles.empty}>
              No findings. Every checkpoint passed or was not applicable.
            </Text>
          ) : (
            findings.map(({ item, index, answer }, position) => (
              <View key={item.key}>
                {position > 0 && <Separator inset={space.gutter} />}
                <View style={styles.finding}>
                  <Text
                    variant="ordinal"
                    tone="attention"
                    tabular
                    style={styles.findingNumber}
                  >
                    {ordinal(index)}
                  </Text>
                  <View style={styles.findingBody}>
                    <Text variant="headline">{item.title}</Text>
                    <AnswerLabel state={answerState(answer)} />
                    {answer.note ? (
                      <Text
                        variant="body"
                        selectable
                        style={styles.findingNote}
                      >
                        {answer.note}
                      </Text>
                    ) : null}
                    {answer.photos.length > 0 && (
                      <View style={styles.photos}>
                        {answer.photos.map((photo, i) => (
                          <View key={photo.id} style={styles.photo}>
                            <EvidenceThumb
                              photo={photo}
                              label={`${item.title}, photo ${i + 1}`}
                            />
                          </View>
                        ))}
                        {answer.photos.length === 1 && (
                          <View style={styles.photo} />
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </Section>

        <Block gap={space.md}>
          <Text variant="footnote" tone="muted">
            Completing records this device’s time and makes the inspection
            read-only.
          </Text>
          <Notice message={action.error} />
        </Block>
      </ScrollScreen>
    </>
  );
}

function Tally({
  value,
  label,
  first = false,
}: {
  value: number;
  label: string;
  first?: boolean;
}) {
  const styles = useStyles();
  return (
    <View
      style={[styles.tallyCell, first && styles.tallyFirst]}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Text variant="display" tabular>
        {value}
      </Text>
      <Text variant="footnote" tone="muted">
        {label}
      </Text>
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  tally: {
    flexDirection: 'row',
    marginHorizontal: space.gutter,
    paddingVertical: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.rule,
  },
  tallyCell: { flex: 1, gap: space.xxs, paddingHorizontal: space.md },
  tallyFirst: { paddingLeft: 0 },
  tallyRule: { width: StyleSheet.hairlineWidth, backgroundColor: colors.rule },
  empty: { paddingHorizontal: space.gutter, paddingVertical: space.lg },
  finding: {
    flexDirection: 'row',
    gap: space.md,
    paddingHorizontal: space.gutter,
    paddingVertical: space.lg,
  },
  findingNumber: { width: 32, marginTop: -2 },
  findingBody: { flex: 1, gap: space.xs },
  findingNote: { marginTop: space.xs },
  photos: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  photo: { flex: 1 },
}));
