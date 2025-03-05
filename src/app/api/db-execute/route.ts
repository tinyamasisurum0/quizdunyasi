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
    
    // Execute the query using tagged template literals correctly
    // We need to use a dynamic approach to execute raw SQL
    let result;
    
    try {
      // For SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        result = await db.sql`${sql}`;
      } 
      // For CREATE TABLE queries
      else if (sql.trim().toUpperCase().startsWith('CREATE TABLE')) {
        result = await db.sql`${sql}`;
      }
      // For INSERT queries
      else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        result = await db.sql`${sql}`;
      }
      // For other queries
      else {
        result = await db.sql`${sql}`;
      }
    } catch (sqlError) {
      console.error('SQL execution error:', sqlError);
      return NextResponse.json({
        error: 'SQL execution error',
        details: (sqlError as Error).message,
        note: "The @vercel/postgres package requires SQL to be executed as tagged template literals. Some complex queries may not work through this interface."
      }, { status: 500 });
    }
    
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