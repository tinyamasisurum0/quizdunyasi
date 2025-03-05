import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Pool, PoolClient } from 'pg';
import { QuestionCategory } from '@/types';
import { allCategories } from '@/lib/questions';

// Helper function to save a question using direct SQL
async function saveQuestionDirect(
  client: PoolClient,
  id: string,
  question: string,
  options: string[],
  correct: number,
  points: number,
  difficulty: string,
  categoryId: string
) {
  const query = `
    INSERT INTO questions (id, question, options, correct, points, difficulty, category_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id) DO UPDATE SET
      question = EXCLUDED.question,
      options = EXCLUDED.options,
      correct = EXCLUDED.correct,
      points = EXCLUDED.points,
      difficulty = EXCLUDED.difficulty,
      category_id = EXCLUDED.category_id
    RETURNING id, question, options, correct, points, difficulty
  `;
  
  const values = [
    id,
    question,
    JSON.stringify(options),
    correct,
    points,
    difficulty,
    categoryId
  ];
  
  return client.query(query, values);
}

// This route is used to import questions from JSON files to the database
// It should be called once during deployment or first run
export async function GET() {
  let client: PoolClient | null = null;
  
  try {
    console.log('Starting questions import process...');
    const results = [];
    
    // Get connection details from environment variables
    const connectionString = process.env.POSTGRES_URL;
    
    if (!connectionString) {
      return NextResponse.json({
        success: false,
        error: 'POSTGRES_URL environment variable is not set'
      }, { status: 500 });
    }
    
    // Parse the connection string to remove sslmode if present (since SSL disabled worked before)
    let modifiedConnectionString = connectionString;
    if (connectionString.includes('sslmode=')) {
      modifiedConnectionString = connectionString.replace(/sslmode=[^&]+/, 'sslmode=disable');
    } else {
      modifiedConnectionString += connectionString.includes('?') ? '&sslmode=disable' : '?sslmode=disable';
    }
    
    // Create a pool and connect
    const pool = new Pool({ connectionString: modifiedConnectionString });
    client = await pool.connect();
    
    // Ensure the questions table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR(255) PRIMARY KEY,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct INTEGER NOT NULL,
        points INTEGER NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        category_id VARCHAR(255) NOT NULL
      )
    `);
    
    // Process each category
    for (const category of allCategories) {
      console.log(`Processing category: ${category.id}`);
      const filePath = path.join(process.cwd(), 'public', 'questions', `${category.id}.json`);
      
      try {
        // Read the JSON file
        console.log(`Reading file: ${filePath}`);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents) as QuestionCategory;
        
        console.log(`Found ${data.questions.length} questions for category ${category.id}`);
        
        // Import each question
        let importedCount = 0;
        for (const question of data.questions) {
          try {
            await saveQuestionDirect(
              client,
              question.id,
              question.question,
              question.options,
              question.correct,
              question.points,
              question.difficulty,
              category.id
            );
            importedCount++;
            
            if (importedCount % 10 === 0) {
              console.log(`Imported ${importedCount}/${data.questions.length} questions for ${category.id}`);
            }
          } catch (questionError) {
            console.error(`Error importing question ${question.id}:`, questionError);
          }
        }
        
        console.log(`Successfully imported ${importedCount} questions for category ${category.id}`);
        
        results.push({
          category: category.id,
          imported: importedCount,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error importing questions for category ${category.id}:`, error);
        results.push({
          category: category.id,
          error: (error as Error).message,
          status: 'error'
        });
      }
    }
    
    // Release the client
    if (client) {
      client.release();
      client = null;
    }
    
    console.log('Questions import completed');
    return NextResponse.json({ 
      message: 'Questions import completed',
      results 
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    
    // Release the client if it was acquired
    if (client) {
      try {
        (client as PoolClient).release();
      } catch (releaseError) {
        console.error('Error releasing client:', releaseError);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to import questions', details: (error as Error).message },
      { status: 500 }
    );
  }
} 