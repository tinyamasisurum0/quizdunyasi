import { createPool } from '@vercel/postgres';
import { Score, Question } from '@/types';

// Helper function to get database URL from various environment variables
function getDatabaseUrl(): string {
  // Check for different possible environment variable names
  const possibleEnvVars = [
    'DATABASE_URL',
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING'
  ];
  
  for (const envVar of possibleEnvVars) {
    const url = process.env[envVar];
    if (url) {
      console.log(`Using database connection from ${envVar}`);
      return url;
    }
  }
  
  throw new Error('No database connection URL found in environment variables. Please set DATABASE_URL or POSTGRES_URL.');
}

// Create a connection pool
let db: ReturnType<typeof createPool>;

try {
  // Check if required environment variables are set
  const requiredEnvVars = [
    'POSTGRES_URL',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_HOST',
    'POSTGRES_DATABASE'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
  
  // Create the connection pool
  db = createPool();
  console.log('Successfully created Postgres connection pool');
} catch (error) {
  console.error('Failed to create Postgres connection pool:', error);
  // This will be caught by the functions below
  throw error;
}

// Helper function to modify connection string for different SSL modes
function getConnectionWithSslMode(baseUrl: string, sslMode: string): string {
  // Remove any existing sslmode parameter
  let url = baseUrl.replace(/(\?|&)sslmode=[^&]*(&|$)/, '$1');
  
  // Add the new sslmode parameter
  if (url.includes('?')) {
    url = url + '&sslmode=' + sslMode;
  } else {
    url = url + '?sslmode=' + sslMode;
  }
  
  return url;
}

// Function to initialize the database schema
export async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Check connection
    const connectionTest = await db.sql`SELECT current_database()`;
    console.log('Connected to database:', connectionTest.rows[0]);
    
    // Create scores table if it doesn't exist - using a simpler approach
    console.log('Creating scores table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create questions table if it doesn't exist - using a simpler approach
    console.log('Creating questions table...');
    await db.sql`
      CREATE TABLE IF NOT EXISTS questions (
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
    const scoresExists = await db.sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scores'
      )
    `;
    
    const questionsExists = await db.sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'questions'
      )
    `;
    
    console.log('Tables created:', {
      scores: scoresExists.rows[0].exists,
      questions: questionsExists.rows[0].exists
    });
    
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
    console.log(`Saving score: username=${username}, score=${score}, category=${category}`);
    
    // First check if the scores table exists
    try {
      const tableCheck = await db.sql`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'scores'
        )
      `;
      
      const tableExists = tableCheck.rows[0].exists;
      
      if (!tableExists) {
        console.log('Scores table does not exist, creating it...');
        await db.sql`
          CREATE TABLE IF NOT EXISTS scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;
        console.log('Scores table created successfully');
      }
    } catch (tableCheckError) {
      console.error('Error checking/creating scores table:', tableCheckError);
      // Continue to try the insert anyway
    }
    
    try {
      const result = await db.sql<Score>`
        INSERT INTO scores (username, score, category)
        VALUES (${username}, ${score}, ${category})
        RETURNING id, username, score, category, created_at as "createdAt"
      `;
      
      console.log('Score saved successfully:', result.rows[0]);
      return result.rows[0];
    } catch (insertError) {
      console.error('Error inserting score with @vercel/postgres:', insertError);
      throw insertError; // Let the pg fallback handle it
    }
  } catch (error) {
    console.error('Error saving score with @vercel/postgres:', error);
    // Try with direct connection using pg if @vercel/postgres fails
    try {
      console.log('Attempting to save score using direct pg connection...');
      const { Pool } = require('pg');
      const connectionString = getDatabaseUrl();
      
      if (!connectionString) {
        throw new Error('No database connection URL found in environment variables');
      }
      
      console.log('Using connection string (masked):', connectionString.replace(/:[^:@]*@/, ':***@'));
      
      // Try different SSL configurations
      const sslConfigs = [
        { name: 'sslmode=disable', connectionString: getConnectionWithSslMode(connectionString, 'disable'), ssl: undefined },
        { name: 'SSL with rejectUnauthorized=false', connectionString: connectionString, ssl: { rejectUnauthorized: false } },
        { name: 'sslmode=prefer', connectionString: getConnectionWithSslMode(connectionString, 'prefer'), ssl: undefined },
        { name: 'Default connection string', connectionString: connectionString, ssl: undefined },
        { name: 'SSL disabled', connectionString: connectionString, ssl: false }
      ];
      
      let client = null;
      let pool = null;
      let connError: Error | null = null;
      
      // Try each SSL configuration until one works
      for (const sslTest of sslConfigs) {
        try {
          console.log(`Trying connection with ${sslTest.name}...`);
          pool = new Pool({ 
            connectionString: sslTest.connectionString,
            ssl: sslTest.ssl
          });
          
          client = await pool.connect();
          console.log(`Connected to database with pg client using ${sslTest.name}`);
          break; // Exit the loop if connection is successful
        } catch (err) {
          console.error(`Connection failed with ${sslTest.name}:`, err);
          connError = err instanceof Error ? err : new Error(String(err));
        }
      }
      
      if (!client) {
        throw new Error(`Failed to connect to database: ${connError?.message || 'Unknown error'}`);
      }
      
      // Check if scores table exists
      const tableCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'scores'
        )
      `);
      
      const tableExists = tableCheckResult.rows[0].exists;
      
      if (!tableExists) {
        console.log('Scores table does not exist, creating it with pg client...');
        await client.query(`
          CREATE TABLE IF NOT EXISTS scores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Scores table created successfully with pg client');
      }
      
      const pgResult = await client.query(`
        INSERT INTO scores (username, score, category)
        VALUES ($1, $2, $3)
        RETURNING id, username, score, category, created_at as "createdAt"
      `, [username, score, category]);
      
      client.release();
      
      console.log('Score saved successfully using direct pg connection:', pgResult.rows[0]);
      return pgResult.rows[0];
    } catch (pgError) {
      console.error('Error saving score with direct pg connection:', pgError);
      return null;
    }
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
      INSERT INTO questions (id, question, options, correct, points, difficulty, category_id)
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
      FROM questions
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