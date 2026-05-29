import { useState, useEffect, useCallback } from 'react';

const useAntiCheat = ({ onFirstViolation, onSecondViolation, enabled = true }) => {
  const [violationCount, setViolationCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [violations, setViolations] = useState([]);

  // Function to record a violation
  const recordViolation = useCallback((type) => {
    if (!enabled) return;

    const newViolation = {
      type,
      timestamp: Date.now()
    };

    setViolations(prev => [...prev, newViolation]);
    setViolationCount(prev => {
      const newCount = prev + 1;

      // Trigger appropriate callback based on violation count
      if (newCount === 1) {
        onFirstViolation();
      } else if (newCount >= 2) {
        onSecondViolation();
        setIsDisqualified(true);
      }

      return newCount;
    });
  }, [enabled, onFirstViolation, onSecondViolation]);

  // Reset violations (useful when starting a new quiz)
  const resetViolations = useCallback(() => {
    setViolationCount(0);
    setIsDisqualified(false);
    setViolations([]);
  }, []);

  // Set up event listeners when enabled
  useEffect(() => {
    if (!enabled) return;

    // Handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab_switch');
      }
    };

    // Handle window blur (Alt+Tab, clicking another app, minimizing)
    const handleWindowBlur = () => {
      recordViolation('window_blur');
    };

    // Handle fullscreen change
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('fullscreen_exit');
      }
    };

    // Handle keydown to block shortcuts
    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.key === 's') ||
          (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        recordViolation('keyboard_shortcut');
      }
    };

    // Handle context menu (right click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('right_click');
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [enabled, recordViolation]);

  return {
    violationCount,
    isDisqualified,
    violations,
    resetViolations
  };
};

export default useAntiCheat;