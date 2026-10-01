import { View } from 'react-native';
import { answerState, type Answer } from '@/domain/model';
import { ordinal } from '@/lib/format';
import { createStyles, space } from '@/theme';
import { Row, Text } from '@/ui';
import { AnswerLabel, answerMeta } from './answer-label';

interface Props {
  index: number;
  title: string;
  answer: Answer;
  /** The first checkpoint that still needs work is set in the accent color. */
  next: boolean;
  onPress: () => void;
}

/** One line of the editorial index: numeral, checkpoint, answer in words. */
export function ChecklistRow({ index, title, answer, next, onPress }: Props) {
  const styles = useStyles();
  const state = answerState(answer);
  const photos = answer.photos.length;
  const extras = [
    next ? 'Up next' : null,
    photos ? `${photos} ${photos === 1 ? 'photo' : 'photos'}` : null,
  ].filter(Boolean);
  return (
    <Row
      onPress={onPress}
      navigates
      accessibilityLabel={`${index + 1}. ${title}. ${answerMeta[state].label}${
        extras.length ? `. ${extras.join(', ')}` : ''
      }.`}
    >
      <View style={styles.layout}>
        <Text
          variant="ordinal"
          tone={next ? 'accent' : 'tertiary'}
          tabular
          style={styles.ordinal}
        >
          {ordinal(index)}
        </Text>
        <View style={styles.body}>
          <Text variant="headline">{title}</Text>
          <AnswerLabel
            state={state}
            suffix={extras.length ? extras.join(' · ') : undefined}
          />
        </View>
      </View>
    </Row>
  );
}

/** Left inset that aligns separators with the row text, past the numeral column. */
export const CHECKLIST_TEXT_INSET = space.gutter + 32 + space.md;

const useStyles = createStyles(() => ({
  layout: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  ordinal: { width: 32, marginTop: -2 },
  body: { flex: 1, gap: space.xs },
}));
