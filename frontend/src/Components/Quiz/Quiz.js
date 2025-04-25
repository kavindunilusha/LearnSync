import React, { useState } from 'react';
import './Quiz.css';

const Quiz = ({ isOpen, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 }); // Add score state

  const questions = [
    {
      category: "Woodworking",
      question: "What is the most common tool used in woodworking for measuring and marking?",
      answers: [
        "Measuring tape",
        "Chisel",
        "Hammer",
        "Saw"
      ],
      correct: 0
    },
    {
      category: "Painting",
      question: "Which primary colors are used to create secondary colors?",
      answers: [
        "Red, yellow, and blue",
        "Green, orange, and purple",
        "Black and white",
        "Brown and grey"
      ],
      correct: 0
    },
    {
      category: "Jewelry Making",
      question: "What tool is essential for making loops in wire jewelry?",
      answers: [
        "Round-nose pliers",
        "Scissors",
        "Hammer",
        "File"
      ],
      correct: 0
    },
    {
      category: "Crochet",
      question: "What is the basic tool needed to start crocheting?",
      answers: [
        "Crochet hook",
        "Knitting needles",
        "Scissors",
        "Yarn needle"
      ],
      correct: 0
    },
    {
      category: "Other Creative",
      question: "Which adhesive is best for paper crafts?",
      answers: [
        "Paper glue",
        "Hot glue",
        "Super glue",
        "Wood glue"
      ],
      correct: 0
    }
  ];

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      } else {
        incorrect++;
      }
    });
    
    setScore({ correct, incorrect });
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore(); // Calculate score when quiz is complete
    }
  };

  const handleSubmit = () => {
    alert('Your answers have been submitted successfully!');
    onClose();
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResult(false);
  };

  if (!isOpen) return null;

  return (
    <div className="quiz-overlay">
      <div className="quiz-container">
        <button className="close-button" onClick={onClose}>×</button>
        {!showResult ? (
          <>
            <div className="quiz-header">
              <h2>{questions[currentQuestion].category}</h2>
              <p className="question-number">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="question">
              <p>{questions[currentQuestion].question}</p>
            </div>
            <div className="answers">
              {questions[currentQuestion].answers.map((answer, index) => (
                <button
                  key={index}
                  className={`answer-button ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {answer}
                </button>
              ))}
            </div>
            <button 
              className="next-button"
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </>
        ) : (
          <div className="result-container">
            <h2>Quiz Complete!</h2>
            <div className="score-display">
              <p>Correct Answers: <span className="correct">{score.correct}</span></p>
              <p>Incorrect Answers: <span className="incorrect">{score.incorrect}</span></p>
            </div>
            <button className="submit-button" onClick={handleSubmit}>
              Close Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
