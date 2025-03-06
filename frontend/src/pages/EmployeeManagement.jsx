import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    mail: '',
    mdp: '',
    role: 'ROLE_USER',
    adresse: ''
  });
  
  // Définir les rôles disponibles
  const roles = [
    { value: 'chef_chantier', label: 'Chef de chantier' },
    { value: 'ouvrier', label: 'Ouvrier' },
    { value: 'chef_admin', label: 'Administration' }
  ];
  
  // Fonction pour formater l'affichage des rôles
  const formatRole = (role) => {
    switch(role) {
      case 'chef_chantier':
        return 'Chef de Chantier';
      case 'chef_admin':
        return 'Administration';
      case 'ouvrier':
        return 'Ouvrier';
      default:
        return 'Non défini';
    }
  };
  
  // Fonction réutilisable pour récupérer les compétences d'un utilisateur
  const fetchUserCompetences = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/user-competences?user_id=${userId}`);
      return response.data.map(association => association.competence?.nom_competence || null).filter(competence => competence !== null);
    } catch (err) {
      return [];
    }
  };
  
  // Fonction de formatage des données employés
  const formatEmployeesData = (users, userSkillsMap) => {
    return users.map(emp => ({
      id: emp.id,
      name: `${emp.prenom} ${emp.nom}`,
      role: emp.role || 'Non défini',
      formattedRole: formatRole(emp.role),
      skills: userSkillsMap[emp.id] || [],
      email: emp.mail,
      address: emp.adresse || 'Non renseignée'
    }));
  };
  
  // Charger les employés depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [competencesResponse, usersResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/competences'),
          axios.get('http://127.0.0.1:8000/api/users')
        ]);
        
        // Formater les compétences pour le sélecteur
        const formattedSkills = competencesResponse.data.map(skill => ({
          value: skill.id,
          label: skill.nom_competence
        }));
        setAvailableSkills(formattedSkills);
        
        // Récupérer toutes les associations utilisateur-compétence en une seule requête
        const allCompetencesResponse = await axios.get('http://127.0.0.1:8000/api/user-competences');
        const userSkillsMap = {};
        usersResponse.data.forEach(user => {
          userSkillsMap[user.id] = [];
        });
        
        // Remplir le dictionnaire avec les compétences de chaque utilisateur
        allCompetencesResponse.data.forEach(association => {
          if (association.user_id && association.competence && association.competence.nom_competence) {
            if (!userSkillsMap[association.user_id]) {
              userSkillsMap[association.user_id] = [];
            }
            userSkillsMap[association.user_id].push(association.competence.nom_competence);
          }
        });
        const formattedEmployees = formatEmployeesData(usersResponse.data, userSkillsMap);
        setEmployees(formattedEmployees);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchTermLower) ||
      employee.formattedRole.toLowerCase().includes(searchTermLower) ||
      employee.email.toLowerCase().includes(searchTermLower) ||
      employee.skills.some(skill => skill.toLowerCase().includes(searchTermLower))
    );
  });
  
  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setFormData({
      nom: '',
      prenom: '',
      mail: '',
      mdp: '',
      role: 'ouvrier',
      adresse: ''
    });
    setSelectedSkills([]);
    setShowModal(true);
  };
  
  // Gérer la modification d'un employé existant
  const handleEditEmployee = (employee) => {
    const nameParts = employee.name.split(' ');
    const prenom = nameParts[0];
    const nom = nameParts.slice(1).join(' ');
    setCurrentEmployee(employee);
    setFormData({
      id: employee.id,
      nom: nom,
      prenom: prenom,
      mail: employee.email,
      mdp: '',
      role: employee.role,
      adresse: employee.address === 'Non renseignée' ? '' : employee.address
    });
    
    // Récupérer les compétences de l'employé
    const employeeSkills = employee.skills.map(skillName => {
      const skill = availableSkills.find(s => s.label === skillName);
      return skill || null;
    }).filter(skill => skill !== null);
    
    setSelectedSkills(employeeSkills);
    setShowModal(true);
  };
  
  // Fonction pour afficher une notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/users/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
        showNotification("L'employé a été supprimé avec succès.", "success");
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        showNotification("Erreur lors de la suppression. Veuillez réessayer.", "error");
      }
    }
  };
  
  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };
  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Création ou mise à jour de l'utilisateur
      let userResponse;
      if (currentEmployee) {
        // Mise à jour d'un utilisateur existant
        userResponse = await axios.put(`http://127.0.0.1:8000/api/users/${currentEmployee.id}`, formData);
      } else {
        // Création d'un nouvel utilisateur
        userResponse = await axios.post('http://127.0.0.1:8000/api/users', formData);
      }
      const userId = userResponse.data.id;
      // Utiliser Promise.all pour supprimer toutes les compétences existantes
      if (currentEmployee) {
        const userCompetencesResponse = await axios.get(`http://127.0.0.1:8000/api/user-competences?user_id=${userId}`);
        await Promise.all(
          userCompetencesResponse.data.map(association => axios.delete(`http://127.0.0.1:8000/api/user-competences/${association.id}`))
        );
      }
      
      // Ajouter les nouvelles compétences en parallèle
      await Promise.all(
        selectedSkills.map(skill => axios.post('http://127.0.0.1:8000/api/user-competences', {user_id: userId, competence_id: skill.value}))
      );
      
      // Mettre à jour l'employé dans la liste locale
      if (currentEmployee) {
        // Mise à jour d'un employé existant
        const newSkills = selectedSkills.map(skill => skill.label);
        setEmployees(prev => prev.map(emp => 
          emp.id === userId ? {
            ...emp,
            name: `${formData.prenom} ${formData.nom}`,
            role: formData.role,
            formattedRole: formatRole(formData.role),
            skills: newSkills,
            email: formData.mail,
            address: formData.adresse || 'Non renseignée'
          } : emp
        ));
        
        showNotification("L'employé a été mis à jour avec succès.", "success");
      } else {
        // Ajout d'un nouvel employé
        // Récupérer les compétences du nouvel employé
        const newSkills = selectedSkills.map(skill => skill.label);
        
        // Ajouter le nouvel employé à la liste
        const newEmployee = {
          id: userId,
          name: `${formData.prenom} ${formData.nom}`,
          role: formData.role,
          formattedRole: formatRole(formData.role),
          skills: newSkills,
          email: formData.mail,
          address: formData.adresse || 'Non renseignée'
        };
        setEmployees(prev => [...prev, newEmployee]);  
        showNotification("L'employé a été ajouté avec succès.", "success");
      }
      
      setShowModal(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      showNotification("Erreur lors de l'enregistrement. Veuillez vérifier les informations et réessayer.", "error");
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des employés</h1>
      
      {/* Affichage des notifications */}
      {notification && (
        <div 
          className={`${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded relative mb-4 border`}
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={handleAddEmployee}
          className="flex items-center px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un employé
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compétences
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun employé trouvé
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.formattedRole}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.length === 0 ? (
                          <span className="text-sm text-gray-500">Aucune compétence</span>
                        ) : (
                          employee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full w-full mx-auto">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {currentEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.nom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.prenom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="mail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="mail"
                        name="mail"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.mail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="mdp" className="block text-sm font-medium text-gray-700 mb-1">
                        {currentEmployee ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                      </label>
                      <input
                        type="password"
                        id="mdp"
                        name="mdp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.mdp}
                        onChange={handleInputChange}
                        required={!currentEmployee}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Rôle
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        name="adresse"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.adresse}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="competences" className="block text-sm font-medium text-gray-700 mb-1">
                        Compétences
                      </label>
                      <Select
                        id="competences"
                        isMulti
                        name="competences"
                        options={availableSkills}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        value={selectedSkills}
                        onChange={setSelectedSkills}
                        placeholder="Sélectionner des compétences..."
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({ ...base, zIndex: 2 })
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-700"
                    >
                      {currentEmployee ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;