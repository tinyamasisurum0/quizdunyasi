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
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching questions for category: ${categoryId}, count: ${count}, useDb: ${useDb}`);

    // Try to get questions from the database first
    let questions: Question[] = [];
    let source = 'unknown';
    
    if (useDb) {
      // Use database as the source - try direct database connection first
      console.log('Attempting to fetch questions directly from database...');
      try {
        const dbResponse = await fetch(`${request.nextUrl.origin}/api/db-questions?category=${categoryId}&count=${count}`);
        
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          questions = dbData.questions;
          source = dbData.source;
          console.log(`Retrieved ${questions.length} questions directly from database`);
        } else {
          console.log('Direct database fetch failed, falling back to @vercel/postgres');
          // Fall back to @vercel/postgres
          questions = await getDbQuizQuestions(categoryId, count);
          source = 'database-vercel';
          console.log(`Retrieved ${questions.length} questions from database via @vercel/postgres`);
        }
      } catch (dbError) {
        console.error('Error fetching from direct database:', dbError);
        // Fall back to @vercel/postgres
        questions = await getDbQuizQuestions(categoryId, count);
        source = 'database-vercel';
        console.log(`Retrieved ${questions.length} questions from database via @vercel/postgres`);
      }
    }
    
    // Fall back to JSON files if no questions found in the database or useDb is false
    if (questions.length === 0) {
      if (useDb) {
        console.log('No questions found in database, falling back to JSON files');
      } else {
        console.log('Using JSON files as the source (useDb=false)');
      }
      
      questions = await getQuizQuestions(categoryId, count);
      source = 'json';
      console.log(`Retrieved ${questions.length} questions from JSON files`);
    }
    
    if (questions.length === 0) {
      console.log('No questions found for this category in either source');
      return NextResponse.json(
        { error: 'No questions found for this category' },
        { status: 404 }
      );
    }

    console.log(`Returning ${questions.length} questions from ${source}`);
    return NextResponse.json({ 
      questions,
      source,
      count: questions.length
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 