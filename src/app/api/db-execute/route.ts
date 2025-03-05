import { NextRequest, NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

export async function POST(request: NextRequest) {
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
    
    console.log('Executing SQL query:', sql);
    
    // Create a new connection pool
    const db = createPool();
    
    // Execute the query using tagged template literals
    // This is a workaround since db.sql.unsafe is not available
    const result = await db.sql([sql] as any);
    
    return NextResponse.json({
      success: true,
      rowCount: result.rowCount,
      rows: result.rows
    });
  } catch (error) {
    console.error('Error executing SQL query:', error);
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