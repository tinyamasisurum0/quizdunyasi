'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [initDbStatus, setInitDbStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importResults, setImportResults] = useState<any[]>([]);
  const [dbCheckResults, setDbCheckResults] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM information_schema.tables WHERE table_schema = \'public\'');
  const [sqlResults, setSqlResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Predefined SQL queries for common operations
  const predefinedQueries = {
    checkTables: "SELECT * FROM information_schema.tables WHERE table_schema = 'public'",
    createScoresTable: "CREATE TABLE IF NOT EXISTS public.scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(255) NOT NULL, score INTEGER NOT NULL, category VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)",
    createQuestionsTable: "CREATE TABLE IF NOT EXISTS public.questions (id VARCHAR(255) PRIMARY KEY, question TEXT NOT NULL, options JSONB NOT NULL, correct INTEGER NOT NULL, points INTEGER NOT NULL, difficulty VARCHAR(50) NOT NULL, category_id VARCHAR(255) NOT NULL)",
    checkPermissions: "SELECT has_schema_privilege(current_user, 'public', 'CREATE')",
    countScores: "SELECT COUNT(*) FROM public.scores",
    countQuestions: "SELECT COUNT(*) FROM public.questions"
  };

  const handleInitDb = async () => {
    setIsLoading(true);
    setInitDbStatus('Initializing database...');
    
    try {
      const response = await fetch('/api/init-db');
      const data = await response.json();
      
      if (response.ok) {
        setInitDbStatus('Database initialized successfully!');
      } else {
        setInitDbStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setInitDbStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportQuestions = async () => {
    setIsLoading(true);
    setImportStatus('Importing questions...');
    setImportResults([]);
    
    try {
      const response = await fetch('/api/import-questions');
      const data = await response.json();
      
      if (response.ok) {
        setImportStatus('Questions imported successfully!');
        setImportResults(data.results || []);
      } else {
        setImportStatus(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setImportStatus(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckDatabase = async () => {
    setIsLoading(true);
    setDbCheckResults(null);
    
    try {
      const response = await fetch('/api/db-check');
      const data = await response.json();
      
      if (response.ok) {
        setDbCheckResults(data);
      } else {
        setDbCheckResults({ error: data.error || 'Unknown error' });
      }
    } catch (error) {
      setDbCheckResults({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSql = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSqlResults(null);
    
    try {
      const response = await fetch('/api/db-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSqlResults(data);
      } else {
        setSqlResults({ error: data.error, details: data.details });
      }
    } catch (error) {
      setSqlResults({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-8">
        <Link 
          href="/"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          ← Back to Home
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Database Management</h2>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleInitDb}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Initialize Database
            </button>
            
            <button
              onClick={handleCheckDatabase}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Check Database
            </button>
          </div>
          
          {initDbStatus && (
            <div className={`mt-4 p-3 rounded ${initDbStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {initDbStatus}
            </div>
          )}
          
          {dbCheckResults && (
            <div className="mt-4 p-3 rounded bg-gray-100">
              <h3 className="font-semibold mb-2">Database Check Results:</h3>
              
              {dbCheckResults.error ? (
                <div className="text-red-700">{dbCheckResults.error}</div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Connection Info:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(dbCheckResults.connection, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Available Schemas:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(dbCheckResults.schemas, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Tables in Public Schema:</h4>
                    {dbCheckResults.tables.length > 0 ? (
                      <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(dbCheckResults.tables, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-red-500">No tables found in public schema</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Permissions:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(dbCheckResults.permissions, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Question Management</h2>
          
          <button
            onClick={handleImportQuestions}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
          >
            Import Questions from JSON
          </button>
          
          {importStatus && (
            <div className={`mt-4 p-3 rounded ${importStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {importStatus}
            </div>
          )}
          
          {importResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Import Results:</h3>
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-3 text-left">Category</th>
                      <th className="py-2 px-3 text-left">Status</th>
                      <th className="py-2 px-3 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-3">{result.category}</td>
                        <td className="py-2 px-3">
                          <span className={result.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                            {result.status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {result.status === 'success' ? result.imported : result.error}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">SQL Execution</h2>
        
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Predefined Queries:</h3>
          <div className="flex flex-wrap gap-2">
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
        
        <form onSubmit={handleExecuteSql}>
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
            <p className="mt-1 text-sm text-gray-500">
              Note: Due to limitations with @vercel/postgres, complex queries may not work. 
              Simple SELECT, CREATE TABLE, and INSERT statements work best.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Execute Query
          </button>
        </form>
        
        {sqlResults && (
          <div className="mt-4 p-3 rounded bg-gray-100">
            <h3 className="font-semibold mb-2">Query Results:</h3>
            
            {sqlResults.error ? (
              <div className="text-red-700">
                <p><strong>Error:</strong> {sqlResults.error}</p>
                {sqlResults.details && <p><strong>Details:</strong> {sqlResults.details}</p>}
                {sqlResults.note && <p className="mt-2 text-amber-600"><strong>Note:</strong> {sqlResults.note}</p>}
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>Rows affected:</strong> {sqlResults.rowCount}
                </p>
                
                {sqlResults.rows && sqlResults.rows.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(sqlResults.rows, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p>No rows returned</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>First, click <strong>Initialize Database</strong> to create the necessary database tables.</li>
          <li>If you encounter issues, click <strong>Check Database</strong> to verify the connection and permissions.</li>
          <li>Use the <strong>SQL Execution</strong> tool to run custom queries if needed.</li>
          <li>Then, click <strong>Import Questions from JSON</strong> to import all questions from JSON files to the database.</li>
          <li>After importing, you can use the database as the source for questions by adding <code>useDb=true</code> to your API calls.</li>
          <li>Example: <code>/api/questions?category=history&useDb=true</code></li>
        </ol>
      </div>
    </div>
  );
} 