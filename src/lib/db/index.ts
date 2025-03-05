import { createPool } from '@vercel/postgres';
import { Score } from '@/types';

// Create a connection pool
let db: ReturnType<typeof createPool>;

try {
  db = createPool();
} catch (error) {
  console.error('Failed to create Postgres connection pool:', error);
  // This will be caught by the functions below
  throw error;
}

// Function to initialize the database schema
export async function initializeDatabase() {
  try {
    // Create scores table if it doesn't exist
    await db.sql`
      CREATE TABLE IF NOT EXISTS scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
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
      FROM scores
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
      FROM scores
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
      INSERT INTO scores (username, score, category)
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