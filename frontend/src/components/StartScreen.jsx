import React, { useState } from 'react';

const StartScreen = ({ onStartQuiz }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim() === '') {
      alert('Please enter your name to begin the quiz');
      return;
    }
    onStartQuiz(userName.trim());
  };

  return (
    <div className="start-screen">
      <div className="start-container">
        <h1>Welcome to the Quiz Platform</h1>
        <p>Test your knowledge with our comprehensive quiz system</p>
        <div className="quiz-info">
          <h3>Quiz Details:</h3>
          <ul>
            <li>50+ question bank</li>
            <li>14 randomly selected questions per session</li>
            <li>20-minute time limit</li>
            <li>Anti-cheat monitoring enabled</li>
            <li>Instant results with explanations</li>
          </ul>
        </div>
        <form onSubmit={handleSubmit} className="start-form">
          <div className="form-group">
            <label htmlFor="username">Enter your name:</label>
            <input
              type="text"
              id="username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your full name or ID"
              required
            />
          </div>
          <button type="submit" className="start-button">
            Begin Quiz
          </button>
        </form>
        <div className="footer-note">
          <p>Note: This quiz monitors for tab/window changes to ensure fairness.</p>
          <p>Leaving the quiz window twice will result in automatic disqualification.</p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;