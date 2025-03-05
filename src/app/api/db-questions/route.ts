import { NextRequest, NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';
import { Question } from '@/types';

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
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'POSTGRES_URL environment variable is not set'
      }, { status: 500 });
    }
    
    // Parse the connection string to remove sslmode if present (since SSL disabled worked before)
    let modifiedConnectionString = connectionString;
    if (connectionString.includes('sslmode=')) {
      modifiedConnectionString = connectionString.replace(/sslmode=[^&]+/, 'sslmode=disable');
    } else {
      modifiedConnectionString += connectionString.includes('?') ? '&sslmode=disable' : '?sslmode=disable';
    }
    
    // Create a pool and connect
    const pool = new Pool({ connectionString: modifiedConnectionString });
    client = await pool.connect();
    
    // If countOnly is true, just return the count of questions
    if (countOnly) {
      // Get total count of questions
      const totalCountQuery = `SELECT COUNT(*) as total FROM questions`;
      const totalCountResult = await client.query(totalCountQuery);
      
      // Get count by category
      const categoryCountQuery = `
        SELECT category_id, COUNT(*) as count 
        FROM questions 
        GROUP BY category_id 
        ORDER BY count DESC
      `;
      const categoryCountResult = await client.query(categoryCountQuery);
      
      // Release the client
      client.release();
      client = null;
      
      return NextResponse.json({
        success: true,
        totalQuestions: parseInt(totalCountResult.rows[0].total),
        categoryCounts: categoryCountResult.rows,
        source: 'database-direct'
      });
    }
    
    // Query to get questions by category
    const query = `
      SELECT id, question, options, correct, points, difficulty
      FROM questions
      WHERE category_id = $1
      ORDER BY 
        CASE 
          WHEN difficulty = 'easy' THEN 1
          WHEN difficulty = 'medium' THEN 2
          WHEN difficulty = 'hard' THEN 3
          ELSE 4
        END,
        id
      LIMIT $2
    `;
    
    const result = await client.query(query, [categoryId, count]);
    
    // Also get the total count for this category
    const categoryCountQuery = `SELECT COUNT(*) as count FROM questions WHERE category_id = $1`;
    const categoryCountResult = await client.query(categoryCountQuery, [categoryId]);
    const totalInCategory = parseInt(categoryCountResult.rows[0].count);
    
    // Release the client
    client.release();
    client = null;
    
    const questions = result.rows;
    
    if (questions.length === 0) {
      return NextResponse.json(
        { 
          error: 'No questions found for this category',
          totalInCategory: 0
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      questions,
      source: 'database-direct',
      count: questions.length,
      totalInCategory
    });
  } catch (error: any) {
    console.error('Error fetching questions from database:', error);
    
    // Release the client if it was acquired
    if (client) {
      try {
        (client as PoolClient).release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch questions from database', details: error.message },
      { status: 500 }
    );
  }
} 