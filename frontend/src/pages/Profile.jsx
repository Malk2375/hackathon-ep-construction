import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Briefcase, Camera, Save, X } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error("Utilisateur non connecté");
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`);
      const user = response.data;

      setUserData({
        id: user.id,
        name: `${user.prenom} ${user.nom}`,
        email: user.mail,
        role: mapRoleToDisplay(user.role),
        rawRole: user.role,
        address: user.adresse || '',
        skills: user.competences ? user.competences.split(', ').filter(s => s !== '') : []
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données utilisateur. Veuillez réessayer.");
      setLoading(false);
    }
  };
  
  const mapRoleToDisplay = (role) => {
    switch (role) {
      case 'chef_chantier':
        return 'Chef de chantier';
      case 'ouvrier':
        return 'Ouvrier';
      case 'admin': 
      case 'chef_admin':
        return 'Administrateur';
      default:
        return role;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({...userData, [name]: value});
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const [prenom, ...nomParts] = userData.name.split(' ');
      const nom = nomParts.join(' ');
      
      const apiData = {
        prenom: prenom,
        nom: nom,
        mail: userData.email,
        role: userData.rawRole,
        adresse: userData.address,
        competences: userData.skills.join(', ')
      };
      
      await axios.put(`http://127.0.0.1:8000/api/users/${userData.id}`, apiData);
      setIsEditing(false);
      showNotification('Profil mis à jour avec succès', 'success');
      fetchUserData();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      showNotification("Erreur lors de la mise à jour du profil. Veuillez réessayer.", "error");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!userData) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-800">Mon Profil</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-md ${
            isEditing 
              ? 'bg-gray-200 text-gray-700' 
              : 'bg-amber-600 text-white hover:bg-amber-700'
          }`}
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </button>
      </div>
      
      {/* Affichage des notifications */}
      {notification && (
        <div 
          className={`${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded relative border mb-4`}
          role="alert"
        >
          <span className="block sm:inline">{notification.message}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setNotification(null)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-amber-600 h-32 relative">
          <div className="absolute -bottom-16 left-6 flex items-end">
            <div className="w-32 h-32 bg-white rounded-full border-4 border-white overflow-hidden">
              <div className="w-full h-full bg-amber-200 flex items-center justify-center">
                <User size={64} className="text-amber-600" />
              </div>
            </div>
            {isEditing && (
              <button className="bg-amber-500 text-white p-2 rounded-full absolute bottom-0 right-0 hover:bg-amber-600">
                <Camera size={18} />
              </button>
            )}
          </div>
        </div>
        
        <div className="pt-20 px-6 pb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                    <User className="mr-2" size={20} />
                    Informations personnelles
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={userData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      ) : (
                        <p className="text-gray-800">{userData.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="flex items-center">
                        <Mail size={16} className="text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        ) : (
                          <p className="text-gray-800">{userData.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle
                      </label>
                      <div className="flex items-center">
                        <Briefcase size={16} className="text-gray-400 mr-2" />
                        <p className="text-gray-800">{userData.role}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <div className="flex items-start">
                        <MapPin size={16} className="text-gray-400 mr-2 mt-1" />
                        {isEditing ? (
                          <textarea
                            id="address"
                            name="address"
                            value={userData.address}
                            onChange={handleInputChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        ) : (
                          <p className="text-gray-800">{userData.address || 'Non renseignée'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                    <Briefcase className="mr-2" size={20} />
                    Compétences
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compétences
                      </label>
                      {/* Afficher les compétences en lecture seule même en mode édition */}
                      <div className="flex flex-wrap gap-2">
                        {userData.skills.length > 0 ? (
                          userData.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Aucune compétence renseignée</p>
                        )}
                      </div>
                      {isEditing && (
                        <p className="mt-2 text-xs text-gray-500">
                          Les compétences ne peuvent être modifiées que par l'administrateur.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Enregistrer les modifications
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile; 