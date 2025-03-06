import React, { useState, useEffect, useRef } from 'react';
import { User, Menu, X, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role: ''
  });
  
  const menuRef = useRef(null);
  const navigate = useNavigate();
  
  // Gère la fermeture du menu utilisateur lorsqu'un clic est effectué en dehors du menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);
  

  // Récupère les données utilisateur lors du montage du composant si l'ID utilisateur est présent dans le localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (userId) {
      fetchUserData(userId);
    }
  }, [localStorage.getItem('userId')]);
  
  // Fonction asynchrone pour récupérer les données utilisateur depuis l'API
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`);
      setUserData({
        nom: response.data.nom || '',
        prenom: response.data.prenom || '',
        email: response.data.mail || '',
        role: response.data.role || ''
      });
      localStorage.setItem('userRole', response.data.role || '');
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
  };
  
  // Déconnecte l'utilisateur en supprimant ses données d'authentification et redirige vers la page de connexion
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    setShowUserMenu(false);
    navigate('/login');
  };
  
  // Construire le nom d'affichage
  const displayName = userData.prenom || 'Utilisateur';
  const fullName = `${userData.prenom || ''} ${userData.nom || ''}`.trim() || 'Utilisateur';
  const email = userData.email || 'utilisateur@epconstruction.fr';
  
  return (
    <header className="bg-white shadow-sm z-10 border-b border-amber-100">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-amber-800">Gestion des Chantiers EP</h2>
        </div>
        
        <div className="flex items-center">
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center space-x-2 rounded-full hover:bg-amber-100 p-1 pr-2 cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <span className="text-gray-700 font-medium hidden md:inline-block">{displayName}</span>
            </div>
            
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200"
              >
                <div className="py-3 px-4 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{fullName}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} className="mr-2 text-gray-500" />
                    Mon profil
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-100">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;