import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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

// Create a new pool for direct SQL execution
const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

export async function POST(request: NextRequest) {
  try {
    // Check if the request is coming from an admin
    // In a production app, you would implement proper authentication here
    // This is a simplified version for demonstration purposes
    
    // Parse the request body
    const body = await request.json();
    const { sql } = body;
    
    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'SQL query is required' },
        { status: 400 }
      );
    }
    
    // Log the SQL query for debugging
    console.log('Executing SQL query:', sql);
    
    // Execute the SQL query
    const client = await pool.connect();
    try {
      const result = await client.query(sql);
      
      return NextResponse.json({
        success: true,
        rowCount: result.rowCount,
        rows: result.rows,
        command: result.command
      });
    } catch (error) {
      console.error('SQL execution error:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'SQL execution failed', 
          details: (error as Error).message 
        },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in direct-sql API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 