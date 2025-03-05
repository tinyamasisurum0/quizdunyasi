import React from 'react';
import { Question } from '@/types';

interface QuizQuestionProps {
  question: Question;
  selectedOption: number | null;
  isAnswered: boolean;
  timeRemaining: number;
  onSelectOption: (optionIndex: number) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  isAnswered,
  timeRemaining,
  onSelectOption,
}) => {
  // Function to determine the class for each option
  const getOptionClass = (index: number) => {
    const baseClass = "p-4 rounded-lg text-left w-full transition-all duration-300";
    
    if (!isAnswered) {
      return selectedOption === index
        ? `${baseClass} bg-blue-600 text-white`
        : `${baseClass} bg-white/10 hover:bg-white/20`;
    }
    
    if (index === question.correct) {
      return `${baseClass} bg-green-600 text-white`;
    }
    
    if (selectedOption === index) {
      return `${baseClass} bg-red-600 text-white`;
    }
    
    return `${baseClass} bg-white/10 opacity-70`;
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isAnswered && onSelectOption(index)}
              disabled={isAnswered}
              className={getOptionClass(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-100"
          style={{ width: `${(timeRemaining / 10) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizQuestion; 