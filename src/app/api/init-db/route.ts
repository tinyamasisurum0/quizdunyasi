import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';
import { Pool } from 'pg';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

// This route is used to initialize the database schema
// It should be called once during deployment or first run
export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 