import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScoreFormProps {
  score: number;
  category: string;
  onSubmit: (username: string) => void;
}

const ScoreForm: React.FC<ScoreFormProps> = ({ score, category, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Lütfen bir kullanıcı adı girin');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit(username);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      setError(`Puan kaydedilirken bir hata oluştu: ${errorMessage}`);
      console.error('Error submitting score:', error);
      
      // Show skip button after error
      setShowSkipButton(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Quiz Tamamlandı!</h2>
      <p className="text-xl mb-2">
        Toplam Puanınız: <span className="font-bold">{score}</span>
      </p>
      <p className="text-md mb-6">
        Kategori: <span className="font-semibold">{category}</span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Kullanıcı Adınız
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adınızı girin"
            className="w-full p-3 bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {error && (
            <div className="text-red-400 text-sm mt-1 p-2 bg-red-900/20 rounded">
              <p>{error}</p>
              {showSkipButton && (
                <p className="mt-1 text-xs">
                  Veritabanı bağlantı sorunu olabilir. Puanınız kaydedilmeyecek.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Puanı Kaydet'}
          </button>
          
          {showSkipButton && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Ana Sayfaya Dön
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ScoreForm; 