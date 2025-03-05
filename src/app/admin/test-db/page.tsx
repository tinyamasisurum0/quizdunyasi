'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Define a type for category
interface Category {
  id: string;
  name: string;
  description: string;
  path: string;
}

function TestDbContent() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || '');
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
  
  // Auto-test when a category is provided in the URL
  useEffect(() => {
    if (categoryFromUrl && categories.length > 0 && !testResults && !isLoading) {
      handleTestDb();
    }
  }, [categoryFromUrl, categories, testResults, isLoading]);
  
  const handleTestDb = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }
    
    setIsLoading(true);
    setTestResults(null);
    
    try {
      // Test with direct database endpoint
      const directDbResponse = await fetch(`/api/db-questions?category=${selectedCategory}`);
      const directDbData = await directDbResponse.json();
      
      setTestResults({
        directDatabase: {
          success: directDbResponse.ok,
          source: directDbData.source,
          count: directDbData.count,
          totalInCategory: directDbData.totalInCategory,
          timestamp: directDbData.timestamp,
          sample: directDbData.questions?.slice(0, 2) || []
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Test Database Questions</h1>
        <div className="flex space-x-4">
          <Link href="/admin" className="text-blue-500 hover:text-blue-700">
            Back to Admin
          </Link>
          <Link href="/admin/db-stats" className="text-blue-500 hover:text-blue-700">
            Database Statistics
          </Link>
          <Link href="/admin/db-manage" className="text-blue-500 hover:text-blue-700">
            Database Management
          </Link>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="mb-4 text-gray-600">
            This page helps you verify database questions. The application now <strong>only</strong> uses questions from the database.
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
          
          <div className="flex space-x-4">
            <button
              onClick={handleTestDb}
              disabled={isLoading || !selectedCategory || categoriesLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Database Questions'}
            </button>
            
            {selectedCategory && (
              <Link 
                href={`/quiz/${selectedCategory}`}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Quiz with This Category
              </Link>
            )}
          </div>
          
          {testResults && (
            <div className="mt-6 space-y-6">
              <h2 className="text-xl font-semibold">Test Results</h2>
              
              {testResults.error ? (
                <div className="p-4 bg-red-100 text-red-700 rounded">
                  <p><strong>Error:</strong> {testResults.error}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-green-50 rounded">
                    <h3 className="font-medium mb-2">Database Questions</h3>
                    <p><strong>Success:</strong> {testResults.directDatabase.success ? 'Yes' : 'No'}</p>
                    <p><strong>Source:</strong> {testResults.directDatabase.source}</p>
                    <p><strong>Questions Count:</strong> {testResults.directDatabase.count}</p>
                    <p><strong>Total in Category:</strong> {testResults.directDatabase.totalInCategory}</p>
                    <p><strong>Timestamp:</strong> {testResults.directDatabase.timestamp}</p>
                    
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestDbPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <TestDbContent />
    </Suspense>
  );
} 