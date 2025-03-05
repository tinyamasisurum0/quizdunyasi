import Link from 'next/link';
import { getTopScores } from '@/lib/db';
import Leaderboard from '@/components/Leaderboard';
import { Score } from '@/types';

export default async function Home() {
  // Get top scores for the leaderboard
  let scores: Score[] = [];
  try {
    scores = await getTopScores(10);
  } catch (error) {
    console.error('Error fetching top scores:', error);
    // Continue with empty scores
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Quiz Dünyası</h1>
        <p className="text-xl mb-8">Bilgini test et, eğlenceye dal!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/categories/classic" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
          >
            Klasik Kategoriler
          </Link>
          <Link 
            href="/categories/interesting" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-300"
          >
            İlginç Kategoriler
          </Link>
        </div>
      </div>
      
      {/* Leaderboard */}
      <Leaderboard scores={scores} />
    </div>
  );
}
