'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuizState } from '@/types';
import QuizQuestion from '@/components/QuizQuestion';
import ScoreForm from '@/components/ScoreForm';

interface QuizClientProps {
  categoryId: string;
  categoryName: string;
  useDb?: boolean;
}

const QUESTION_TIME = 10; // seconds
const TOTAL_QUESTIONS = 15;

export default function QuizClient({ categoryId, categoryName, useDb = false }: QuizClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedOption: null,
    isAnswered: false,
    isQuizCompleted: false,
    timeRemaining: QUESTION_TIME,
  });
  
  // Load questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching questions for category: ${categoryId}, useDb: ${useDb}`);
        const url = `/api/questions?category=${categoryId}&count=${TOTAL_QUESTIONS}&useDb=${useDb}`;
        console.log(`Request URL: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}): ${errorText}`);
          throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.questions?.length || 0} questions from ${data.source || 'unknown source'}`);
        
        if (!data.questions || data.questions.length === 0) {
          throw new Error('No questions returned from the API');
        }
        
        setQuizState(prev => ({
          ...prev,
          currentQuestions: data.questions,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Sorular yüklenirken bir hata oluştu: ${errorMessage}`);
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [categoryId, useDb]);
  
  // Timer effect
  useEffect(() => {
    if (isLoading || quizState.isAnswered || quizState.isQuizCompleted) {
      return;
    }
    
    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return {
            ...prev,
            timeRemaining: 0,
            isAnswered: true,
          };
        }
        
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isLoading, quizState.isAnswered, quizState.isQuizCompleted]);
  
  // Handle option selection
  const handleSelectOption = useCallback((optionIndex: number) => {
    setQuizState(prev => {
      const currentQuestion = prev.currentQuestions[prev.currentQuestionIndex];
      const isCorrect = optionIndex === currentQuestion.correct;
      
      return {
        ...prev,
        selectedOption: optionIndex,
        isAnswered: true,
        score: isCorrect ? prev.score + currentQuestion.points : prev.score,
      };
    });
  }, []);
  
  // Handle next question
  const handleNextQuestion = useCallback(() => {
    setQuizState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      
      if (nextIndex >= prev.currentQuestions.length) {
        return {
          ...prev,
          isQuizCompleted: true,
        };
      }
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedOption: null,
        isAnswered: false,
        timeRemaining: QUESTION_TIME,
      };
    });
  }, []);
  
  // Handle score submission
  const handleSubmitScore = useCallback(async (username: string) => {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          score: quizState.score,
          category: categoryName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit score');
      }
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error submitting score:', error);
      throw error;
    }
  }, [quizState.score, categoryName, router]);
  
  // Loading state
  if (isLoading) {
    return <p className="text-center py-8">Sorular yükleniyor...</p>;
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }
  
  // No questions state
  if (quizState.currentQuestions.length === 0) {
    return <p className="text-center py-8">Bu kategori için soru bulunamadı.</p>;
  }
  
  // Quiz completed state
  if (quizState.isQuizCompleted) {
    return (
      <ScoreForm
        score={quizState.score}
        category={categoryName}
        onSubmit={handleSubmitScore}
      />
    );
  }
  
  // Current question
  const currentQuestion = quizState.currentQuestions[quizState.currentQuestionIndex];
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg">
          Soru {quizState.currentQuestionIndex + 1} / {quizState.currentQuestions.length}
        </span>
        <span className="text-lg">
          Puan: {quizState.score}
        </span>
      </div>
      
      <QuizQuestion
        question={currentQuestion}
        selectedOption={quizState.selectedOption}
        isAnswered={quizState.isAnswered}
        timeRemaining={quizState.timeRemaining}
        onSelectOption={handleSelectOption}
      />
      
      {quizState.isAnswered && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNextQuestion}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            {quizState.currentQuestionIndex === quizState.currentQuestions.length - 1
              ? 'Quizi Tamamla'
              : 'Sonraki Soru'}
          </button>
        </div>
      )}
    </div>
  );
}