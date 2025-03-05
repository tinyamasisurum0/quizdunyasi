'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestScorePage() {
  const [username, setUsername] = useState('test_user');
  const [score, setScore] = useState(100);
  const [category, setCategory] = useState('test_category');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleTestDirectScore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log('Testing direct score endpoint...');
      const response = await fetch('/api/test-score');
      const data = await response.json();
      
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error testing direct score:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestScoreApi = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      console.log('Testing score API endpoint...');
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          score: parseInt(score.toString()),
          category,
        }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error testing score API:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Test Score Submission</h1>
        <div className="flex space-x-4">
          <Link href="/admin" className="text-blue-500 hover:text-blue-700">
            Back to Admin
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Score API</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="score" className="block text-sm font-medium mb-1">
                Score
              </label>
              <input
                type="number"
                id="score"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleTestScoreApi}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Score API
            </button>
            
            <button
              onClick={handleTestDirectScore}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Direct Score
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {isLoading && (
            <div className="text-center py-4">
              <p>Loading...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Response:</h3>
              <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 rounded">
            <h3 className="font-semibold mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Make sure your database connection string is correct</li>
              <li>Check that the scores table exists in your database</li>
              <li>Verify that your database allows connections from your server</li>
              <li>Try the direct test first to isolate any API-specific issues</li>
              <li>Check server logs for detailed error messages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 