import { View } from 'react-native';
import type { AnswerState } from '@/domain/model';
import { createStyles, space, useTheme } from '@/theme';
import { Icon, Text, type IconName, type Tone } from '@/ui';

export const answerMeta: Record<
  AnswerState,
  { icon: IconName; label: string; tone: Tone }
> = {
  pass: { icon: 'pass', label: 'Pass', tone: 'accent' },
  finding: { icon: 'finding', label: 'Needs attention', tone: 'attention' },
  findingNeedsContext: {
    icon: 'finding',
    label: 'Needs a note or photo',
    tone: 'attention',
  },
  notApplicable: {
    icon: 'notApplicable',
    label: 'Not applicable',
    tone: 'muted',
  },
  unanswered: { icon: 'unanswered', label: 'Not answered', tone: 'tertiary' },
};

/** Icon plus a word: an answer is never shown by color alone. */
export function AnswerLabel({
  state,
  suffix,
}: {
  state: AnswerState;
  suffix?: string;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const meta = answerMeta[state];
  return (
    <View style={styles.row}>
      <Icon name={meta.icon} size={15} color={colors[meta.tone]} />
      <Text
        variant="footnote"
        tone={meta.tone === 'tertiary' ? 'muted' : meta.tone}
      >
        {meta.label}
        {suffix ? ` · ${suffix}` : ''}
      </Text>
    </View>
  );
}

const useStyles = createStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 },
}));
