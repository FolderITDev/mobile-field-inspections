export interface BaseRecord {
  id: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}
export interface Photo {
  id: string;
  path: string;
  width: number;
  height: number;
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Stored data is not a valid record.');
  return value as Record<string, unknown>;
}
export function text(
  value: unknown,
  label: string,
  max = 200,
  allowEmpty = false,
): string {
  if (
    typeof value !== 'string' ||
    (!allowEmpty && !value.trim()) ||
    value.length > max
  )
    throw new Error(
      `${label} must be ${allowEmpty ? 'at most' : 'between 1 and'} ${max} characters.`,
    );
  return value.trim();
}
export function integer(
  value: unknown,
  label: string,
  min = 0,
  max = 999999,
): number {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  )
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  return value;
}
export function choice<T extends string>(
  value: unknown,
  choices: readonly T[],
): T {
  if (typeof value !== 'string' || !choices.includes(value as T))
    throw new Error('Stored data contains an unsupported value.');
  return value as T;
}
export function timestamp(value: unknown): string {
  const result = text(value, 'Date', 40);
  if (!Number.isFinite(Date.parse(result))) throw new Error('Invalid date.');
  return result;
}
export function base(value: Record<string, unknown>): BaseRecord {
  return {
    id: text(value.id, 'ID', 100),
    revision: integer(value.revision, 'Revision', 1),
    createdAt: timestamp(value.createdAt),
    updatedAt: timestamp(value.updatedAt),
  };
}
export function array<T>(
  value: unknown,
  parse: (item: unknown) => T,
  max = 500,
): T[] {
  if (!Array.isArray(value) || value.length > max)
    throw new Error('Invalid list.');
  return value.map(parse);
}
export function photo(value: unknown): Photo {
  const p = object(value);
  const path = text(p.path, 'Photo path', 4000000);
  if (
    !/^photo-[a-zA-Z0-9-]+\.jpg$/.test(path) &&
    !/^data:image\/(jpeg|png);base64,/.test(path)
  )
    throw new Error('Invalid photo location.');
  return {
    id: text(p.id, 'Photo ID', 100),
    path,
    width: integer(p.width, 'Width', 1, 10000),
    height: integer(p.height, 'Height', 1, 10000),
  };
}
export function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
