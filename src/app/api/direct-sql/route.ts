import { NextRequest, NextResponse } from 'next/server';
import { Pool, PoolClient } from 'pg';

export async function POST(request: NextRequest) {
  let client: PoolClient | null = null;
  
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
      const result = await client.query(sql);
      client.release();
      
      return NextResponse.json({
        success: true,
        rowCount: result.rowCount,
        rows: result.rows,
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
        const result = await client.query(sql);
        client.release();
        
        return NextResponse.json({
          success: true,
          rowCount: result.rowCount,
          rows: result.rows,
          connectionConfig: 'SSL disabled'
        });
      } catch (noSslError: any) {
        console.error('No SSL connection failed:', noSslError);
        throw new Error(`SSL connection failed: ${sslError.message}\nNo SSL connection failed: ${noSslError.message}`);
      }
    }
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