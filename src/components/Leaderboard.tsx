import React from 'react';
import { Score } from '@/types';

interface LeaderboardProps {
  scores: Score[];
  title?: string;
  isLoading?: boolean;
}

// Helper function to format dates
function formatDate(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Geçersiz tarih';
  }
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  scores, 
  title = 'En Yüksek Puanlar', 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{title}</h2>
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

  if (!scores || scores.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{title}</h2>
        <p className="text-center py-4 text-white/70">Henüz puan kaydedilmemiş</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-blue-900/90 via-purple-900/70 to-pink-900/90 backdrop-blur-md rounded-lg p-6 shadow-lg border border-white/10">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{title}</h2>
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-2 text-left text-blue-300">Sıra</th>
              <th className="py-2 text-left text-blue-300">Kullanıcı</th>
              <th className="py-2 text-right text-blue-300">Puan</th>
              <th className="py-2 text-right text-blue-300">Kategori</th>
              <th className="py-2 text-right text-blue-300">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr 
                key={score.id || index} 
                className={`border-b border-white/10 hover:bg-white/5 transition-colors duration-200 ${
                  index === 0 
                    ? 'bg-gradient-to-r from-white/20 to-emerald-600/30' 
                    : index === 1 
                    ? 'bg-gradient-to-r from-white/15 to-emerald-500/20' 
                    : index === 2 
                    ? 'bg-gradient-to-r from-white/10 to-emerald-400/15' 
                    : ''
                }`}
              >
                <td className="py-3">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-emerald-100 to-emerald-600 rounded-full text-emerald-900 font-bold shadow-md shadow-emerald-500/30">1</span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-emerald-100 to-emerald-500 rounded-full text-emerald-900 font-bold shadow-md shadow-emerald-400/20">2</span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-emerald-100 to-emerald-400 rounded-full text-emerald-900 font-bold shadow-md shadow-emerald-300/20">3</span>
                  ) : (
                    index + 1
                  )}
                </td>
                <td className={`py-3 ${index < 3 ? 'font-bold' : ''}`}>{score.username}</td>
                <td className={`py-3 text-right ${index < 3 ? 'font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-emerald-600' : ''}`}>
                  {score.score}
                </td>
                <td className="py-3 text-right">{score.category}</td>
                <td className="py-3 text-right text-sm">
                  {score.createdAt ? formatDate(score.createdAt) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard; 