import React from 'react';
import Link from 'next/link';
import { CategoryInfo } from '@/types';

interface CategoryCardProps {
  category: CategoryInfo;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link 
      href={`/quiz/${category.id}`}
      className="block p-6 bg-white/10 backdrop-blur-md rounded-lg shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
    >
      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
      <p className="text-sm opacity-80">{category.description}</p>
    </Link>
  );
};

export default CategoryCard; 