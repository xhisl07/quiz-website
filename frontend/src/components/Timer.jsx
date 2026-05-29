import React from 'react';

const Timer = ({ timeTaken, warningShown }) => {
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Determine if we are in the last 2 minutes (i.e., timeTaken >= (20*60 - 120) = 1080 seconds for a 20-minute quiz)
  // Since we don't have the total time in this component, we'll assume 20 minutes as default.
  // In a real app, you might pass the total time or the time limit as a prop.
  const totalTimeLimit = 20 * 60; // 20 minutes in seconds
  const timeLeft = totalTimeLimit - timeTaken;
  const isWarningTime = timeLeft <= 120 && timeLeft > 0; // Last 2 minutes

  return (
    <div className="timer">
      <div className={`timer-display ${isWarningTime ? 'warning' : ''}`}>
        Time: {timeString}
      </div>
      {isWarningTime && (
        <div className="timer-warning">
          {Math.ceil(timeLeft / 60)} minute{timeLeft > 120 ? 's' : ''} remaining
        </div>
      )}
      {warningShown && (
        <div className="timer-warning">
          Warning: Leaving the quiz window is not allowed.
        </div>
      )}
    </div>
  );
};

export default Timer;