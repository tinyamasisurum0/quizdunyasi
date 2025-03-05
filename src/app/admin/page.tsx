'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [initDbStatus, setInitDbStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importResults, setImportResults] = useState<any[]>([]);
  const [dbCheckResults, setDbCheckResults] = useState<any>(null);
  const [envCheckResults, setEnvCheckResults] = useState<any>(null);
  const [supabaseTestResults, setSupabaseTestResults] = useState<any>(null);
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM information_schema.tables WHERE table_schema = \'public\'');
  const [sqlResults, setSqlResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useDirect, setUseDirect] = useState<boolean>(false);
  const [questionsCheckResults, setQuestionsCheckResults] = useState<any>(null);

  // Predefined SQL queries for common operations
  const predefinedQueries = {
    checkTables: "SELECT * FROM information_schema.tables WHERE table_schema = 'public'",
    createScoresTable: "CREATE TABLE IF NOT EXISTS scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(255) NOT NULL, score INTEGER NOT NULL, category VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)",
    createQuestionsTable: "CREATE TABLE IF NOT EXISTS questions (id VARCHAR(255) PRIMARY KEY, question TEXT NOT NULL, options JSONB NOT NULL, correct INTEGER NOT NULL, points INTEGER NOT NULL, difficulty VARCHAR(50) NOT NULL, category_id VARCHAR(255) NOT NULL)",
    checkPermissions: "SELECT has_schema_privilege(current_user, 'public', 'CREATE')",
    countScores: "SELECT COUNT(*) FROM scores",
    countQuestions: "SELECT COUNT(*) FROM questions",
    listSchemas: "SELECT schema_name FROM information_schema.schemata ORDER BY schema_name",
    createPublicSchema: "CREATE SCHEMA IF NOT EXISTS public",
    grantPermissions: "GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;"
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

  const handleCheckEnv = async () => {
    setIsLoading(true);
    setEnvCheckResults(null);
    
    try {
      const response = await fetch('/api/env-check');
      const data = await response.json();
      
      if (response.ok) {
        setEnvCheckResults(data);
      } else {
        setEnvCheckResults({ error: data.error || 'Unknown error' });
      }
    } catch (error) {
      setEnvCheckResults({ error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupabaseTest = async () => {
    setIsLoading(true);
    setSupabaseTestResults(null);
    
    try {
      const response = await fetch('/api/supabase-test');
      const data = await response.json();
      setSupabaseTestResults(data);
    } catch (error) {
      setSupabaseTestResults({
        success: false,
        error: 'Failed to test Supabase connection',
        details: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckQuestions = async () => {
    setIsLoading(true);
    setQuestionsCheckResults(null);
    
    try {
      const response = await fetch('/api/check-questions');
      const data = await response.json();
      setQuestionsCheckResults(data);
    } catch (error) {
      setQuestionsCheckResults({
        success: false,
        error: 'Failed to check questions',
        details: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSql = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSqlResults(null);
    
    try {
      const endpoint = useDirect ? '/api/direct-sql' : '/api/db-execute';
      const response = await fetch(endpoint, {
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
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Home
          </Link>
          <Link href="/admin/test-db" className="text-blue-500 hover:text-blue-700">
            Test Database Questions
          </Link>
          <Link href="/admin/db-stats" className="text-blue-500 hover:text-blue-700">
            Database Statistics
          </Link>
          <Link href="/admin/db-manage" className="text-blue-500 hover:text-blue-700">
            Database Management
          </Link>
        </div>
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
            
            <button
              onClick={handleCheckEnv}
              disabled={isLoading}
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Check Environment
            </button>
            
            <button
              onClick={handleSupabaseTest}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Direct Supabase Test
            </button>
            <p className="text-sm text-gray-600 mt-1">
              Tests connection using the pg library with SSL certificate validation disabled.
            </p>
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
                <div className="text-red-700">
                  <p><strong>Error:</strong> {dbCheckResults.error}</p>
                  {dbCheckResults.details && <p><strong>Details:</strong> {dbCheckResults.details}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-600">
                    <strong>Status:</strong> {dbCheckResults.message}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Connection Test:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(dbCheckResults.connectionTest, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {envCheckResults && (
            <div className="mt-4 p-3 rounded bg-gray-100">
              <h3 className="font-semibold mb-2">Environment Check Results:</h3>
              
              {envCheckResults.error ? (
                <div className="text-red-700">{envCheckResults.error}</div>
              ) : (
                <div className="space-y-4">
                  <div className={envCheckResults.success ? "text-green-600" : "text-red-600"}>
                    <strong>Status:</strong> {envCheckResults.message}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Environment Variables:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(envCheckResults.envStatus, null, 2)}
                    </pre>
                  </div>
                  
                  {envCheckResults.urlStructure && (
                    <div>
                      <h4 className="font-medium">Database URL Structure:</h4>
                      <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(envCheckResults.urlStructure, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium">Node Environment:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {envCheckResults.nodeEnv || 'Not set'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {supabaseTestResults && (
            <div className="mt-4 p-3 rounded bg-gray-100">
              <h3 className="font-semibold mb-2">Supabase Test Results:</h3>
              
              {supabaseTestResults.error ? (
                <div className="text-red-700">
                  <p><strong>Error:</strong> {supabaseTestResults.error}</p>
                  {supabaseTestResults.details && <p><strong>Details:</strong> {supabaseTestResults.details}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-600">
                    <strong>Status:</strong> {supabaseTestResults.message}
                  </div>
                  
                  {supabaseTestResults.connectionConfig && (
                    <div>
                      <strong>Connection Configuration:</strong> {supabaseTestResults.connectionConfig}
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium">Test Result:</h4>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(supabaseTestResults.result, null, 2)}
                    </pre>
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
          
          <button
            onClick={handleCheckQuestions}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 ml-2 disabled:opacity-50"
          >
            Check Database Questions
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
                <table className="min-w-full bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-3 border-b text-left">Category</th>
                      <th className="py-2 px-3 border-b text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-3">
                          {result.category}
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
          
          {questionsCheckResults && (
            <div className="mt-4 p-3 rounded bg-gray-100">
              <h3 className="font-semibold mb-2">Questions Check Results:</h3>
              
              {questionsCheckResults.error ? (
                <div className="text-red-700">
                  <p><strong>Error:</strong> {questionsCheckResults.error}</p>
                  {questionsCheckResults.details && <p><strong>Details:</strong> {questionsCheckResults.details}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-600">
                    <strong>Success!</strong> Found {questionsCheckResults.questionCount} questions in the database.
                  </div>
                  
                  {questionsCheckResults.connectionConfig && (
                    <div>
                      <strong>Connection Configuration:</strong> {questionsCheckResults.connectionConfig}
                    </div>
                  )}
                  
                  {questionsCheckResults.categoryCounts && questionsCheckResults.categoryCounts.length > 0 && (
                    <div>
                      <h4 className="font-medium">Questions by Category:</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="min-w-full bg-white border border-gray-300">
                          <thead>
                            <tr>
                              <th className="py-2 px-3 border-b text-left">Category</th>
                              <th className="py-2 px-3 border-b text-left">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questionsCheckResults.categoryCounts.map((category: any, index: number) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="py-2 px-3">{category.category_id}</td>
                                <td className="py-2 px-3">{category.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {questionsCheckResults.sampleQuestions && questionsCheckResults.sampleQuestions.length > 0 && (
                    <div>
                      <h4 className="font-medium">Sample Questions:</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                          {JSON.stringify(questionsCheckResults.sampleQuestions, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
          
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="useDirect"
              checked={useDirect}
              onChange={(e) => setUseDirect(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="useDirect" className="ml-2 block text-sm text-gray-900">
              Use direct SQL execution (pg library)
            </label>
          </div>
          
          {useDirect && (
            <p className="mb-4 text-sm text-gray-600 bg-blue-50 p-2 rounded">
              Direct execution uses the pg library with SSL certificate validation disabled to connect to Supabase.
              This allows for more complex queries and better error reporting.
            </p>
          )}
          
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
            <h3 className="font-semibold mb-2">SQL Execution Results:</h3>
            
            {sqlResults.error ? (
              <div className="text-red-700">
                <p><strong>Error:</strong> {sqlResults.error}</p>
                {sqlResults.details && <p><strong>Details:</strong> {sqlResults.details}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-green-600">
                  <strong>Success!</strong> Query executed successfully.
                </div>
                
                {sqlResults.connectionConfig && (
                  <div>
                    <strong>Connection Configuration:</strong> {sqlResults.connectionConfig}
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium">Row Count: {sqlResults.rowCount}</h4>
                  {sqlResults.rows && sqlResults.rows.length > 0 && (
                    <div className="overflow-x-auto">
                      <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                        {JSON.stringify(sqlResults.rows, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
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