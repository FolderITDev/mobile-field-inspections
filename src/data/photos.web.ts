import { randomUUID } from 'expo-crypto';
import type { Photo } from '../domain/validation';
/** Keeps data URLs well inside typical IndexedDB quotas. */
const MAX_PHOTO_BYTES = 2_500_000;
export async function persistPhoto(
  uri: string,
  width: number,
  height: number,
): Promise<Photo> {
  const response = await fetch(uri);
  const blob = await response.blob();
  if (blob.size > MAX_PHOTO_BYTES)
    throw new Error(
      'Please choose a smaller photo (under 2.5 MB after processing).',
    );
  const path = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { id: randomUUID(), path, width, height };
}
export function photoUri(photo: Photo): string {
  return photo.path;
}
export async function cleanupPhotos(
  _used: Photo[],
  _immediate = false,
): Promise<void> {
  /* IndexedDB owns image data together with each aggregate. */
}

export async function deletePhotos(_removed: Photo[]): Promise<void> {}
