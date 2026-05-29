import React from 'react';

const QuestionCard = ({
  question,
  options,
  currentQuestionIndex,
  selectedAnswer,
  onAnswer
}) => {
  const handleOptionClick = (index) => {
    onAnswer(currentQuestionIndex, index);
  };

  return (
    <div className="question-card">
      <div className="question-text">
        <h2>{question}</h2>
      </div>
      <div className="options-container">
        {options.map((option, index) => (
          <div
            key={index}
            className={`option-card ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => handleOptionClick(index)}
          >
            <div className="option-label">{String.fromCharCode(65 + index)}</div>
            <div className="option-text">{option}</div>
          </div>
        ))}
      </div>
      {selectedAnswer !== null && selectedAnswer !== undefined && (
        <div className="answer-feedback">
          {/* In a real app, you might show correct/incorrect feedback immediately,
              but as per requirements, no going back and feedback only at end */}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;