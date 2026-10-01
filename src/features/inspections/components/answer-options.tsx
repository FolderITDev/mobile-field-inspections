import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import type { AnswerValue } from '@/domain/model';
import { haptics } from '@/lib/haptics';
import { createStyles, motion, radius, space, useTheme } from '@/theme';
import { Icon, PressableScale, Text, type IconName } from '@/ui';

const options: {
  value: AnswerValue;
  label: string;
  hint: string;
  icon: IconName;
  tone: 'accent' | 'attention' | 'muted';
}[] = [
  {
    value: 'pass',
    label: 'Pass',
    hint: 'Meets the expectation',
    icon: 'pass',
    tone: 'accent',
  },
  {
    value: 'fail',
    label: 'Needs attention',
    hint: 'Explain it with a note or a photo',
    icon: 'finding',
    tone: 'attention',
  },
  {
    value: 'na',
    label: 'Not applicable',
    hint: 'Not present at this site',
    icon: 'notApplicable',
    tone: 'muted',
  },
];

interface Props {
  value: AnswerValue | null;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

/**
 * Three large, worded choices sized for gloves and sunlight. Selection
 * crossfades its tint in 160 ms; the icon, word and radio carry the meaning.
 */
export function AnswerOptions({ value, onChange, disabled = false }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View accessibilityRole="radiogroup" style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        const tint = colors[option.tone];
        const subtle =
          option.tone === 'attention'
            ? colors.attentionSubtle
            : option.tone === 'accent'
              ? colors.accentSubtle
              : colors.fill;
        return (
          <PressableScale
            key={option.value}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityHint={option.hint}
            accessibilityState={{ checked: selected, disabled }}
            onPress={() => {
              if (selected) return;
              haptics.selection();
              onChange(option.value);
            }}
          >
            <Animated.View
              style={[
                styles.option,
                {
                  borderColor: selected ? tint : colors.rule,
                  backgroundColor: selected ? subtle : colors.surface,
                  transitionProperty: ['borderColor', 'backgroundColor'],
                  transitionDuration: motion.duration.quick,
                  transitionTimingFunction: motion.css.easeOut,
                },
                disabled && !selected && styles.dimmed,
              ]}
            >
              <Icon
                name={option.icon}
                size={22}
                color={selected ? tint : colors.muted}
              />
              <View style={styles.copy}>
                <Text variant="headline">{option.label}</Text>
                <Text variant="footnote" tone="muted">
                  {option.hint}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? tint : colors.control },
                ]}
              >
                {selected && (
                  <View style={[styles.dot, { backgroundColor: tint }]} />
                )}
              </View>
            </Animated.View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = createStyles(() => ({
  group: { gap: space.sm },
  option: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  dimmed: { opacity: 0.5 },
  copy: { flex: 1, gap: space.xxs },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
}));
