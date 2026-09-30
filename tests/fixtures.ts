import {
  checklist,
  createInspection,
  saveAnswer,
  type AppRecord,
} from '../src/domain/model';

/** A draft inspection with five passes and one documented finding. */
export function inspectionInProgress(): AppRecord {
  let r = createInspection('inspection-1', 'North workshop');
  for (const item of checklist.slice(0, 5))
    r = saveAnswer(r, item.key, { response: 'pass' });
  return saveAnswer(r, 'fire-equipment', {
    response: 'fail',
    note: 'Move the empty crate away from the extinguisher station.',
  });
}
