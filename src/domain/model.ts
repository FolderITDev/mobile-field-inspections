import {
  array,
  base,
  choice,
  object,
  photo,
  text,
  timestamp,
  type BaseRecord,
  type Photo,
} from './validation';
export const checklist = [
  {
    key: 'entry-access',
    group: 'Access',
    title: 'Entry paths',
    prompt: 'Are entry paths clear and usable?',
  },
  {
    key: 'emergency-exits',
    group: 'Access',
    title: 'Emergency exits',
    prompt: 'Are emergency exits visibly unobstructed?',
  },
  {
    key: 'floor-condition',
    group: 'Safety',
    title: 'Floor condition',
    prompt: 'Are floors free of obvious trip hazards?',
  },
  {
    key: 'fire-equipment',
    group: 'Safety',
    title: 'Fire equipment',
    prompt: 'Is fire equipment visible and accessible?',
  },
  {
    key: 'electrical-area',
    group: 'Safety',
    title: 'Electrical areas',
    prompt: 'Are electrical areas free of visible obstruction?',
  },
  {
    key: 'lighting',
    group: 'Condition',
    title: 'Lighting',
    prompt: 'Is lighting adequate in the inspected area?',
  },
  {
    key: 'ventilation',
    group: 'Condition',
    title: 'Ventilation',
    prompt: 'Is ventilation visibly operating as expected?',
  },
  {
    key: 'storage',
    group: 'Condition',
    title: 'Equipment storage',
    prompt: 'Is equipment and material storage orderly?',
  },
] as const;
export type AnswerValue = 'pass' | 'fail' | 'na';
export interface Answer {
  key: string;
  response: AnswerValue | null;
  note: string;
  photos: Photo[];
}
export interface AppRecord extends BaseRecord {
  site: string;
  templateVersion: 1;
  status: 'draft' | 'completed';
  completedAt: string | null;
  answers: Answer[];
}
export function createInspection(
  id: string,
  site: string,
  now = new Date().toISOString(),
): AppRecord {
  return {
    id,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    site: text(site, 'Site name', 100),
    templateVersion: 1,
    status: 'draft',
    completedAt: null,
    answers: checklist.map((item) => ({
      key: item.key,
      response: null,
      note: '',
      photos: [],
    })),
  };
}
export function saveAnswer(
  record: AppRecord,
  key: string,
  patch: Partial<Omit<Answer, 'key'>>,
): AppRecord {
  if (record.status !== 'draft')
    throw new Error('Completed inspections are read-only.');
  if (!record.answers.some((a) => a.key === key))
    throw new Error('Checklist item not found.');
  return {
    ...record,
    answers: record.answers.map((a) =>
      a.key === key ? parseAnswer({ ...a, ...patch }) : a,
    ),
  };
}
export function validAnswer(a: Answer): boolean {
  return (
    a.response !== null &&
    (a.response !== 'fail' || a.note.trim().length > 0 || a.photos.length > 0)
  );
}
export function progress(record: AppRecord) {
  return record.answers.filter(validAnswer).length;
}
export function completeInspection(
  record: AppRecord,
  now = new Date().toISOString(),
): AppRecord {
  if (record.status !== 'draft')
    throw new Error('This inspection has already been completed.');
  if (progress(record) !== checklist.length)
    throw new Error('Answer every item. Findings need a note or photo.');
  return { ...record, status: 'completed', completedAt: timestamp(now) };
}
function parseAnswer(value: unknown): Answer {
  const v = object(value);
  return {
    key: text(v.key, 'Item key', 50),
    response:
      v.response === null
        ? null
        : choice(v.response, ['pass', 'fail', 'na'] as const),
    note: text(v.note, 'Note', 1000, true),
    photos: array(v.photos, photo, 2),
  };
}
export function parseRecord(value: unknown): AppRecord {
  const v = object(value);
  if (v.templateVersion !== 1)
    throw new Error('Unsupported inspection template.');
  const answers = array(v.answers, parseAnswer, 8);
  if (
    answers.length !== 8 ||
    checklist.some((i) => answers.filter((a) => a.key === i.key).length !== 1)
  )
    throw new Error('Invalid inspection checklist.');
  const r: AppRecord = {
    ...base(v),
    site: text(v.site, 'Site', 100),
    templateVersion: 1,
    status: choice(v.status, ['draft', 'completed']),
    completedAt: v.completedAt === null ? null : timestamp(v.completedAt),
    answers,
  };
  if (r.status === 'completed' && (!r.completedAt || progress(r) !== 8))
    throw new Error('Incomplete inspection record.');
  return r;
}
export type AnswerState =
  'pass' | 'finding' | 'findingNeedsContext' | 'notApplicable' | 'unanswered';

/** One word per checkpoint state, so lists never rely on color alone. */
export function answerState(answer: Answer): AnswerState {
  if (answer.response === 'pass') return 'pass';
  if (answer.response === 'na') return 'notApplicable';
  if (answer.response === 'fail')
    return validAnswer(answer) ? 'finding' : 'findingNeedsContext';
  return 'unanswered';
}

export interface InspectionSummary {
  total: number;
  /** Checkpoints that count toward completion (a finding needs context). */
  recorded: number;
  passed: number;
  findings: number;
  notApplicable: number;
  /** First checkpoint that still needs work, in checklist order. */
  nextKey: string | null;
}

export function summarize(record: AppRecord): InspectionSummary {
  const states = record.answers.map(answerState);
  const next = checklist.find(
    (item) => !validAnswer(record.answers.find((a) => a.key === item.key)!),
  );
  return {
    total: checklist.length,
    recorded: progress(record),
    passed: states.filter((s) => s === 'pass').length,
    findings: states.filter(
      (s) => s === 'finding' || s === 'findingNeedsContext',
    ).length,
    notApplicable: states.filter((s) => s === 'notApplicable').length,
    nextKey: next?.key ?? null,
  };
}

/** Drafts first (most recently edited on top), then completed by completion date. */
export function journalOrder(records: AppRecord[]): AppRecord[] {
  const time = (r: AppRecord) =>
    r.status === 'draft' ? r.updatedAt : (r.completedAt ?? r.updatedAt);
  return [...records].sort((a, b) =>
    a.status === b.status
      ? time(b).localeCompare(time(a))
      : a.status === 'draft'
        ? -1
        : 1,
  );
}

export function photos(records: AppRecord[]): Photo[] {
  return records.flatMap((r) => r.answers.flatMap((a) => a.photos));
}
