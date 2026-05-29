import React, { useState, useEffect, useRef } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import DisqualifiedScreen from './components/DisqualifiedScreen';
import useAntiCheat from './hooks/useAntiCheat';

function App() {
  const [stage, setStage] = useState('start'); // start, quiz, result, disqualified
  const [userName, setUserName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [violations, setViolations] = useState([]);
  const [violationCount, setViolationCount] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [sessionId, setSessionId] = useState('');

  // Latest submit function ref to avoid stale closures inside the interval
  const submitRef = useRef(null);
  useEffect(() => {
    submitRef.current = submitQuiz;
  }, [answers, timeTaken, violations, sessionId, userName]);

  // Start quiz
  const startQuiz = async (name) => {
    setUserName(name);
    const quizStart = Date.now();
    setStartTime(quizStart);

    try {
      const response = await fetch('/api/quiz/start');
      const data = await response.json();

      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setStage('quiz');
      setViolationCount(0);
      setIsDisqualified(false);
      setWarningShown(false);
      setAnswers(Array(data.questions.length).fill(null));

      // Start timer
      startTimer(quizStart);

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log(`Fullscreen error: ${err.message}`);
        });
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  // Timer functions
  const startTimer = (quizStartTime) => {
    const durationMinutes = 20; // Default, should come from env
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = quizStartTime + durationMs;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(interval);
        if (submitRef.current) {
          submitRef.current();
        }
      } else {
        setTimeTaken(Math.floor((now - quizStartTime) / 1000));
      }
    }, 1000);

    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Handle question answer
  const handleAnswer = (questionIndex, selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = selectedOption;
    setAnswers(newAnswers);

    // Auto-advance to next question if not last question
    if (questionIndex < questions.length - 1) {
      setCurrentQuestionIndex(questionIndex + 1);
    } else {
      // Auto-submit the quiz on the last question with the final answers!
      setTimeout(() => {
        submitQuiz(newAnswers);
      }, 500);
    }
  };

  // Handle first violation (warning)
  const handleFirstViolation = () => {
    setViolationCount(prev => prev + 1);
    setWarningShown(true);
    // In a real app, you'd show a modal here
    alert('Warning: Leaving the quiz window is not allowed. This is your only warning. A second violation will auto-submit your quiz.');

    // Hide warning after 5 seconds
    setTimeout(() => {
      setWarningShown(false);
    }, 5000);
  };

  // Handle second violation (disqualification)
  const handleSecondViolation = () => {
    setViolationCount(prev => prev + 1);
    setIsDisqualified(true);
    forceSubmitQuiz();
  };

  // Anti-cheat hook
  const { isActive: antiCheatActive, resetViolations } = useAntiCheat({
    onFirstViolation: handleFirstViolation,
    onSecondViolation: handleSecondViolation,
    enabled: stage === 'quiz'
  });

  // Force submit quiz (called on second violation)
  const forceSubmitQuiz = () => {
    stopTimer();

    // Mark all remaining questions as incorrect
    const forcedAnswers = answers.map((answer, index) => {
      if (answer === null && index >= currentQuestionIndex) {
        return -1; // Indicates not answered/wrong
      }
      return answer;
    });

    submitQuiz(forcedAnswers, true);
  };

  // Submit quiz
  const submitQuiz = async (forcedAnswers = null, isForced = false) => {
    stopTimer();

    const finalAnswers = forcedAnswers !== null ? forcedAnswers : answers;
    const finalTimeTaken = isForced ? timeTaken : Math.floor((Date.now() - startTime) / 1000);

    // Prepare violations data
    const violationData = violations.map(v => ({
      type: v.type,
      timestamp: v.timestamp
    }));

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          answers: finalAnswers,
          timeTaken: finalTimeTaken,
          violations: violationData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz to server');
      }

      const resultData = await response.json();

      const status = isForced || violationData.length >= 2 ? 'DISQUALIFIED' : 'COMPLETED';

      if (status === 'DISQUALIFIED') {
        setStage('disqualified');
        setIsDisqualified(true);
      } else {
        setStage('result');
      }

      const result = {
        submissionId: Math.random().toString(36).substr(2, 9),
        userName,
        userId: `ID-${Date.now()}`,
        score: resultData.score,
        total: resultData.total,
        timeTaken: `${Math.floor(finalTimeTaken / 60)}m ${finalTimeTaken % 60}s`,
        status,
        violations: violationData,
        submittedAt: new Date().toISOString(),
        questionBreakdown: resultData.breakdown
      };

      localStorage.setItem('quizResult', JSON.stringify(result));
    } catch (error) {
      console.error('Server submission failed, falling back to local simulation:', error);
      simulateSubmitQuiz({
        answers: finalAnswers,
        timeTaken: finalTimeTaken,
        violations: violationData
      }, isForced);
    }
  };

  // Simulate quiz submission (in real app, this would be an API call)
  const simulateSubmitQuiz = (submissionData, isForced = false) => {
    // In a real app, you'd make an API call here
    // For demo, we'll just calculate a score based on random correctness

    let score = 0;
    const breakdown = submissionData.answers.map((answer, index) => {
      if (answer === null || answer === -1) {
        return {
          questionId: index + 1,
          userAnswer: answer,
          correct: Math.floor(Math.random() * 4),
          isCorrect: false
        };
      }

      // Simulate correctness - in reality, you'd check against the actual correct answer
      const isCorrect = Math.random() > 0.5; // 50% chance correct for demo
      if (isCorrect) score++;

      return {
        questionId: index + 1,
        userAnswer: answer,
        correct: Math.floor(Math.random() * 4),
        isCorrect: isCorrect
      };
    });

    const status = isForced || submissionData.violations.length >= 2 ? 'DISQUALIFIED' : 'COMPLETED';

    if (status === 'DISQUALIFIED') {
      setStage('disqualified');
      setIsDisqualified(true);
    } else {
      setStage('result');
    }

    // Store results (in real app, this would come from backend)
    const result = {
      submissionId: Math.random().toString(36).substr(2, 9),
      userName,
      userId: `ID-${Date.now()}`,
      score,
      total: questions.length,
      timeTaken: `${Math.floor(submissionData.timeTaken / 60)}m ${submissionData.timeTaken % 60}s`,
      status,
      violations: submissionData.violations,
      submittedAt: new Date().toISOString(),
      questionBreakdown: breakdown
    };

    // In a real app, you'd get this from the backend response
    // For now, we'll pass it to the result screen via state or context
    // Since we're using local state, we'll need to store it somewhere
    // For simplicity, we'll use localStorage to pass data between screens
    localStorage.setItem('quizResult', JSON.stringify(result));
  };

  // Handle restarting quiz
  const restartQuiz = () => {
    setStage('start');
    setUserName('');
    setQuestions([]);
    setSessionId('');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setStartTime(null);
    setTimeTaken(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setViolations([]);
    setViolationCount(0);
    setIsDisqualified(false);
    setWarningShown(false);
    resetViolations();

    // Exit fullscreen if needed
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.log(`Exit fullscreen error: ${err.message}`);
      });
    }

    // Clear local storage
    localStorage.removeItem('quizResult');
  };

  // Visibility change handler for tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (stage === 'quiz' && document.hidden) {
        // This would trigger the anti-cheat system
        // In our hook, we're handling this via the useAntiCheat hook
        console.log('Tab switched - would trigger anti-cheat');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stage]);

  // Window blur handler
  useEffect(() => {
    const handleWindowBlur = () => {
      if (stage === 'quiz') {
        // This would trigger the anti-cheat system
        console.log('Window blurred - would trigger anti-cheat');
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [stage]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }

      // Exit fullscreen if needed
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log(`Exit fullscreen error: ${err.message}`);
        });
      }
    };
  }, []);

  // Render appropriate screen based on stage
  switch (stage) {
    case 'start':
      return <StartScreen onStartQuiz={startQuiz} />;
    case 'quiz':
      return (
        <QuizScreen
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          onAnswer={handleAnswer}
          timeTaken={timeTaken}
          warningShown={warningShown}
          violationCount={violationCount}
          isDisqualified={isDisqualified}
        />
      );
    case 'result':
      const result = JSON.parse(localStorage.getItem('quizResult') || '{}');
      return <ResultScreen result={result} onRestartQuiz={restartQuiz} />;
    case 'disqualified':
      const disqualifiedResult = JSON.parse(localStorage.getItem('quizResult') || '{}');
      return <DisqualifiedScreen result={disqualifiedResult} onRestartQuiz={restartQuiz} />;
    default:
      return <StartScreen onStartQuiz={startQuiz} />;
  }
}

export default App;