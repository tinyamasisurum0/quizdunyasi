'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [initDbStatus, setInitDbStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [importResults, setImportResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
          
          <button
            onClick={handleInitDb}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
          >
            Initialize Database
          </button>
          
          {initDbStatus && (
            <div className={`mt-4 p-3 rounded ${initDbStatus.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {initDbStatus}
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
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        
        <ol className="list-decimal pl-5 space-y-2">
          <li>First, click <strong>Initialize Database</strong> to create the necessary database tables.</li>
          <li>Then, click <strong>Import Questions from JSON</strong> to import all questions from JSON files to the database.</li>
          <li>After importing, you can use the database as the source for questions by adding <code>useDb=true</code> to your API calls.</li>
          <li>Example: <code>/api/questions?category=history&useDb=true</code></li>
        </ol>
      </div>
    </div>
  );
} 