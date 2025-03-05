import { NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';

export async function GET() {
  let client: PoolClient | null = null;
  
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

    console.log('Attempting connection with SSL disabled...');
    
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
      const result = await client.query('SELECT 1 as test');
      client.release();
      
      return NextResponse.json({
        success: true,
        message: 'Direct Supabase connection successful with SSL (rejectUnauthorized: false)',
        result: result.rows[0],
        connectionConfig: 'SSL with rejectUnauthorized: false'
      });
    } catch (sslError: any) {
      console.error('SSL connection failed:', sslError);
      
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
        const result = await client.query('SELECT 1 as test');
        client.release();
        
        return NextResponse.json({
          success: true,
          message: 'Direct Supabase connection successful with SSL disabled',
          result: result.rows[0],
          connectionConfig: 'SSL disabled'
        });
      } catch (noSslError: any) {
        console.error('No SSL connection failed:', noSslError);
        throw new Error(`SSL connection failed: ${sslError.message}\nNo SSL connection failed: ${noSslError.message}`);
      }
    }
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