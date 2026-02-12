import { StateCreator } from 'zustand';

export interface TutorialSlice {
  hasSeenOnboarding: boolean;
  hasSeenAppTutorial: boolean;
  tutorialStepIndex: number;
  isTutorialRunning: boolean;
  
  setHasSeenOnboarding: (value: boolean) => void;
  setHasSeenAppTutorial: (value: boolean) => void;
  setTutorialStepIndex: (index: number) => void;
  setTutorialRunning: (isRunning: boolean) => void;
}

export const createTutorialSlice: StateCreator<TutorialSlice> = (set) => ({
  hasSeenOnboarding: false,
  hasSeenAppTutorial: false,
  tutorialStepIndex: 0,
  isTutorialRunning: false,

  setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
  setHasSeenAppTutorial: (value) => set({ hasSeenAppTutorial: value }),
  setTutorialStepIndex: (index) => set({ tutorialStepIndex: index }),
  setTutorialRunning: (isRunning) => set({ isTutorialRunning: isRunning }),
});
