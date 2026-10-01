import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import { useTheme } from '@/theme';

type SymbolName = Extract<SymbolViewProps['name'], { ios?: unknown }>;

/**
 * One semantic name per meaning, mapped to SF Symbols on iOS and
 * Material Symbols on Android and web. Screens never reference raw glyphs.
 */
const glyphs = {
  add: { ios: 'plus', android: 'add', web: 'add' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  chevron: {
    ios: 'chevron.right',
    android: 'chevron_right',
    web: 'chevron_right',
  },
  next: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  library: {
    ios: 'photo.on.rectangle',
    android: 'photo_library',
    web: 'photo_library',
  },
  remove: { ios: 'xmark', android: 'close', web: 'close' },
  pass: {
    ios: 'checkmark.circle.fill',
    android: 'check_circle',
    web: 'check_circle',
  },
  finding: {
    ios: 'exclamationmark.triangle.fill',
    android: 'warning',
    web: 'warning',
  },
  notApplicable: {
    ios: 'minus.circle',
    android: 'do_not_disturb_on',
    web: 'do_not_disturb_on',
  },
  unanswered: {
    ios: 'circle',
    android: 'radio_button_unchecked',
    web: 'radio_button_unchecked',
  },
  checklist: { ios: 'checklist', android: 'checklist', web: 'checklist' },
  completed: { ios: 'checkmark.seal', android: 'verified', web: 'verified' },
  saved: { ios: 'checkmark', android: 'check', web: 'check' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  alert: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
  device: { ios: 'iphone', android: 'phone_iphone', web: 'phone_iphone' },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof glyphs;

interface Props {
  name: IconName;
  size?: number;
  color?: ColorValue;
  weight?: 'regular' | 'medium' | 'semibold';
}

export function Icon({ name, size = 20, color, weight = 'regular' }: Props) {
  const { colors } = useTheme();
  return (
    <SymbolView
      name={glyphs[name]}
      size={size}
      tintColor={color ?? colors.ink}
      weight={weight}
      accessible={false}
      importantForAccessibility="no"
      style={{ width: size, height: size }}
    />
  );
}
