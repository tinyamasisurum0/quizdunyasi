'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define a type for category
interface Category {
  id: string;
  name: string;
  description: string;
  path: string;
}

export default function TestDbPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  
  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (response.ok && data.categories) {
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories:', data.error);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleTestDb = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    
    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Test with useDb=true
      const dbResponse = await fetch(`/api/questions?category=${selectedCategory}&useDb=true`);
      const dbData = await dbResponse.json();
      
      // Test with direct database endpoint
      const directDbResponse = await fetch(`/api/db-questions?category=${selectedCategory}`);
      const directDbData = await directDbResponse.json();
      
      // Test with useDb=false
      const jsonResponse = await fetch(`/api/questions?category=${selectedCategory}`);
      const jsonData = await jsonResponse.json();
      
      setTestResults({
        database: {
          success: dbResponse.ok,
          source: dbData.source,
          count: dbData.count,
          sample: dbData.questions?.slice(0, 2) || []
        },
        directDatabase: {
          success: directDbResponse.ok,
          source: directDbData.source,
          count: directDbData.count,
          sample: directDbData.questions?.slice(0, 2) || []
        },
        json: {
          success: jsonResponse.ok,
          source: jsonData.source,
          count: jsonData.count,
          sample: jsonData.questions?.slice(0, 2) || []
        }
      });
    } catch (error) {
      setTestResults({
        error: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Test Database Questions</h1>
          <Link href="/admin" className="text-blue-500 hover:text-blue-700">
            Back to Admin
          </Link>
        </div>
        
        <p className="mb-4 text-gray-600">
          This page helps you verify that questions are being retrieved from the database rather than JSON files.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Category
          </label>
          {categoriesLoading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
          ) : (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a category --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <button
          onClick={handleTestDb}
          disabled={isLoading || !selectedCategory || categoriesLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Database Retrieval'}
        </button>
        
        {testResults && (
          <div className="mt-6 space-y-6">
            <h2 className="text-xl font-semibold">Test Results</h2>
            
            {testResults.error ? (
              <div className="p-4 bg-red-100 text-red-700 rounded">
                <p><strong>Error:</strong> {testResults.error}</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded">
                  <h3 className="font-medium mb-2">Database Test (useDb=true)</h3>
                  <p><strong>Success:</strong> {testResults.database.success ? 'Yes' : 'No'}</p>
                  <p><strong>Source:</strong> {testResults.database.source}</p>
                  <p><strong>Questions Count:</strong> {testResults.database.count}</p>
                  
                  {testResults.database.sample.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Sample Questions:</strong></p>
                      <div className="max-h-60 overflow-y-auto mt-2">
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                          {JSON.stringify(testResults.database.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2">Direct Database Test</h3>
                  <p><strong>Success:</strong> {testResults.directDatabase.success ? 'Yes' : 'No'}</p>
                  <p><strong>Source:</strong> {testResults.directDatabase.source}</p>
                  <p><strong>Questions Count:</strong> {testResults.directDatabase.count}</p>
                  
                  {testResults.directDatabase.sample.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Sample Questions:</strong></p>
                      <div className="max-h-60 overflow-y-auto mt-2">
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                          {JSON.stringify(testResults.directDatabase.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2">JSON Test (useDb=false)</h3>
                  <p><strong>Success:</strong> {testResults.json.success ? 'Yes' : 'No'}</p>
                  <p><strong>Source:</strong> {testResults.json.source}</p>
                  <p><strong>Questions Count:</strong> {testResults.json.count}</p>
                  
                  {testResults.json.sample.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Sample Questions:</strong></p>
                      <div className="max-h-60 overflow-y-auto mt-2">
                        <pre className="bg-gray-800 text-green-400 p-2 rounded text-sm overflow-x-auto">
                          {JSON.stringify(testResults.json.sample, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-yellow-50 rounded">
                  <h3 className="font-medium mb-2">Comparison</h3>
                  <p>
                    <strong>Are questions coming from the database? </strong>
                    {testResults.database.source.includes('database') ? (
                      <span className="text-green-600">Yes! Questions are being retrieved from the database.</span>
                    ) : (
                      <span className="text-red-600">No. Questions are still coming from JSON files.</span>
                    )}
                  </p>
                  <p className="mt-2">
                    <strong>Direct database connection: </strong>
                    {testResults.directDatabase.success ? (
                      <span className="text-green-600">Working! Retrieved {testResults.directDatabase.count} questions.</span>
                    ) : (
                      <span className="text-red-600">Not working. Check server logs for details.</span>
                    )}
                  </p>
                  <p className="mt-2">
                    <strong>Recommendation: </strong>
                    {testResults.directDatabase.success ? (
                      <span className="text-green-600">Use the direct database connection by adding useDb=true to your quiz URLs.</span>
                    ) : (
                      <span className="text-amber-600">Fix the database connection issues before using database questions.</span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How to Use Database Questions</h2>
        
        <div className="space-y-4">
          <p>
            To use questions from the database in your quiz, add <code className="bg-gray-100 px-1 py-0.5 rounded">useDb=true</code> to the URL:
          </p>
          
          <div className="bg-gray-100 p-3 rounded">
            <code>/quiz/{selectedCategory || 'category-id'}?useDb=true</code>
          </div>
          
          {selectedCategory && (
            <div className="mt-4">
              <Link 
                href={`/quiz/${selectedCategory}?useDb=true`}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-block"
              >
                Try Quiz with Database Questions
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 