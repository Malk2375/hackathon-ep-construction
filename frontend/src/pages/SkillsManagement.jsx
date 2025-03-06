import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';

const SkillsManagement = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkill, setEditingSkill] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Fonction pour afficher une notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
  
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Récupérer les compétences depuis l'API
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/competences');
      setSkills(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la récupération des compétences:", err);
      setError("Impossible de charger les compétences. Veuillez réessayer plus tard.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Ajouter une nouvelle compétence
  const handleAddSkill = async (e) => {
    e.preventDefault();
    
    if (!newSkill.trim()) return;
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/competences', {
        nom_competence: newSkill
      });
      
      setSkills([...skills, response.data]);
      setNewSkill('');
      showNotification("La compétence a été ajoutée avec succès.", "success");
    } catch (err) {
      console.error("Erreur lors de l'ajout de la compétence:", err);
      showNotification("Erreur lors de l'ajout de la compétence. Veuillez réessayer.", "error");
    }
  };

  // Supprimer une compétence
  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) {
      return;
    }
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/competences/${id}`);
      setSkills(skills.filter(skill => skill.id !== id));
      showNotification("La compétence a été supprimée avec succès.", "success");
    } catch (err) {
      console.error("Erreur lors de la suppression de la compétence:", err);
      showNotification("Erreur lors de la suppression de la compétence. Veuillez réessayer.", "error");
    }
  };

  // Commencer l'édition d'une compétence
  const startEditing = (skill) => {
    setEditingSkill(skill.id);
    setEditValue(skill.nom_competence);
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingSkill(null);
    setEditValue('');
  };

  // Sauvegarder les modifications
  const saveEdit = async (id) => {
    if (!editValue.trim()) return;
    
    try {
      await axios.put(`http://127.0.0.1:8000/api/competences/${id}`, {
        nom_competence: editValue
      });
      
      setSkills(skills.map(skill => 
        skill.id === id ? { ...skill, nom_competence: editValue } : skill
      ));
      
      setEditingSkill(null);
      setEditValue('');
      showNotification("La compétence a été modifiée avec succès.", "success");
    } catch (err) {
      console.error("Erreur lors de la modification de la compétence:", err);
      showNotification("Erreur lors de la modification de la compétence. Veuillez réessayer.", "error");
    }
  };

  // Filtrer les compétences selon le terme de recherche
  const filteredSkills = skills.filter(skill => 
    skill.nom_competence && skill.nom_competence.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-800">Gestion des Compétences</h1>
      </div>
      
      {notification && (
        <div 
          className={`${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded relative border`}
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
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-amber-800 mb-4">Ajouter une nouvelle compétence</h2>
        <form onSubmit={handleAddSkill} className="flex items-center space-x-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Nom de la compétence"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Ajouter
          </button>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-amber-800">Liste des compétences</h2>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Rechercher une compétence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-6 text-gray-500 text-center">
            {searchTerm ? "Aucune compétence ne correspond à votre recherche." : "Aucune compétence n'a été ajoutée."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredSkills.map(skill => (
              <li key={skill.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  {editingSkill === skill.id ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(skill.id)}
                        className="p-2 text-green-600 hover:text-green-800"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-gray-600 hover:text-gray-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-800">{skill.nom_competence}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEditing(skill)}
                          className="p-2 text-amber-600 hover:text-amber-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SkillsManagement; 