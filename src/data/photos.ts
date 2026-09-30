import { Directory, File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import type { Photo } from '../domain/validation';
/** Unreferenced files younger than this may belong to a save still in flight. */
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;
const directory = () => new Directory(Paths.document, 'evidence');
export async function persistPhoto(
  uri: string,
  width: number,
  height: number,
): Promise<Photo> {
  const dir = directory();
  await dir.create({ idempotent: true, intermediates: true });
  const id = randomUUID();
  const name = `photo-${id}.jpg`;
  const target = new File(dir, name);
  await new File(uri).copy(target);
  return { id, path: name, width, height };
}
export function photoUri(photo: Photo): string {
  return new File(directory(), photo.path).uri;
}
export async function cleanupPhotos(
  used: Photo[],
  immediate = false,
): Promise<void> {
  const dir = directory();
  if (!dir.exists) return;
  const paths = new Set(used.map((p) => p.path));
  for (const item of dir.list()) {
    if (
      item instanceof File &&
      !paths.has(item.name) &&
      (immediate ||
        Date.now() - (item.modificationTime ?? Date.now()) > ORPHAN_GRACE_MS)
    )
      await item.delete();
  }
}

export async function deletePhotos(removed: Photo[]): Promise<void> {
  for (const photo of removed) {
    const file = new File(directory(), photo.path);
    if (file.exists) await file.delete();
  }
}
