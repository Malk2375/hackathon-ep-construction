import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        mail,
        password
      });
      
      console.log('Réponse du serveur:', response.data);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userRole', response.data.user.role);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Configure axios pour inclure le token dans toutes les requêtes futures
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      setLoading(false);
      const role = response.data.user.role;
      if (role === 'admin' || role === 'chef_admin') {
        navigate('/dashboard');
      } else {
        navigate('/schedule');
      }
    } catch (err) {
      setLoading(false);
      console.error('Erreur de connexion:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-800">Connexion</h1>
          <p className="text-gray-600">Entrez vos identifiants pour accéder à votre compte</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="mail" className="block text-gray-700 text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                id="mail"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="votre.email@example.com"
                value={mail}
                onChange={(e) => setMail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                id="password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;