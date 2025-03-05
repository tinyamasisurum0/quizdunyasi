'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DbManagePage() {
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean; message: string} | null>(null);
  
  // Check database connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/direct-sql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql: 'SELECT 1 as connection_test' }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setConnectionStatus({
            success: true,
            message: 'Database connection successful'
          });
        } else {
          setConnectionStatus({
            success: false,
            message: `Database connection failed: ${data.error || 'Unknown error'}`
          });
        }
      } catch (error) {
        setConnectionStatus({
          success: false,
          message: `Database connection failed: ${(error as Error).message}`
        });
      }
    };
    
    checkConnection();
  }, []);
  
  // Predefined SQL queries for common operations
  const predefinedQueries = {
    listTables: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    countQuestions: "SELECT COUNT(*) FROM questions",
    countByCategory: "SELECT category_id, COUNT(*) FROM questions GROUP BY category_id ORDER BY COUNT(*) DESC",
    showQuestionColumns: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'questions'",
    deleteQuestion: "DELETE FROM questions WHERE id = 'REPLACE_WITH_QUESTION_ID'",
    clearCategory: "DELETE FROM questions WHERE category_id = 'REPLACE_WITH_CATEGORY_ID'",
    findQuestion: "SELECT * FROM questions WHERE question ILIKE '%SEARCH_TERM%' LIMIT 10",
    resetTables: "DROP TABLE IF EXISTS questions; DROP TABLE IF EXISTS scores;",
    recreateTables: `
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(255) PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct INTEGER NOT NULL,
  points INTEGER NOT NULL,
  difficulty VARCHAR(50) NOT NULL,
  category_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`
  };
  
  const handleExecuteSql = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sqlQuery.trim()) {
      alert('Please enter an SQL query');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/direct-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        error: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Database Management</h1>
          <div className="space-x-4">
            <Link href="/admin" className="text-blue-500 hover:text-blue-700">
              Back to Admin
            </Link>
            <Link href="/admin/db-stats" className="text-blue-500 hover:text-blue-700">
              Database Stats
            </Link>
          </div>
        </div>
        
        {connectionStatus && (
          <div className={`mb-4 p-3 rounded ${connectionStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <p className="font-medium">{connectionStatus.message}</p>
            {!connectionStatus.success && (
              <p className="mt-2 text-sm">
                Make sure your database connection environment variables are properly set in your Vercel project settings.
                Required variables: DATABASE_URL or POSTGRES_URL.
              </p>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-red-600 font-bold mb-2">⚠️ Warning: Be careful with direct SQL execution!</p>
          <p className="text-gray-600 mb-4">
            This page allows you to execute SQL queries directly against your database.
            Incorrect queries can damage or delete your data. Always double-check your queries before executing them.
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Predefined Queries</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(predefinedQueries).map(([key, query]) => (
              <button
                key={key}
                onClick={() => setSqlQuery(query)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-2 rounded"
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleExecuteSql} className="mb-6">
          <div className="mb-4">
            <label htmlFor="sqlQuery" className="block text-sm font-medium text-gray-700 mb-1">
              SQL Query
            </label>
            <textarea
              id="sqlQuery"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter SQL query..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !sqlQuery.trim() || (connectionStatus ? !connectionStatus.success : false)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Executing...' : 'Execute SQL'}
          </button>
        </form>
        
        {results && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            
            {results.error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded">
                <p><strong>Error:</strong> {results.error}</p>
                {results.details && <p><strong>Details:</strong> {results.details}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-100 text-green-700 rounded">
                  <p><strong>Success!</strong> Query executed successfully.</p>
                  <p><strong>Rows affected:</strong> {results.rowCount}</p>
                </div>
                
                {results.rows && results.rows.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          {Object.keys(results.rows[0]).map((key) => (
                            <th key={key} className="py-2 px-4 border-b text-left">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.rows.map((row: any, rowIndex: number) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            {Object.values(row).map((value: any, valueIndex: number) => (
                              <td key={valueIndex} className="py-2 px-4 border-b">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No rows returned</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-yellow-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Common Tasks</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Delete a specific question</h3>
              <p className="text-sm text-gray-600 mb-2">
                Replace REPLACE_WITH_QUESTION_ID with the ID of the question you want to delete.
              </p>
              <pre className="bg-gray-100 p-2 rounded text-sm">DELETE FROM questions WHERE id = 'REPLACE_WITH_QUESTION_ID';</pre>
            </div>
            
            <div>
              <h3 className="font-medium">Delete all questions in a category</h3>
              <p className="text-sm text-gray-600 mb-2">
                Replace REPLACE_WITH_CATEGORY_ID with the category ID.
              </p>
              <pre className="bg-gray-100 p-2 rounded text-sm">DELETE FROM questions WHERE category_id = 'REPLACE_WITH_CATEGORY_ID';</pre>
            </div>
            
            <div>
              <h3 className="font-medium">Find questions by content</h3>
              <p className="text-sm text-gray-600 mb-2">
                Replace SEARCH_TERM with part of the question text you're looking for.
              </p>
              <pre className="bg-gray-100 p-2 rounded text-sm">SELECT * FROM questions WHERE question ILIKE '%SEARCH_TERM%' LIMIT 10;</pre>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Vercel Deployment Help</h2>
          
          <div className="space-y-4">
            <p>If you're experiencing database connection issues on Vercel, make sure to:</p>
            
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Add your database connection URL to your Vercel project environment variables.
                <div className="mt-1 ml-6 text-sm">
                  <strong>Variable name:</strong> DATABASE_URL or POSTGRES_URL
                </div>
              </li>
              <li>
                Make sure your database allows connections from Vercel's IP addresses.
                <div className="mt-1 ml-6 text-sm">
                  <strong>For Supabase:</strong> Enable "Trusted IPs only" and add Vercel's IP ranges.
                </div>
              </li>
              <li>
                Check that your database connection string is properly formatted.
                <div className="mt-1 ml-6 text-sm">
                  <strong>Format:</strong> postgresql://username:password@hostname:port/database
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 