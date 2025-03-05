import { NextResponse } from 'next/server';
import { allCategories } from '@/lib/questions';

export async function GET() {
  try {
    return NextResponse.json({ categories: allCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 