import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 shadow-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h1>
        <p className="text-xl mb-8">
          Aradığınız sayfa bulunamadı veya taşınmış olabilir.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
} 