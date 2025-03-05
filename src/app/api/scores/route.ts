import { NextRequest, NextResponse } from 'next/server';
import { getTopScores, getTopScoresByCategory, saveScore } from '@/lib/db';

// GET /api/scores - Get top scores
// GET /api/scores?category=history - Get top scores for a category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    let scores;
    if (category) {
      scores = await getTopScoresByCategory(category, limit);
    } else {
      scores = await getTopScores(limit);
    }

    // Format dates properly for JSON serialization
    const formattedScores = scores.map(score => ({
      ...score,
      createdAt: score.createdAt instanceof Date 
        ? score.createdAt.toISOString() 
        : score.createdAt
    }));

    return NextResponse.json(
      { scores: formattedScores },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', scores: [] },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

// POST /api/scores - Save a new score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, score, category } = body;

    console.log('Received score submission:', { username, score, category });

    if (!username || score === undefined || !category) {
      console.error('Missing required fields:', { username, score, category });
      return NextResponse.json(
        { error: 'Username, score, and category are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    console.log('Attempting to save score to database...');
    try {
      const newScore = await saveScore(username, score, category);
      
      if (!newScore) {
        console.error('Failed to save score to database - saveScore returned null');
        return NextResponse.json(
          { error: 'Failed to save score', success: false, details: 'Database operation failed' },
          { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
        );
      }

      console.log('Score saved successfully:', newScore);
      return NextResponse.json(
        { score: newScore, success: true },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } catch (saveError) {
      console.error('Error in saveScore function:', saveError);
      return NextResponse.json(
        { 
          error: 'Failed to save score', 
          success: false, 
          details: saveError instanceof Error ? saveError.message : 'Unknown error in saveScore function'
        },
        { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }
  } catch (error) {
    console.error('Error in scores POST handler:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save score', 
        success: false, 
        details: error instanceof Error ? error.message : 'Unknown error in request processing'
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
} 