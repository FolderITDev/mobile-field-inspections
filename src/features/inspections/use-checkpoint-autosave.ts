import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useStore } from '@/data/store';
import { saveAnswer, type Answer } from '@/domain/model';
import { message } from '@/domain/validation';
import { haptics } from '@/lib/haptics';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

type Patch = Partial<Omit<Answer, 'key'>>;

const NOTE_DEBOUNCE_MS = 600;

/**
 * Saves one checkpoint as the person works. Answers and photos write at once;
 * note keystrokes are batched. Unsaved patches survive a failed write and are
 * retried with the next change or `flush`. Leaving the screen flushes first and
 * only asks to discard when the write actually failed.
 */
export function useCheckpointAutosave(inspectionId: string, key: string) {
  const { change } = useStore();
  const navigation = useNavigation();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<Patch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(async (): Promise<boolean> => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return true;
    pending.current = {};
    setStatus('saving');
    setError(null);
    try {
      await change(inspectionId, (old) => saveAnswer(old, key, patch));
      if (Object.keys(pending.current).length === 0) setStatus('saved');
      return true;
    } catch (e) {
      pending.current = { ...patch, ...pending.current };
      setStatus('failed');
      setError(message(e));
      haptics.error();
      return false;
    }
  }, [change, inspectionId, key]);

  const update = useCallback(
    (patch: Patch, { debounce = false } = {}) => {
      pending.current = { ...pending.current, ...patch };
      setStatus('saving');
      clearTimeout(timer.current);
      if (debounce)
        timer.current = setTimeout(() => void flush(), NOTE_DEBOUNCE_MS);
      else void flush();
    },
    [flush],
  );

  // Write anything still batched if the screen unmounts (for example, Next).
  useEffect(
    () => () => {
      void flush();
    },
    [flush],
  );

  usePreventRemove(status === 'saving' || status === 'failed', ({ data }) => {
    void flush().then((saved) => {
      if (saved) return navigation.dispatch(data.action);
      const discard = () => {
        pending.current = {};
        navigation.dispatch(data.action);
      };
      if (Platform.OS === 'web') {
        if (window.confirm('Your latest change was not saved. Leave anyway?'))
          discard();
        return;
      }
      Alert.alert(
        'Change not saved',
        'Your latest change could not be saved on this device.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard change', style: 'destructive', onPress: discard },
        ],
      );
    });
  });

  return { status, error, update, flush };
}
