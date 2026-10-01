import { useState } from 'react';
import { View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { createStyles, motion, radius, useTheme } from '@/theme';

interface Props {
  value: number;
  total: number;
  accessibilityLabel: string;
}

/**
 * Thin progress track. The fill is absolutely positioned and childless, so
 * animating its width is cheap and keeps the rounded end intact. It renders
 * only after layout, so opening a screen never replays the fill from zero.
 */
export function ProgressBar({ value, total, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const ratio = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: total, now: value }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.track}
    >
      {width > 0 && (
        <Animated.View
          style={[
            styles.fill,
            {
              width: width * ratio,
              backgroundColor: colors.accent,
              transitionProperty: 'width',
              transitionDuration: reduceMotion ? 0 : motion.duration.progress,
              transitionTimingFunction: motion.css.easeOut,
            },
          ]}
        />
      )}
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.rule,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radius.pill,
  },
}));
