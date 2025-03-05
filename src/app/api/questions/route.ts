import { NextRequest, NextResponse } from 'next/server';
import { getDbQuizQuestions } from '@/lib/db';
import { Question } from '@/types';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category');
    const count = searchParams.get('count') ? parseInt(searchParams.get('count')!) : 15;
    
    if (!categoryId) {
      console.error('API error: Category ID is required');
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }
    
    console.log(`Fetching questions for category: ${categoryId}, count: ${count} (database only)`);
    
    try {
      // Only get questions from the database
      const questions = await getDbQuizQuestions(categoryId, count);
      
      if (!questions || questions.length === 0) {
        console.error(`No questions found in database for category: ${categoryId}`);
        return NextResponse.json(
          { error: `No questions found in database for category: ${categoryId}` },
          { status: 404, headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      }
      
      console.log(`Fetched ${questions.length} questions from database`);
      
      return NextResponse.json({
        count: questions.length,
        questions,
        source: 'database',
        timestamp: new Date().toISOString()
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    } catch (dbError) {
      console.error('Error fetching questions from database:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch questions from database',
          details: dbError instanceof Error ? dbError.message : 'Unknown error'
        },
        { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }
  } catch (error) {
    console.error('Error in questions API route:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
} 