import { createPool } from '@vercel/postgres';
import { Score, Question } from '@/types';

// Create a connection pool
let db: ReturnType<typeof createPool>;

try {
  db = createPool();
  console.log('Successfully created Postgres connection pool');
} catch (error) {
  console.error('Failed to create Postgres connection pool:', error);
  // This will be caught by the functions below
  throw error;
}

// Function to initialize the database schema
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Check connection
    const connectionTest = await db.sql`SELECT current_database(), current_schema()`;
    console.log('Connected to database:', connectionTest.rows[0]);
    
    // Create scores table if it doesn't exist
    console.log('Creating scores table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS public.scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create questions table if it doesn't exist
    console.log('Creating questions table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS public.questions (
        id VARCHAR(255) PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct INTEGER NOT NULL,
        points INTEGER NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        category_id VARCHAR(255) NOT NULL
      )
    `;
    
    // Verify tables were created
    const tables = await db.sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `;
    
    console.log('Tables in public schema:', tables.rows.map(row => row.table_name));
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Function to get top scores
export async function getTopScores(limit: number = 10): Promise<Score[]> {
  try {
    const result = await db.sql<Score>`
      SELECT id, username, score, category, created_at as "createdAt"
      FROM public.scores
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting top scores:', error);
    // Return empty array if database is not available
    return [];
  }
}

// Function to get top scores by category
export async function getTopScoresByCategory(category: string, limit: number = 10): Promise<Score[]> {
  try {
    const result = await db.sql<Score>`
      SELECT id, username, score, category, created_at as "createdAt"
      FROM public.scores
      WHERE category = ${category}
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting top scores by category:', error);
    // Return empty array if database is not available
    return [];
  }
}

// Function to save a score
export async function saveScore(username: string, score: number, category: string): Promise<Score | null> {
  try {
    const result = await db.sql<Score>`
      INSERT INTO public.scores (username, score, category)
      VALUES (${username}, ${score}, ${category})
      RETURNING id, username, score, category, created_at as "createdAt"
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving score:', error);
    // Return null if database is not available
    return null;
  }
}

// Function to save a question
export async function saveQuestion(
  id: string,
  question: string,
  options: string[],
  correct: number,
  points: number,
  difficulty: string,
  categoryId: string
): Promise<Question | null> {
  try {
    const result = await db.sql<Question>`
      INSERT INTO public.questions (id, question, options, correct, points, difficulty, category_id)
      VALUES (${id}, ${question}, ${JSON.stringify(options)}, ${correct}, ${points}, ${difficulty}, ${categoryId})
      ON CONFLICT (id) DO UPDATE SET
        question = EXCLUDED.question,
        options = EXCLUDED.options,
        correct = EXCLUDED.correct,
        points = EXCLUDED.points,
        difficulty = EXCLUDED.difficulty,
        category_id = EXCLUDED.category_id
      RETURNING id, question, options, correct, points, difficulty
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error saving question:', error);
    return null;
  }
}

// Function to get questions by category
export async function getQuestionsByCategory(categoryId: string, limit: number = 100): Promise<Question[]> {
  try {
    const result = await db.sql<Question>`
      SELECT id, question, options, correct, points, difficulty
      FROM public.questions
      WHERE category_id = ${categoryId}
      ORDER BY 
        CASE 
          WHEN difficulty = 'easy' THEN 1
          WHEN difficulty = 'medium' THEN 2
          WHEN difficulty = 'hard' THEN 3
          ELSE 4
        END,
        id
      LIMIT ${limit}
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting questions by category:', error);
    return [];
  }
}

// Function to get a subset of questions for a quiz
export async function getDbQuizQuestions(categoryId: string, count: number = 15): Promise<Question[]> {
  try {
    const allQuestions = await getQuestionsByCategory(categoryId);
    return allQuestions.slice(0, count);
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    return [];
  }
} 