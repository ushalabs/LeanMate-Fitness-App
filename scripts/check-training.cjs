// Focused checks using the existing TypeScript compiler and Node assertions; no test dependency.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const Module = require('node:module');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { EXERCISES } = require('../src/constants/exercises.ts');
const { prEngine, exerciseHistory, estimated1RM } = require('../src/services/prEngine.ts');
const { workoutInputSchema, workoutSource, performanceTrend, displayWeight, weightInKg } = require('../src/services/workoutProgression.ts');
const { muscleStimulusEngine } = require('../src/services/muscleStimulusEngine.ts');
const { muscleCoverageEngine } = require('../src/services/muscleCoverageEngine.ts');
const { nutritionStreakEngine } = require('../src/services/nutritionStreakEngine.ts');
const { formatLocalDate, previousLocalDate, startOfLocalWeek } = require('../src/utils/date.ts');
const today = formatLocalDate(new Date());
const make = (id, date, weight, reps, exerciseId = 'barbell-bench') => ({
  id, date, createdAt: `${date}T12:00:00.000Z`, trained: true, workoutName: 'Test Push', sessionName: 'Test Push', muscleGroups: ['chest'],
  exercises: [{ id: 'entry', exerciseId, name: 'Bench Press', primaryMuscle: 'chest', secondaryMuscles: ['triceps'],
    sets: [{ id: 'set', setNumber: 1, completed: true, weightKg: weight, reps }] }],
});
let count = 0;
const check = (name, fn) => { fn(); count++; console.log(`PASS ${name}`); };
const first = make('first', '2026-01-01', 70, 8);
const next = make('next', '2026-01-02', 70, 11);
check('library IDs unique and all existing taxonomy groups represented', () => {
  assert.equal(new Set(EXERCISES.map((e) => e.id)).size, EXERCISES.length);
  for (const { id } of require('../src/constants/muscles.ts').ALL_MUSCLE_GROUPS) assert(EXERCISES.some((e) => e.primaryMuscle === id));
});
check('first workout establishes a baseline', () => assert.deepEqual(prEngine.detect(first, []), []));
check('same-load rep, estimated 1RM and volume PRs', () => assert.deepEqual(prEngine.detect(next, [first]).map((r) => r.kind).sort(), ['estimated1RM', 'reps', 'volume']));
check('heavier weight PR', () => assert(prEngine.detect(make('heavy', '2026-01-03', 80, 8), [first, next]).some((r) => r.kind === 'weight')));
check('equal performances and self-comparison are not PRs', () => assert.equal(prEngine.detect({ ...first, id: 'same', date: '2026-01-02' }, [first]).length, 0));
check('backdated records ignore future results', () => assert(prEngine.detect(next, [first, make('future', '2026-01-04', 100, 10)]).some((r) => r.kind === 'reps')));
check('1RM guards invalid and high-rep input', () => { assert.equal(estimated1RM(100, 30), 0); assert.equal(estimated1RM(100, 1), 100); assert.equal(estimated1RM(0, 8), 0); assert.equal(estimated1RM(NaN, 5), 0); });
check('incomplete sets cannot earn records', () => { const w = make('uncompleted', '2026-01-02', 100, 8); w.exercises[0].sets[0].completed = false; assert.equal(prEngine.detect(w, [first]).length, 0); });
check('rest sessions ignored in progression', () => assert.equal(exerciseHistory([{ ...first, trained: false }], 'barbell-bench').length, 0));
check('legacy attendance logs tolerated', () => { const old = { ...first, exercises: undefined }; assert.equal(prEngine.dashboard([old]).length, 0); assert.equal(prEngine.detect(next, [old]).length, 0); });
check('PR dashboard updates when history is removed', () => { assert.equal(prEngine.dashboard([first, next])[0].e1rm, estimated1RM(70, 11)); assert.equal(prEngine.dashboard([first])[0].e1rm, estimated1RM(70, 8)); });
check('bodyweight reps tracked without fabricated estimated 1RM', () => {
  const a = make('a', '2026-01-01', 0, 10, 'push-up'), b = make('b', '2026-01-02', 0, 15, 'push-up');
  assert.deepEqual(prEngine.detect(b, [a]).map((r) => r.kind), ['reps']);
});
check('repeat clears performance without changing original', () => { const source = workoutSource(first); assert.equal(source.exercises[0].sets[0].weightKg, undefined); assert.equal(source.exercises[0].sets[0].completed, false); assert.equal(first.exercises[0].sets[0].weightKg, 70); });
check('imperial round-trip does not manufacture weight PR', () => {
  const w = make('lb', '2026-01-02', weightInKg(displayWeight(70, true), true), 8);
  assert.equal(prEngine.detect(w, [first]).length, 0);
});
check('imperial round-trip still compares reps at same load', () => assert(prEngine.detect(make('lb', '2026-01-02', weightInKg(displayWeight(70, true), true), 11), [first]).some((r) => r.kind === 'reps')));
check('valid new workout accepted', () => assert(workoutInputSchema.safeParse({ ...next, date: today }).success));
check('invalid date and negative performance rejected', () => { assert(!workoutInputSchema.safeParse({ ...next, date: '2026-02-30' }).success); assert(!workoutInputSchema.safeParse(make('bad', today, -1, 8)).success); });
check('copied uncompleted sets cannot save', () => assert(!workoutInputSchema.safeParse({ ...first, ...workoutSource(first) }).success));
check('new trained workouts require at least one exercise', () => assert(!workoutInputSchema.safeParse({ ...first, exercises: [] }).success));
check('zero completed sets receive zero exercise stimulus', () => {
  const w = make('today', today, 70, 8); w.exercises[0].sets[0].completed = false;
  assert.equal(muscleStimulusEngine.calculateStimulus([w], ['chest'], []).chest.primarySets, 0);
});
check('actual primary and secondary sets enhance stimulus', () => {
  const scores = muscleStimulusEngine.calculateStimulus([make('today', today, 70, 8)], ['chest', 'triceps'], []);
  assert.equal(scores.chest.primarySets, 1); assert(scores.triceps.score > 0);
});
check('legacy selected muscles still count', () => {
  const w = { ...make('old', today, 70, 8), exercises: undefined };
  assert.equal(muscleStimulusEngine.calculateStimulus([w], ['chest'], []).chest.primarySets, 4);
});
check('weekly muscle coverage ignores previous calendar week', () => {
  const previousWeek = previousLocalDate(formatLocalDate(startOfLocalWeek(new Date())));
  const coverage = muscleCoverageEngine.calculate([make('last-week', previousWeek, 70, 8)], ['chest'], []);
  assert.equal(coverage.trainedCount, 0);
});
check('nutrition streak allows practical calorie and protein tolerance', () => {
  const yesterday = previousLocalDate(today);
  assert.deepEqual(nutritionStreakEngine.calculate([
    { id: 'y', date: yesterday, calories: 2300, protein: 130, createdAt: '', updatedAt: '' },
  ], 2400, 140, today), { count: 1, todayComplete: false });
  assert.deepEqual(nutritionStreakEngine.calculate([
    { id: 'y', date: yesterday, calories: 2500, protein: 150, createdAt: '', updatedAt: '' },
    { id: 't', date: today, calories: 2350, protein: 132, createdAt: '', updatedAt: '' },
  ], 2400, 140, today), { count: 2, todayComplete: true });
  assert.deepEqual(nutritionStreakEngine.calculate([
    { id: 't', date: today, calories: 2299, protein: 132, createdAt: '', updatedAt: '' },
  ], 2400, 140, today), { count: 0, todayComplete: false });
  assert.deepEqual(nutritionStreakEngine.calculate([
    { id: 't', date: today, calories: 2400, protein: 129, createdAt: '', updatedAt: '' },
  ], 2400, 140, today), { count: 0, todayComplete: false });
});
check('sparse history is not labelled improving', () => assert.equal(performanceTrend([first], 100, 100, '2026-01-03').status, 'insufficient'));
check('multi-lift improvement uses real performances and consistency', () => {
  const logs = ['barbell-bench', 'barbell-row'].flatMap((id) => [make(`${id}1`, '2026-01-01', 70, 8, id), make(`${id}2`, '2026-01-02', 70, 9, id), make(`${id}3`, '2026-01-03', 80, 8, id)]);
  assert.equal(performanceTrend(logs, 100, 90, '2026-01-04').status, 'improving');
  assert.equal(performanceTrend(logs, 30, 20, '2026-01-04').status, 'inconsistent');
});

