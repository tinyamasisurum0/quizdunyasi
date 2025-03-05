import React from 'react';
import { Score } from '@/types';

interface LeaderboardProps {
  scores: Score[];
  title?: string;
  isLoading?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  scores, 
  title = 'En Yüksek Puanlar', 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-white/20 rounded w-1/3"></div>
              <div className="h-4 bg-white/20 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="text-center py-4 text-white/70">Henüz puan kaydedilmemiş</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-2 text-left">Sıra</th>
              <th className="py-2 text-left">Kullanıcı</th>
              <th className="py-2 text-right">Puan</th>
              <th className="py-2 text-right">Kategori</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr 
                key={score.id} 
                className={`border-b border-white/10 ${index < 3 ? 'font-bold' : ''}`}
              >
                <td className="py-3">{index + 1}</td>
                <td className="py-3">{score.username}</td>
                <td className="py-3 text-right">{score.score}</td>
                <td className="py-3 text-right">{score.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard; 