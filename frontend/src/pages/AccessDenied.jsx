import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();
  
  const handleRedirect = () => {
    navigate('/schedule');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <ShieldAlert size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={handleRedirect}
            className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
          >
            Retour au Planning
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 