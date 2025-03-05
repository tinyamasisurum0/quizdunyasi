import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

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