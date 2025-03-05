import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { saveQuestion } from '@/lib/db';
import { QuestionCategory } from '@/types';
import { allCategories } from '@/lib/questions';

// This route is used to import questions from JSON files to the database
// It should be called once during deployment or first run
export async function GET() {
  try {
    const results = [];
    
    // Process each category
    for (const category of allCategories) {
      const filePath = path.join(process.cwd(), 'public', 'questions', `${category.id}.json`);
      
      try {
        // Read the JSON file
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContents) as QuestionCategory;
        
        // Import each question
        let importedCount = 0;
        for (const question of data.questions) {
          await saveQuestion(
            question.id,
            question.question,
            question.options,
            question.correct,
            question.points,
            question.difficulty,
            category.id
          );
          importedCount++;
        }
        
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
    
    return NextResponse.json({ 
      message: 'Questions import completed',
      results 
    });
  } catch (error) {
    console.error('Error importing questions:', error);
    return NextResponse.json(
      { error: 'Failed to import questions' },
      { status: 500 }
    );
  }
} 