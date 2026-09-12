# LeanMate v1.1 Training Upgrade

## A. Files changed

- `src/types/training.ts`: backward-compatible exercise, workout, split-day, and completion types.
- `src/constants/exercises.ts`: central exercise reference library.
- `src/services/prEngine.ts`, `src/services/workoutProgression.ts`: records, history, validation, repeat drafts, units, progression.
- `src/services/muscleStimulusEngine.ts`: completed-set contributions and legacy targets.
- `src/firebase/firestoreService.ts`: paginated history and nested workout serialization.
- `src/store/useFitnessStore.ts`, `src/store/useUIStore.ts`: persistence, session-scoped history, repeat and split-edit state.
- `src/components/modals/LogWorkoutModal.tsx`, `src/components/modals/CreateSplitModal.tsx`: logging and split editing.
- `src/components/training/TrainingSheet.tsx`, `ExercisePicker.tsx`, `ExerciseEditor.tsx`, `ExerciseMedia.tsx`, `ExerciseDetail.tsx`, `PersonalRecords.tsx`: training UI components.
- `app/(tabs)/training/index.tsx`, `app/(tabs)/analytics/index.tsx`: training entry points and analytics integration.
- `scripts/check-training.cjs`: focused regression checks with mocked persistence; no new test dependencies.

## B. New types / schemas

Added stable exercise IDs, optional workoutName/splitDayId/schemaVersion/updatedAt, split-day IDs, completion/record types, and timed-set seconds. Existing weightKg, sessionName, muscleGroups, trained, and exercises fields remain. Zod validates dates, limits, sets, loads, reps, and optional effort fields before persistence. Stored loads use kg; displayed/input loads respect metric or imperial preferences.

## C. Exercise library implementation

Central definitions cover every muscle currently listed in the app, plus hip abduction. Muscle filters, all-exercise browsing, equipment labels, and name search use the same IDs. Static-image and looping-GIF URI fields have a fallback icon. No exercise animations or stock performance data were fabricated. Android GIF support is already enabled in the native project.

## D. Workout logging changes

Custom names, date, optional duration/notes, muscle selection, exercises, per-set weight/reps or timed seconds, add/remove sets, and optional RPE/RIR. Previous performance appears in the editor. Save exercise stages the result; Complete Workout persists it and displays a summary. Failed writes leave the draft available and show an error.

## E. Repeat workout behavior

Repeat a previous session or log/repeat a split day. Copies name, exercise order, and targets; clears performance and completion flags. The draft supports adding, replacing, removing, and reordering exercises. Use previous sets explicitly prefills editable values. Saving the current workout remains required. Editing a split preserves its day identities so renames retain history links.

## F. PR detection implementation

Deterministic comparisons detect weight, reps at a previously logged load, estimated 1RM, and session volume records. First performances establish baselines. Estimated 1RM uses Epley for weighted exercises with 1-12 reps; single reps use actual load. Bodyweight/timed movements do not receive fabricated estimated 1RM or volume. Comparisons ignore incomplete/rest entries and future sessions for backdated logs. Small unit-conversion tolerances prevent false records.

## G. Exercise history / progression implementation

Personal Records previews, View All PRs, exercise detail, latest sets, and chronological session history. Charts show estimated 1RM, top load, volume, reps, or seconds as appropriate. Charts use the existing SVG dependency and display up to 20 recent sessions; history remains available below.

## H. Firestore changes

All data stays in users/{uid}/workouts and existing customSplits. Nested undefined values are removed before workout writes. Exact all-time records require older history: it is read in pages of 200 on first training/logging use and cached once per signed-in session, rather than fetched by every screen. Concurrent loads share a request. No PR subcollection, persistent PR cache, composite index, or weakened rule was introduced.

## I. Backward compatibility handling

Older attendance/muscle-only workouts remain in history and count toward attendance and coverage. Exercise analytics ignore absent performance/identity fields. Legacy workouts without stable exercise IDs are not guessed into the new library. Existing selected-muscle contributions remain when no corresponding exercise represents that muscle. Zero completed exercise sets no longer invent three sets.

## J. Analytics integration

Question four now evaluates recent estimated-1RM trends alongside attendance and muscle coverage. It requires two weighted lifts with performance on at least three separate days and distinguishes insufficient history, stable, improving, and inconsistent results. No screen redesign or AI-generated interpretation was added.

## K. Validation results

- `node scripts/check-training.cjs`: 30 checks passed, including PRs, legacy logs, repeats, units, failed writes, UID routing, and clearing session history.
- `npx tsc --noEmit`: run once as requested. Reported one family of TS2339 errors from an inferred timed/weighted set union. Corrected by explicitly typing parsed sets as ExerciseSet[]. Not rerun, in accordance with the one-run instruction.
- `npx expo export --platform web --output-dir .expo-export-training-v1-1`: passed after that correction.
- Metro preview responds at http://localhost:8084.
- Physical Android/iOS interaction, keyboard layout, authenticated cloud writes, and exercise animation playback were not verified on a device. No test workouts were written to your Firebase project.

## L. Manual setup

No new Firebase rules, indexes, environment variables, or dependencies are required. To include this upgrade in your installed standalone Android app, create and install a new preview APK:

```powershell
npx eas-cli build -p android --profile preview
```

For device testing, log a workout, reopen it through Repeat, enter improved sets, complete it, check the PR summary/history, and restart the app to confirm persistence. Existing attendance logs should still appear. Real exercise media can be added later through the prepared URI fields.
