import * as Picker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { Photo } from '../domain/validation';
import { persistPhoto } from './photos';

export type PhotoSource = 'camera' | 'library';

const MAX_EDGE = 1600;

/** The person declined camera access. `canAskAgain` decides whether to link to Settings. */
export class CameraPermissionError extends Error {
  readonly code = 'CAMERA_PERMISSION';
  constructor(readonly canAskAgain: boolean) {
    super(
      canAskAgain
        ? 'Camera access is needed to take a photo. You can choose one from your library instead.'
        : 'Camera access is off. Choose a photo from your library, or allow access in Settings.',
    );
    this.name = 'CameraPermissionError';
  }
}

/**
 * Opens the camera or library and returns the chosen image, or `null` if the
 * person cancels. Camera permission is requested here, at the moment of use.
 */
export async function selectPhoto(
  source: PhotoSource,
): Promise<Picker.ImagePickerAsset | null> {
  if (source === 'camera') {
    const permission = await Picker.requestCameraPermissionsAsync();
    if (!permission.granted)
      throw new CameraPermissionError(permission.canAskAgain);
  }
  const launch =
    source === 'camera'
      ? Picker.launchCameraAsync
      : Picker.launchImageLibraryAsync;
  const result = await launch({
    mediaTypes: ['images'],
    quality: 0.8,
    exif: false,
  });
  return result.canceled ? null : result.assets[0];
}

/**
 * Resizes to at most 1600 px on the long edge, re-encodes as JPEG (dropping
 * embedded metadata) and stores the file in app documents.
 */
export async function storePhoto(
  asset: Picker.ImagePickerAsset,
): Promise<Photo> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > MAX_EDGE || asset.height > MAX_EDGE)
    context.resize(
      asset.width >= asset.height ? { width: MAX_EDGE } : { height: MAX_EDGE },
    );
  const rendered = await context.renderAsync();
  try {
    const saved = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.75,
    });
    return await persistPhoto(saved.uri, saved.width, saved.height);
  } finally {
    rendered.release();
    context.release();
  }
}
