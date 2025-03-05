import { NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';

export async function GET() {
  let client: PoolClient | null = null;
  
  try {
    console.log('Checking questions in database...');
    
    // Get connection details from environment variables
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'POSTGRES_URL environment variable is not set'
      }, { status: 500 });
    }
    
    // Try with SSL disabled since that worked before
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
      
      // Check if questions table exists
      const tableCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'questions'
        )
      `);
      
      const tableExists = tableCheckResult.rows[0].exists;
      
      if (!tableExists) {
        client.release();
        return NextResponse.json({
          success: false,
          error: 'Questions table does not exist',
          tableExists: false
        });
      }
      
      // Count questions
      const countResult = await client.query('SELECT COUNT(*) FROM questions');
      const questionCount = parseInt(countResult.rows[0].count);
      
      // Get sample questions (limit to 5)
      const sampleResult = await client.query(`
        SELECT id, question, options, correct, points, difficulty, category_id
        FROM questions
        LIMIT 5
      `);
      
      // Get category distribution
      const categoryResult = await client.query(`
        SELECT category_id, COUNT(*) as count
        FROM questions
        GROUP BY category_id
        ORDER BY count DESC
      `);
      
      client.release();
      client = null;
      
      return NextResponse.json({
        success: true,
        tableExists,
        questionCount,
        sampleQuestions: sampleResult.rows,
        categoryCounts: categoryResult.rows,
        connectionConfig: 'SSL disabled'
      });
    } catch (error: any) {
      console.error('Error checking questions:', error);
      
      // Make sure to release the client if it was acquired
      if (client) {
        (client as PoolClient).release();
        client = null;
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to check questions',
        details: error.message,
        stack: error.stack
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in check-questions route:', error);
    
    // Make sure to release the client if it was acquired
    if (client) {
      try {
        (client as PoolClient).release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check questions',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 