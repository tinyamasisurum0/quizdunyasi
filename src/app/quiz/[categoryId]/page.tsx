import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryById } from '@/lib/questions';
import QuizClient from './QuizClient';

interface QuizPageProps {
  params: {
    categoryId: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  const { categoryId } = params;
  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <Link 
            href="/"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
        
        <Suspense fallback={<QuizLoading />}>
          <QuizClient categoryId={categoryId} categoryName={category.name} />
        </Suspense>
      </div>
    </div>
  );
}

function QuizLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-white/20 rounded w-1/3 mb-6"></div>
      <div className="h-24 bg-white/20 rounded w-full mb-6"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-white/20 rounded w-full"></div>
        ))}
      </div>
      <div className="h-10 bg-white/20 rounded w-1/4 mt-6 ml-auto"></div>
    </div>
  );
} 