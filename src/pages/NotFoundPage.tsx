
import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message = "Página não encontrada." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white text-center p-4">
      <h1 className="text-6xl font-bold text-blue-500 mb-4">404</h1>
      <p className="text-xl mb-8">{message}</p>
      <Link 
        to="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
