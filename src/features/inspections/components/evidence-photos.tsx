import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  CameraPermissionError,
  selectPhoto,
  storePhoto,
  type PhotoSource,
} from '@/data/capture-photo';
import { photoUri } from '@/data/photos';
import type { Photo } from '@/domain/validation';
import { useAction } from '@/hooks/use-action';
import { confirmDestructive } from '@/lib/confirm';
import { haptics } from '@/lib/haptics';
import { createStyles, radius, space, useTheme } from '@/theme';
import { Button, Icon, Notice, Text } from '@/ui';

const MAX_PHOTOS = 2;

/** A stored photo. A missing file never hides the rest of the record. */
export function EvidenceThumb({
  photo,
  label,
}: {
  photo: Photo;
  label: string;
}) {
  const styles = useStyles();
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <View style={[styles.thumb, styles.missing]}>
        <Text variant="footnote" tone="muted" align="center">
          Photo unavailable
        </Text>
      </View>
    );
  return (
    <Image
      source={{ uri: photoUri(photo) }}
      accessibilityLabel={label}
      contentFit="cover"
      transition={150}
      onError={() => setFailed(true)}
      style={styles.thumb}
    />
  );
}

interface Props {
  photos: Photo[];
  editable: boolean;
  onChange: (photos: Photo[]) => void;
}

/**
 * A two-frame contact sheet. Camera first, library always offered, including
 * when camera access is denied. Removing a photo asks first.
 */
export function EvidencePhotos({ photos, editable, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useStyles();
  const action = useAction();
  const [processing, setProcessing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const canAdd = editable && photos.length < MAX_PHOTOS;

  function add(source: PhotoSource) {
    void action.run(async () => {
      try {
        const asset = await selectPhoto(source);
        if (!asset) return;
        setProcessing(true);
        const photo = await storePhoto(asset).finally(() =>
          setProcessing(false),
        );
        setBlocked(false);
        haptics.tap();
        onChange([...photos, photo]);
      } catch (error) {
        if (error instanceof CameraPermissionError)
          setBlocked(!error.canAskAgain);
        throw error;
      }
    });
  }

  async function remove(index: number) {
    const confirmed = await confirmDestructive({
      title: 'Remove this photo?',
      message: 'It will be deleted from this checkpoint.',
      confirmLabel: 'Remove',
    });
    if (confirmed) onChange(photos.filter((_, i) => i !== index));
  }

  if (!editable && photos.length === 0)
    return (
      <Text variant="subhead" tone="muted">
        No photos attached.
      </Text>
    );

  return (
    <View style={styles.root}>
      {(photos.length > 0 || processing) && (
        <View style={styles.sheet}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.cell}>
              <EvidenceThumb
                photo={photo}
                label={`Evidence photo ${index + 1} of ${photos.length}`}
              />
              {editable && (
                <Pressable
                  onPress={() => void remove(index)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove photo ${index + 1}`}
                  style={({ pressed }) => [
                    styles.removeButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Icon
                    name="remove"
                    size={14}
                    color="#FFFFFF"
                    weight="semibold"
                  />
                </Pressable>
              )}
            </View>
          ))}
          {processing && (
            <View style={[styles.cell, styles.thumb, styles.missing]}>
              <ActivityIndicator color={colors.muted} />
            </View>
          )}
          {photos.length + (processing ? 1 : 0) === 1 && (
            <View style={styles.cell} />
          )}
        </View>
      )}
      {canAdd && !processing && (
        <View style={styles.actions}>
          <View style={styles.action}>
            <Button
              label="Take photo"
              icon="camera"
              variant="secondary"
              compact
              disabled={action.busy}
              onPress={() => add('camera')}
            />
          </View>
          <View style={styles.action}>
            <Button
              label="Library"
              icon="library"
              variant="secondary"
              compact
              disabled={action.busy}
              accessibilityLabel="Choose from library"
              onPress={() => add('library')}
            />
          </View>
        </View>
      )}
      <Notice
        message={action.error}
        action={
          blocked ? (
            <Button
              label="Open Settings"
              variant="secondary"
              compact
              onPress={() => void Linking.openSettings()}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const useStyles = createStyles(({ colors }) => ({
  root: { gap: space.md },
  sheet: { flexDirection: 'row', gap: space.sm },
  cell: { flex: 1 },
  thumb: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.imageOutline,
    backgroundColor: colors.fill,
  },
  missing: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.sm,
  },
  removeButton: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1 },
}));
