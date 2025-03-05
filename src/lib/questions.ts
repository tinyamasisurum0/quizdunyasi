import fs from 'fs';
import path from 'path';
import { Question, QuestionCategory, CategoryInfo } from '@/types';

// Define the classic categories
export const classicCategories: CategoryInfo[] = [
  { id: 'literature', name: 'Edebiyat', description: 'Edebiyat dünyasından sorular', path: 'literature' },
  { id: 'art', name: 'Sanat', description: 'Sanat dünyasından sorular', path: 'art' },
  { id: 'math', name: 'Matematik', description: 'Matematik dünyasından sorular', path: 'math' },
  { id: 'technology', name: 'Teknoloji', description: 'Teknoloji dünyasından sorular', path: 'technology' },
  { id: 'music', name: 'Müzik', description: 'Müzik dünyasından sorular', path: 'music' },
  { id: 'history', name: 'Tarih', description: 'Tarih dünyasından sorular', path: 'history' },
  { id: 'geography', name: 'Coğrafya', description: 'Coğrafya dünyasından sorular', path: 'geography' },
  { id: 'science', name: 'Bilim', description: 'Bilim dünyasından sorular', path: 'science' },
  { id: 'sports', name: 'Spor', description: 'Spor dünyasından sorular', path: 'sports' },
  { id: 'movie_quotes', name: 'Film & Dizi', description: 'Film ve dizi dünyasından sorular', path: 'movie_quotes' },
];

// Define the interesting categories
export const interestingCategories: CategoryInfo[] = [
  { id: 'mysterious_history', name: 'Gizemli Tarih Olayları', description: 'Tarihin gizemli olaylarından sorular', path: 'mysterious_history' },
  { id: 'mythical_creatures', name: 'Efsanevi Yaratıklar', description: 'Efsanevi yaratıklardan sorular', path: 'mythical_creatures' },
  { id: 'sci_fi_world', name: 'Bilim Kurgu Dünyası', description: 'Bilim kurgu dünyasından sorular', path: 'sci_fi_world' },
  { id: 'weird_human_records', name: 'Tuhaf İnsan Rekorları', description: 'Tuhaf insan rekorlarından sorular', path: 'weird_human_records' },
  { id: 'lost_civilizations', name: 'Kayıp Medeniyetler', description: 'Kayıp medeniyetlerden sorular', path: 'lost_civilizations' },
  { id: 'urban_legends', name: 'Şehir Efsaneleri', description: 'Şehir efsanelerinden sorular', path: 'urban_legends' },
  { id: 'retro_games', name: 'Retro Oyunlar', description: 'Retro oyunlardan sorular', path: 'retro_games' },
  { id: 'space_mysteries', name: 'Uzay Gizemleri', description: 'Uzay gizemlerinden sorular', path: 'space_mysteries' },
  { id: 'animal_facts', name: 'Hayvan Davranışları', description: 'Hayvan davranışlarından sorular', path: 'animal_facts' },
  { id: 'general_knowledge', name: 'Genel Kültür', description: 'Genel kültür soruları', path: 'general_knowledge' },
];

// Combine all categories
export const allCategories = [...classicCategories, ...interestingCategories];

// Function to get category by ID
export function getCategoryById(id: string): CategoryInfo | undefined {
  return allCategories.find(category => category.id === id);
}

// Function to get questions for a category (server-side)
export async function getQuestionsForCategory(categoryId: string): Promise<Question[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'questions', `${categoryId}.json`);
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents) as QuestionCategory;
    
    // Sort questions by difficulty
    return data.questions.sort((a, b) => {
      const order = { "easy": 1, "medium": 2, "hard": 3 };
      return order[a.difficulty] - order[b.difficulty];
    });
  } catch (error) {
    console.error(`Error loading questions for category ${categoryId}:`, error);
    return [];
  }
}

// Function to get a subset of questions for a quiz
export async function getQuizQuestions(categoryId: string, count: number = 15): Promise<Question[]> {
  const allQuestions = await getQuestionsForCategory(categoryId);
  return allQuestions.slice(0, count);
} 