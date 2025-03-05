import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  let client = null;
  
  try {
    // Parse the request body
    const body = await request.json();
    const { sql } = body;
    
    if (!sql) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }
    
    console.log('Executing SQL query directly:', sql);
    
    // Get connection details from environment variables
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'POSTGRES_URL environment variable is not set'
      }, { status: 500 });
    }
    
    // Create a new pool with the connection string
    const pool = new Pool({ connectionString });
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Execute the query
    const result = await client.query(sql);
    
    // Release the client back to the pool
    client.release();
    
    return NextResponse.json({
      success: true,
      rowCount: result.rowCount,
      rows: result.rows
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
    
    // Make sure to release the client if it was acquired
    if (client) {
      client.release();
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to execute SQL query', 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
} 