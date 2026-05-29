import React, { useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import Timer from './Timer';

const QuizScreen = ({
  questions,
  currentQuestionIndex,
  answers,
  onAnswer,
  timeTaken,
  warningShown,
  violationCount,
  isDisqualified
}) => {
  // Handle keydown events to prevent cheating shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P
      if (e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.key === 's') ||
          (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        // In a real app, this would trigger the anti-cheat system
        console.log('Blocked shortcut:', e.key);
      }
    };

    // Block context menu (right click)
    const handleContextMenu = (e) => {
      e.preventDefault();
      // In a real app, this would trigger the anti-cheat system
      console.log('Blocked context menu');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Prevent text selection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ IE 11 */
        user-select: none; /* Standard syntax */
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-screen">
      <div className="quiz-container">
        {/* Header with progress and timer */}
        <div className="quiz-header">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={questions.length}
          />
          <Timer
            timeTaken={timeTaken}
            warningShown={warningShown}
          />
        </div>

        {/* Warning banner if applicable */}
        {warningShown && (
          <div className="warning-banner">
            Warning: Leaving the quiz window is not allowed. This is your only warning.
          </div>
        )}

        {/* Violation counter */}
        {violationCount > 0 && (
          <div className="violation-counter">
            Violations: {violationCount}/2
          </div>
        )}

        {/* Disqualified banner */}
        {isDisqualified && (
          <div className="disqualified-banner">
            DISQUALIFIED - Quiz auto-submitted due to multiple violations
          </div>
        )}

        {/* Question card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswer={answers[currentQuestionIndex]}
            onAnswer={onAnswer}
          />
        )}

        {/* Navigation info */}
        <div className="quiz-footer">
          <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          {/* In a real app, you might show previous/next buttons,
              but as per requirements, no going back */}
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;