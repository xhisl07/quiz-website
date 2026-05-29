/**
 * Utility functions for shuffling and selecting questions
 */

/**
 * Fisher-Yates shuffle algorithm for arrays
 * @param {Array} array - The array to shuffle
 * @returns {Array} - New shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random questions from the question bank
 * @param {Array} bank - The full question bank
 * @param {number} count - Number of questions to select (default: 14)
 * @returns {Array} - Selected questions with shuffled options
 */
export function getRandomQuestions(bank, count = 14) {
  if (!bank || bank.length === 0) return [];

  // Shuffle the question bank and take the first 'count' questions
  const shuffledBank = shuffleArray(bank);
  const selectedQuestions = shuffledBank.slice(0, Math.min(count, bank.length));

  // For each question, shuffle the options
  return selectedQuestions.map(question => {
    const shuffledOptions = shuffleArray([...question.options]);

    // Find the new index of the correct answer after shuffling options
    const correctOption = question.options[question.correct];
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);

    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex // Update the correct index to match shuffled options
    };
  });
}

/**
 * Shuffle only the options of a question (used when displaying questions)
 * @param {Object} question - The question object
 * @returns {Object} - Question with shuffled options
 */
export function shuffleQuestionOptions(question) {
  const shuffledOptions = shuffleArray([...question.options]);

  // Find the new index of the correct answer after shuffling options
  const correctOption = question.options[question.correct];
  const newCorrectIndex = shuffledOptions.indexOf(correctOption);

  return {
    ...question,
    options: shuffledOptions,
    correct: newCorrectIndex
  };
}

export default {
  shuffleArray,
  getRandomQuestions,
  shuffleQuestionOptions
};