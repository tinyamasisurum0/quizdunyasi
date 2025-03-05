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
    console.log('Starting questions import process...');
    const results = [];
    
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
    
    console.log('Questions import completed');
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