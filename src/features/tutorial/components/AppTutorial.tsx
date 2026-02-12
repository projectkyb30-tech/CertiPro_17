import React, { useEffect } from 'react';
import Joyride, { ACTIONS, CallBackProps } from 'react-joyride';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../store/useUserStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { getTutorialSteps } from './tutorialSteps';
import { getJoyrideStyles, JOYRIDE_LOCALE } from './tutorialStyles';

/**
 * AppTutorial Component
 * 
 * Orchestrates the interactive application tour.
 * Handles:
 * - Automatic start on first launch
 * - State management via Zustand (for cross-page persistence)
 * - Navigation logic between steps and routes
 * - Mobile/Desktop responsiveness
 */
const AppTutorial: React.FC = () => {
  // Store hooks
  const { 
    hasSeenAppTutorial, 
    setHasSeenAppTutorial,
    tutorialStepIndex,
    setTutorialStepIndex,
    isTutorialRunning,
    setTutorialRunning
  } = useUserStore();
  
  const { theme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Local state
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Generate steps based on current viewport
  const steps = getTutorialSteps(isMobile);

  /**
   * Effect: Auto-start tutorial logic
   * Checks if the user hasn't seen the tutorial and it's not currently running.
   */
  useEffect(() => {
    if (!hasSeenAppTutorial && !isTutorialRunning && tutorialStepIndex === 0) {
      // Small delay to ensure UI is fully rendered before starting tour
      const timer = setTimeout(() => {
        setTutorialRunning(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenAppTutorial, isTutorialRunning, tutorialStepIndex, setTutorialRunning]);

  /**
   * Effect: Handle route navigation and resumption
   * When arriving at a new route during the tutorial, this resumes the tour
   * after a brief delay to allow page transition animations to complete.
   */
  useEffect(() => {
    // Only proceed if paused, haven't finished, and have a valid next step
    if (!isTutorialRunning && !hasSeenAppTutorial && steps[tutorialStepIndex]) {
      const currentStep = steps[tutorialStepIndex];
      
      // If we are at the correct route for the current step
      if (currentStep.data?.route && location.pathname === currentStep.data.route) {
        const timer = setTimeout(() => {
          setTutorialRunning(true);
        }, 800); 
        return () => clearTimeout(timer);
      }
    }
  }, [isTutorialRunning, hasSeenAppTutorial, tutorialStepIndex, location.pathname, setTutorialRunning, steps]);

  /**
   * Callback handler for Joyride events
   * Manages step progression, finishing, skipping, and navigation.
   */
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, index, status, type } = data;

    // Handle Finish / Skip
    if ((['finished', 'skipped'] as string[]).includes(status)) {
      setHasSeenAppTutorial(true);
      setTutorialRunning(false);
      setTutorialStepIndex(0);
      return;
    } 
    
    // Handle Step Changes
    if ((['step:after', 'error:target_not_found'] as string[]).includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // Navigation Logic: Check if next step requires a different route
      if (steps[nextStepIndex]) {
        const nextStep = steps[nextStepIndex];
        if (nextStep.data?.route && nextStep.data.route !== location.pathname) {
          // Pause tutorial -> Navigate -> Update Index
          // The useEffect above will resume it when navigation completes
          setTutorialRunning(false);
          navigate(nextStep.data.route);
          setTutorialStepIndex(nextStepIndex);
          return;
        }
      }
      
      // Standard progression within same page
      setTutorialStepIndex(nextStepIndex);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={isTutorialRunning}
      stepIndex={tutorialStepIndex}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks={false} // Disable clicks on highlighted elements during tour
      disableScrolling={false} // Allow scrolling to elements
      scrollOffset={300} // Ensure target is not hidden behind headers (increased for Learning Map)
      styles={getJoyrideStyles(theme)}
      callback={handleJoyrideCallback}
      locale={JOYRIDE_LOCALE}
    />
  );
};

export default AppTutorial;
