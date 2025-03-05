import Link from 'next/link';
import { interestingCategories } from '@/lib/questions';
import CategoryCard from '@/components/CategoryCard';

export default function InterestingCategories() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">İlginç Kategoriler</h1>
          <Link 
            href="/"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interestingCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
} 