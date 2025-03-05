import React from 'react';
import { Question } from '@/types';

interface QuizQuestionProps {
  question: Question;
  selectedOption: number | null;
  isAnswered: boolean;
  timeRemaining: number;
  onSelectOption: (optionIndex: number) => void;
  onNextQuestion?: () => void;
  isLastQuestion?: boolean;
  lastAnswerCorrect?: boolean;
  lastPointsEarned?: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  selectedOption,
  isAnswered,
  timeRemaining,
  onSelectOption,
  onNextQuestion,
  isLastQuestion = false,
  lastAnswerCorrect = false,
  lastPointsEarned = 0,
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
    <div className="w-full relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
        
        <div className="relative">
          <div className="flex flex-col gap-3">
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
          
          {/* Overlay with "Sonraki Soru" button when answered */}
          {isAnswered && onNextQuestion && (
            <div 
              className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/60 rounded-lg z-10 cursor-pointer" 
              onClick={onNextQuestion}
            >
              <div className="text-center transform transition-transform hover:scale-105">
                {selectedOption !== null && (
                  <div className={`text-xl font-bold mb-1 ${selectedOption === question.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedOption === question.correct ? 'Doğru Cevap' : 'Yanlış Cevap'}
                    {selectedOption === question.correct && question.points > 0 && (
                      <span className="ml-2 text-yellow-300">+{question.points}</span>
                    )}
                  </div>
                )}
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text p-2">
                  {isLastQuestion ? 'Quizi Tamamla' : 'Sonraki Soru'}
                </div>
                <div className="text-white/80 text-sm mt-1">Devam etmek için tıkla</div>
              </div>
            </div>
          )}
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