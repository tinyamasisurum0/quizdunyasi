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
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-pink-900/40 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/10 transform hover:scale-[1.01] transition-all duration-300">
      <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Quiz Tamamlandı!</h2>
      
      <div className="bg-white/10 rounded-lg p-4 mb-6 shadow-inner">
        <p className="text-xl mb-2 text-center">
          Toplam Puanınız: 
          <span className="font-bold ml-2 text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">{score}</span>
        </p>
        <p className="text-md text-center">
          Kategori: <span className="font-semibold text-blue-300">{category}</span>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2 text-blue-200">
            Kullanıcı Adınız
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adınızı girin"
            className="w-full p-3 bg-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10 placeholder-white/50 shadow-inner transition-all duration-300"
            disabled={isSubmitting}
          />
          {error && (
            <div className="text-red-300 text-sm mt-2 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
              <p>{error}</p>
              {showSkipButton && (
                <p className="mt-1 text-xs text-red-200">
                  Veritabanı bağlantı sorunu olabilir. Puanınız kaydedilmeyecek.
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-purple-500/20 transform hover:translate-y-[-2px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Kaydediliyor...
              </span>
            ) : 'Puanı Kaydet'}
          </button>
          
          {showSkipButton && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg"
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