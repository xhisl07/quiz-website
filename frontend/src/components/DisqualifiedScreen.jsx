import React from 'react';

const DisqualifiedScreen = ({ result, onRestartQuiz }) => {
  if (!result || !result.score) {
    return (
      <div className="disqualified-screen">
        <h1>No results available</h1>
        <button onClick={onRestartQuiz}>Restart Quiz</button>
      </div>
    );
  }

  const correctAnswers = result.questionBreakdown.filter(q => q.isCorrect).length;
  const incorrectAnswers = result.questionBreakdown.length - correctAnswers;

  return (
    <div className="disqualified-screen">
      <div className="disqualified-container">
        <h1>Quiz Disqualified</h1>
        <div className="disqualified-summary">
          <div className="disqualified-score">
            <h2>{result.score}/{result.total}</h2>
            <p>Final Score</p>
          </div>
          <div className="disqualified-time">
            <h2>{result.timeTaken}</h2>
            <p>Time Taken</p>
          </div>
          <div className="disqualified-status">
            <h2>{result.status}</h2>
            <p>Status</p>
          </div>
        </div>

        <div className="disqualification-reason">
          <h2>Reason for Disqualification</h2>
          <p>Multiple violations of quiz rules detected (window/tab changes, fullscreen exit, etc.)</p>
          <p>As per quiz policy, this results in automatic disqualification.</p>
        </div>

        {result.violations && result.violations.length > 0 && (
          <div className="violations-section">
            <h2>Violations Recorded</h2>
            <div className="violations-list">
              {result.violations.map((v, index) => (
                <div key={index} className="violation-item">
                  <span className="violation-type">{v.type}</span>
                  <span className="violation-time">{new Date(v.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="results-section">
          <h2>Your Results</h2>
          <p>Despite disqualification, here is how you performed on the questions you answered:</p>
          <div className="breakdown-list">
            {result.questionBreakdown.map((q, index) => (
              <div key={index} className={`breakdown-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="question-number">Q{q.questionId}</div>
                <div className="question-answer">
                  Your answer: {q.userAnswer !== -1 ? String.fromCharCode(65 + q.userAnswer) : 'Not answered'}
                  {q.userAnswer === -1 && <span className="note"> (Auto-marked incorrect)</span>}
                </div>
                <div className="correct-answer">
                  Correct answer: {String.fromCharCode(65 + q.correct)}
                </div>
                <div className="result-icon">
                  {q.isCorrect ? '✓' : '✗'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="explanation-section">
          <h2>Learn from This Experience</h2>
          <p>To avoid disqualification in future attempts:</p>
          <ul>
            <li>Stay on the quiz window throughout the entire session</li>
            <li>Do not switch to other tabs or applications</li>
            <li>Keep the quiz window in fullscreen mode</li>
            <li>Do not use keyboard shortcuts like F12, Ctrl+Shift+I, etc.</li>
            <li>Avoid right-clicking on the quiz content</li>
          </ul>
        </div>

        <button className="restart-button" onClick={onRestartQuiz}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default DisqualifiedScreen;