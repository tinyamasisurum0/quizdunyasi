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

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', scores: [] },
      { status: 500 }
    );
  }
}

// POST /api/scores - Save a new score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, score, category } = body;

    if (!username || score === undefined || !category) {
      return NextResponse.json(
        { error: 'Username, score, and category are required' },
        { status: 400 }
      );
    }

    const newScore = await saveScore(username, score, category);
    
    if (!newScore) {
      return NextResponse.json(
        { error: 'Failed to save score', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ score: newScore, success: true });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Failed to save score', success: false },
      { status: 500 }
    );
  }
} 