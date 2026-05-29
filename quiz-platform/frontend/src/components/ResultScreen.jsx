import React from 'react';

const ResultScreen = ({ result, onRestartQuiz }) => {
  if (!result || !result.score) {
    return (
      <div className="result-screen">
        <h1>No results available</h1>
        <button onClick={onRestartQuiz}>Restart Quiz</button>
      </div>
    );
  }

  const correctAnswers = result.questionBreakdown.filter(q => q.isCorrect).length;
  const incorrectAnswers = result.questionBreakdown.length - correctAnswers;

  return (
    <div className="result-screen">
      <div className="result-container">
        <h1>Quiz Completed!</h1>
        <div className="result-summary">
          <div className="result-score">
            <h2>{result.score}/{result.total}</h2>
            <p>Score</p>
          </div>
          <div className="result-time">
            <h2>{result.timeTaken}</h2>
            <p>Time Taken</p>
          </div>
          <div className="result-status">
            <h2>{result.status}</h2>
            <p>Status</p>
          </div>
        </div>

        <div className="result-details">
          <h2>Detailed Breakdown</h2>
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

        <div className="explanation-section">
          <h2>Learn from Your Answers</h2>
          <p>Review the explanations below to improve your knowledge:</p>
          {/* In a real app, you would show explanations for each question here */}
          <p><em>Explanations would be shown here based on the question bank.</em></p>
        </div>

        <button className="restart-button" onClick={onRestartQuiz}>
          Take Another Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;