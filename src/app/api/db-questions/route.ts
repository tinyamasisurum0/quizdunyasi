import { NextRequest, NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';
import { Question } from '@/types';

// Helper function to get database URL from various environment variables
function getDatabaseUrl(): string {
  // Check for different possible environment variable names
  const possibleEnvVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING'
  ];
  
  for (const envVar of possibleEnvVars) {
    const url = process.env[envVar];
    if (url) {
      console.log(`Using database connection from ${envVar}`);
      return url;
    }
  }
  
  throw new Error('No database connection URL found in environment variables. Please set DATABASE_URL or POSTGRES_URL.');
}

export async function GET(request: NextRequest) {
  let client: PoolClient | null = null;
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 15;
    const countOnly = searchParams.get('countOnly') === 'true';
    
    if (!categoryId && !countOnly) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Fetching questions directly from database for category: ${categoryId || 'all'}, count: ${count}, countOnly: ${countOnly}`);
    
    // Get connection details from environment variables
    const connectionString = getDatabaseUrl();
    
    // Try with different SSL configurations
    // First attempt: SSL with rejectUnauthorized: false
    try {
      const pool = new Pool({ 
        connectionString,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      client = await pool.connect();
      
      if (countOnly) {
        // If countOnly is true, return the total count of questions and counts by category
        let totalQuery = 'SELECT COUNT(*) as total FROM questions';
        const totalResult = await client.query(totalQuery);
        const totalQuestions = parseInt(totalResult.rows[0].total);
        
        let categoryQuery = 'SELECT category_id, COUNT(*) as count FROM questions GROUP BY category_id ORDER BY count DESC';
        const categoryResult = await client.query(categoryQuery);
        
        client.release();
        client = null; // Set to null after release to avoid double-release
        
        return NextResponse.json({
          success: true,
          totalQuestions,
          categoryCounts: categoryResult.rows,
          source: 'database'
        });
      }
      
      if (categoryId) {
        // Get total count for this category
        const countQuery = 'SELECT COUNT(*) as total FROM questions WHERE category_id = $1';
        const countResult = await client.query(countQuery, [categoryId]);
        const totalInCategory = parseInt(countResult.rows[0].total);
        
        // Get questions for this category
        const query = 'SELECT * FROM questions WHERE category_id = $1 ORDER BY RANDOM() LIMIT $2';
        const result = await client.query(query, [categoryId, count]);
        
        // Map the database results to the Question type
        const questions: Question[] = result.rows.map((row: any) => ({
          id: row.id,
          question: row.question,
          options: row.options,
          correct: row.correct,
          points: row.points,
          difficulty: row.difficulty,
          category_id: row.category_id
        }));
        
        client.release();
        client = null; // Set to null after release to avoid double-release
        
        return NextResponse.json({
          success: true,
          count: questions.length,
          totalInCategory,
          questions,
          source: 'database'
        });
      }
      
      // If we get here, something went wrong with the parameters
      client.release();
      client = null; // Set to null after release to avoid double-release
      
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      );
    } catch (sslError: any) {
      console.error('SSL connection failed:', sslError);
      
      // Make sure to release the client if it was acquired
      if (client) {
        (client as PoolClient).release();
        client = null; // Set to null after release
      }
      
      // Second attempt: Try without SSL
      try {
        // Parse the connection string to remove sslmode if present
        let modifiedConnectionString = connectionString;
        if (connectionString.includes('sslmode=')) {
          modifiedConnectionString = connectionString.replace(/sslmode=[^&]+/, 'sslmode=disable');
        } else {
          modifiedConnectionString += connectionString.includes('?') ? '&sslmode=disable' : '?sslmode=disable';
        }
        
        const pool = new Pool({ connectionString: modifiedConnectionString });
        client = await pool.connect();
        
        if (countOnly) {
          // If countOnly is true, return the total count of questions and counts by category
          let totalQuery = 'SELECT COUNT(*) as total FROM questions';
          const totalResult = await client.query(totalQuery);
          const totalQuestions = parseInt(totalResult.rows[0].total);
          
          let categoryQuery = 'SELECT category_id, COUNT(*) as count FROM questions GROUP BY category_id ORDER BY count DESC';
          const categoryResult = await client.query(categoryQuery);
          
          client.release();
          client = null; // Set to null after release to avoid double-release
          
          return NextResponse.json({
            success: true,
            totalQuestions,
            categoryCounts: categoryResult.rows,
            source: 'database (SSL disabled)'
          });
        }
        
        if (categoryId) {
          // Get total count for this category
          const countQuery = 'SELECT COUNT(*) as total FROM questions WHERE category_id = $1';
          const countResult = await client.query(countQuery, [categoryId]);
          const totalInCategory = parseInt(countResult.rows[0].total);
          
          // Get questions for this category
          const query = 'SELECT * FROM questions WHERE category_id = $1 ORDER BY RANDOM() LIMIT $2';
          const result = await client.query(query, [categoryId, count]);
          
          // Map the database results to the Question type
          const questions: Question[] = result.rows.map((row: any) => ({
            id: row.id,
            question: row.question,
            options: row.options,
            correct: row.correct,
            points: row.points,
            difficulty: row.difficulty,
            category_id: row.category_id
          }));
          
          client.release();
          client = null; // Set to null after release to avoid double-release
          
          return NextResponse.json({
            success: true,
            count: questions.length,
            totalInCategory,
            questions,
            source: 'database (SSL disabled)'
          });
        }
        
        // If we get here, something went wrong with the parameters
        client.release();
        client = null; // Set to null after release to avoid double-release
        
        return NextResponse.json(
          { error: 'Invalid parameters' },
          { status: 400 }
        );
      } catch (noSslError: any) {
        console.error('No SSL connection failed:', noSslError);
        
        // Make sure to release the client if it was acquired
        if (client) {
          (client as PoolClient).release();
          client = null; // Set to null after release
        }
        
        throw new Error(`SSL connection failed: ${sslError.message}\nNo SSL connection failed: ${noSslError.message}`);
      }
    }
  } catch (error: any) {
    console.error('Error fetching questions from database:', error);
    
    // Make sure to release the client if it was acquired
    if (client) {
      try {
        (client as PoolClient).release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch questions from database', 
        details: error.message
      },
      { status: 500 }
    );
  }
} 