// Mock only the persistence boundary, exercising the actual Zustand workout actions.
const load = Module._load;
let writes = [], failWrite = false, pages = 0;
const firestoreService = {
  getWorkoutHistoryPage: async () => { pages++; return { workouts: [first], hasMore: false }; },
  saveWorkoutLog: async (uid, workout) => { if (failWrite) throw new Error('Test write failure'); writes.push({ uid, workout }); },
};
Module._load = function(id, parent, isMain) {
  if (id === '../firebase/firestoreService') return { firestoreService };
  return load.call(this, id, parent, isMain);
};
(async () => {
  const { useFitnessStore, createEmptyUserProfile } = require('../src/store/useFitnessStore.ts');
  useFitnessStore.getState().setUser(createEmptyUserProfile('test-uid'));
  await Promise.all([useFitnessStore.getState().loadWorkoutHistory(), useFitnessStore.getState().loadWorkoutHistory()]);
  check('history requests shared and cached', () => assert.equal(pages, 1));
  await useFitnessStore.getState().loadWorkoutHistory();
  check('history not refetched by next screen', () => assert.equal(pages, 1));
  failWrite = true;
  await assert.rejects(useFitnessStore.getState().logWorkout({ ...next, date: today }), /Test write failure/);
  check('failed persistence does not create local completed workout', () => assert.equal(useFitnessStore.getState().workoutLogs.length, 0));
  failWrite = false;
  const result = await useFitnessStore.getState().logWorkout({ ...next, date: today });
  check('saved workout returns automatic PRs', () => assert(result.records.some((r) => r.kind === 'reps')));
  check('write uses current UID and existing schema fields', () => { assert.equal(writes[0].uid, 'test-uid'); assert.equal(writes[0].workout.schemaVersion, 2); assert.deepEqual(writes[0].workout.muscleGroups, ['chest']); });
  useFitnessStore.getState().clearUserData();
  check('sign out clears cached history', () => { assert.equal(useFitnessStore.getState().workoutHistory.length, 0); assert.equal(useFitnessStore.getState().workoutHistoryLoaded, false); });
  await assert.rejects(useFitnessStore.getState().logWorkout({ ...next, date: today }), /Sign in/);
  console.log(`${count} checks passed.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
