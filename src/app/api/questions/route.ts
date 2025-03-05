import { NextRequest, NextResponse } from 'next/server';
import { getQuizQuestions } from '@/lib/questions';
import { getDbQuizQuestions } from '@/lib/db';
import { Question } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 15;
    const useDb = searchParams.get('useDb') === 'true';

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Try to get questions from the database first
    let questions: Question[] = [];
    
    if (useDb) {
      // Use database as the source
      questions = await getDbQuizQuestions(categoryId, count);
    }
    
    // Fall back to JSON files if no questions found in the database or useDb is false
    if (questions.length === 0 && !useDb) {
      questions = await getQuizQuestions(categoryId, count);
    }
    
    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this category' },
        { status: 404 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 