import { NextRequest, NextResponse } from 'next/server';
import { getQuizQuestions } from '@/lib/questions';
import { getDbQuizQuestions } from '@/lib/db';
import { Question } from '@/types';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 15;
    const useDb = searchParams.get('useDb') === 'true';

    if (!categoryId) {
      console.error('API error: Category ID is required');
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching questions for category: ${categoryId}, count: ${count}, useDb: ${useDb}`);

    // Try to get questions from the database first
    let questions: Question[] = [];
    let source = 'json';

    if (useDb) {
      try {
        console.log('Attempting to fetch questions from database');
        const dbQuestions = await getDbQuizQuestions(categoryId, count);
        
        if (dbQuestions && dbQuestions.length > 0) {
          questions = dbQuestions;
          source = 'database';
          console.log(`Successfully fetched ${questions.length} questions from database`);
        } else {
          console.log('No questions found in database, falling back to JSON');
        }
      } catch (dbError) {
        console.error('Error fetching questions from database:', dbError);
        // Continue to fallback to JSON
      }
    }

    // If no questions from DB or useDb is false, get from JSON
    if (questions.length === 0) {
      console.log('Fetching questions from JSON files');
      questions = await getQuizQuestions(categoryId, count);
      source = 'json';
      console.log(`Fetched ${questions.length} questions from JSON files`);
    }

    if (questions.length === 0) {
      console.error(`No questions found for category: ${categoryId}`);
      return NextResponse.json(
        { error: `No questions found for category: ${categoryId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      count: questions.length,
      questions,
      source
    });
  } catch (error) {
    console.error('Error in questions API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 