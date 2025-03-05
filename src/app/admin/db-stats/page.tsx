'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DbStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/db-questions?countOnly=true&t=${Date.now()}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching database stats:', err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Database Statistics</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className="text-blue-500 hover:text-blue-700">
              Back to Admin
            </Link>
            <Link href="/admin/db-manage" className="text-blue-500 hover:text-blue-700">
              Database Management
            </Link>
          </div>
        </div>
        
        <div className="mb-4">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Statistics'}
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-600">Loading database statistics...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <p><strong>Error:</strong> {error}</p>
            <p className="mt-2">
              Make sure your database is properly configured and accessible.
            </p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold">{stats.totalQuestions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Categories with Questions</p>
                  <p className="text-2xl font-bold">{stats.categoryCounts?.length || 0}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                  <p className="text-sm text-gray-600">Data Source</p>
                  <p className="text-lg font-semibold">{stats.source || 'Database'}</p>
                </div>
              </div>
            </div>
            
            {stats.categoryCounts && stats.categoryCounts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Questions by Category</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b text-left">Category ID</th>
                        <th className="py-2 px-4 border-b text-left">Question Count</th>
                        <th className="py-2 px-4 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.categoryCounts.map((category: any, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b">{category.category_id}</td>
                          <td className="py-2 px-4 border-b">{category.count}</td>
                          <td className="py-2 px-4 border-b">
                            <div className="flex space-x-2">
                              <Link 
                                href={`/admin/test-db?category=${encodeURIComponent(category.category_id)}`}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                Test
                              </Link>
                              <Link 
                                href={`/quiz?category=${encodeURIComponent(category.category_id)}`}
                                className="text-green-500 hover:text-green-700 text-sm"
                              >
                                Quiz
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-yellow-50 rounded">
              <h2 className="text-xl font-semibold mb-2">Troubleshooting</h2>
              <p className="mb-2">If you've deleted questions but they still appear in quizzes:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Make sure you're using the database as the source for questions</li>
                <li>Check that the category ID is correct</li>
                <li>Try refreshing the statistics to see the current state</li>
                <li>Clear your browser cache or try in an incognito window</li>
                <li>
                  Use the <Link href="/admin/db-manage" className="text-blue-500 hover:underline">Database Management</Link> page 
                  to run SQL queries and verify the data
                </li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
            <p>No statistics available. Try refreshing the page.</p>
          </div>
        )}
      </div>
    </div>
  );
} 