import { create } from 'zustand';
import { WorkoutDraftSource, WorkoutSplit } from '../types/training';

interface UIState {
  isLogMealModalOpen: boolean;
  isLogWorkoutModalOpen: boolean;
  isUpdateWeightModalOpen: boolean;
  isGoalSwitcherModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  isCreateSplitModalOpen: boolean;
  sidebarCollapsed: boolean;
  workoutDraftSource: WorkoutDraftSource | null;
  editingSplit: WorkoutSplit | null;
  startWorkout: (source: WorkoutDraftSource) => void;
  editSplit: (split: WorkoutSplit) => void;

  openLogMealModal: () => void;
  closeLogMealModal: () => void;
  openLogWorkoutModal: () => void;
  closeLogWorkoutModal: () => void;
  openUpdateWeightModal: () => void;
  closeUpdateWeightModal: () => void;
  openGoalSwitcherModal: () => void;
  closeGoalSwitcherModal: () => void;
  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;
  openCreateSplitModal: () => void;
  closeCreateSplitModal: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLogMealModalOpen: false,
  isLogWorkoutModalOpen: false,
  isUpdateWeightModalOpen: false,
  isGoalSwitcherModalOpen: false,
  isEditProfileModalOpen: false,
  isCreateSplitModalOpen: false,
  sidebarCollapsed: false,
  workoutDraftSource: null,
  editingSplit: null,
  startWorkout: (source) => set({ workoutDraftSource: source, isLogWorkoutModalOpen: true }),
  editSplit: (split) => set({ editingSplit: split, isCreateSplitModalOpen: true }),

  openLogMealModal: () => set({ isLogMealModalOpen: true }),
  closeLogMealModal: () => set({ isLogMealModalOpen: false }),
  openLogWorkoutModal: () => set({ isLogWorkoutModalOpen: true, workoutDraftSource: null }),
  closeLogWorkoutModal: () => set({ isLogWorkoutModalOpen: false, workoutDraftSource: null }),
  openUpdateWeightModal: () => set({ isUpdateWeightModalOpen: true }),
  closeUpdateWeightModal: () => set({ isUpdateWeightModalOpen: false }),
  openGoalSwitcherModal: () => set({ isGoalSwitcherModalOpen: true }),
  closeGoalSwitcherModal: () => set({ isGoalSwitcherModalOpen: false }),
  openEditProfileModal: () => set({ isEditProfileModalOpen: true }),
  closeEditProfileModal: () => set({ isEditProfileModalOpen: false }),
  openCreateSplitModal: () => set({ isCreateSplitModalOpen: true, editingSplit: null }),
  closeCreateSplitModal: () => set({ isCreateSplitModalOpen: false, editingSplit: null }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
