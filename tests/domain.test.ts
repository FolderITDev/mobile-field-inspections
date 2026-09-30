import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checklist,
  createInspection,
  saveAnswer,
  completeInspection,
  progress,
  parseRecord,
  answerState,
  journalOrder,
  summarize,
} from '../src/domain/model';
test('findings require context before closing and completed inspections are immutable', () => {
  let r = createInspection('test', 'North workshop');
  assert.throws(() => completeInspection(r));
  for (const item of checklist)
    r = saveAnswer(r, item.key, { response: 'pass' });
  r = saveAnswer(r, checklist[0].key, { response: 'fail' });
  assert.equal(progress(r), 7);
  assert.throws(() => completeInspection(r));
  r = saveAnswer(r, checklist[0].key, { note: 'Box blocks entry' });
  const done = completeInspection(r);
  assert.equal(progress(done), 8);
  assert.throws(() => saveAnswer(done, checklist[0].key, { response: 'pass' }));
  assert.throws(() => completeInspection(done));
  assert.deepEqual(parseRecord(done), done);
});
test('photo evidence can support a finding and is limited to two files', () => {
  const r = createInspection('test', 'North');
  const p = { id: 'test', path: 'photo-test.jpg', width: 500, height: 500 };
  assert.equal(
    progress(
      saveAnswer(r, checklist[0].key, { response: 'fail', photos: [p] }),
    ),
    1,
  );
  assert.throws(() => saveAnswer(r, checklist[0].key, { photos: [p, p, p] }));
});
test('template integrity rejects missing or duplicate checkpoints', () => {
  const r = createInspection('test', 'North');
  assert.throws(() => parseRecord({ ...r, answers: r.answers.slice(1) }));
  assert.throws(() =>
    parseRecord({ ...r, answers: Array(8).fill(r.answers[0]) }),
  );
});
test('the summary names the next checkpoint and counts findings without context', () => {
  let r = createInspection('test', 'North');
  assert.equal(summarize(r).nextKey, checklist[0].key);
  r = saveAnswer(r, checklist[0].key, { response: 'pass' });
  r = saveAnswer(r, checklist[1].key, { response: 'fail' });
  const summary = summarize(r);
  assert.equal(summary.recorded, 1);
  assert.equal(summary.findings, 1);
  assert.equal(summary.nextKey, checklist[1].key);
  assert.equal(
    answerState(r.answers.find((a) => a.key === checklist[1].key)!),
    'findingNeedsContext',
  );
});
test('the journal lists drafts first, newest edit on top', () => {
  const older = {
    ...createInspection('a', 'A'),
    updatedAt: '2026-09-01T00:00:00Z',
  };
  const newer = {
    ...createInspection('b', 'B'),
    updatedAt: '2026-09-02T00:00:00Z',
  };
  let done = createInspection('c', 'C');
  for (const item of checklist)
    done = saveAnswer(done, item.key, { response: 'pass' });
  done = completeInspection(done, '2026-09-03T00:00:00Z');
  assert.deepEqual(
    journalOrder([done, older, newer]).map((r) => r.id),
    ['b', 'a', 'c'],
  );
});
