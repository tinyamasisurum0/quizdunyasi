'use client';

import React, { useEffect, useState } from 'react';
import { Score } from '@/types';
import Leaderboard from './Leaderboard';

interface DynamicLeaderboardProps {
  initialScores?: Score[];
  category?: string;
  title?: string;
}

const DynamicLeaderboard: React.FC<DynamicLeaderboardProps> = ({ 
  initialScores = [], 
  category,
  title = 'En Yüksek Puanlar'
}) => {
  const [scores, setScores] = useState<Score[]>(initialScores);
  const [isLoading, setIsLoading] = useState<boolean>(initialScores.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const url = category 
          ? `/api/scores?category=${encodeURIComponent(category)}` 
          : '/api/scores';
        
        const response = await fetch(url, { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setScores(data.scores || []);
      } catch (error) {
        console.error('Error fetching scores:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch scores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [category]);

  if (error) {
    return (
      <div className="w-full bg-white/10 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="bg-red-900/20 text-red-400 p-4 rounded">
          <p>Puanlar yüklenirken bir hata oluştu.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return <Leaderboard scores={scores} title={title} isLoading={isLoading} />;
};

export default DynamicLeaderboard; 