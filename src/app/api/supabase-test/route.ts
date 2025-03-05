import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  let client = null;
  
  try {
    console.log('Testing direct Supabase connection...');
    
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
    
    // Test the connection with a simple query
    const result = await client.query('SELECT 1 as test');
    
    // Release the client back to the pool
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Direct Supabase connection successful',
      result: result.rows[0]
    });
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    
    // Make sure to release the client if it was acquired
    if (client) {
      client.release();
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Supabase',
      details: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 