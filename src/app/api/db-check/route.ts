import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { Pool } from 'pg';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Checking database connection...');
    
    // Create a new connection pool
    const db = createPool();
    
    // Try the simplest possible query
    try {
      const result = await db.sql`SELECT 1 as test`;
      console.log('Basic query result:', result.rows);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        connectionTest: result.rows[0]
      });
    } catch (queryError) {
      console.error('Error executing basic query:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Failed to execute basic query',
        details: (queryError as Error).message,
        stack: (queryError as Error).stack
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating connection pool:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create database connection pool',
      details: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
} 