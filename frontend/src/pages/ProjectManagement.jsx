import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';


const getStatus = (dateDebut, dateFin) => {
  const today = new Date();
  const debut = dateDebut ? new Date(dateDebut) : null;
  const fin = dateFin ? new Date(dateFin) : null;

  if (!debut) return 'Planifié';
  if (debut > today) return 'Planifié';
  if (!fin || today <= fin) return 'En cours';
  return 'Terminé';
};

const ProjectManagement = () => {

  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [notification, setNotification] = useState(null);

  // Données de formulaire pour créer/éditer un chantier
  const [formData, setFormData] = useState({
    nom_chantier: '',
    date_debut: '',
    date_fin: '',
    adresse: '',
    description: ''
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [chefChantiers, setChefChantiers] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [originalChef, setOriginalChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState('');
  const [projectSkills, setProjectSkills] = useState({});
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const competencesResp = await axios.get('http://127.0.0.1:8000/api/competences');
      const formattedSkills = competencesResp.data.map(skill => ({
        value: skill.id,
        label: skill.nom_competence
      }));
      setAvailableSkills(formattedSkills);

      const usersResp = await axios.get('http://127.0.0.1:8000/api/users');
      const chefChantierUsers = usersResp.data.filter(u => {
        if (!u.role) return false;
        return u.role.toLowerCase().includes('chef_chantier');
      });
      const formattedChefs = chefChantierUsers.map(chef => ({
        value: chef.id,
        label: `${chef.nom || ''} ${chef.prenom || ''}`.trim()
      }));
      setChefChantiers(formattedChefs);

      const chantiersResp = await axios.get('http://127.0.0.1:8000/api/chantiers');
      const skillsMap = {};
      for (const c of chantiersResp.data) {
        try {
          const resp = await axios.get(`http://127.0.0.1:8000/api/chantier-competences?chantier_id=${c.id}`);
          skillsMap[c.id] = resp.data;
        } catch {
          skillsMap[c.id] = [];
        }
      }
      setProjectSkills(skillsMap);

      const affectsResp = await axios.get('http://127.0.0.1:8000/api/affectations');
      const chantierAffects = {};
      for (const aff of affectsResp.data) {
        if (aff.chantier && aff.chantier.id) {
          const cid = aff.chantier.id;
          if (!chantierAffects[cid]) {
            chantierAffects[cid] = [];
          }
          chantierAffects[cid].push(aff);
        }
      }

      const finalProjects = chantiersResp.data.map(chantier => {
        const status = getStatus(chantier.date_debut, chantier.date_fin);
        const affs = chantierAffects[chantier.id] || [];


        const chefAff = affs.find(a =>
          a.user && a.user.role && a.user.role.toLowerCase() === 'chef_chantier'
        );
        let chefNom = '';
        if (chefAff && chefAff.user) {
          chefNom = `${chefAff.user.nom || ''} ${chefAff.user.prenom || ''}`.trim();
        }

        return {
          ...chantier,
          status,
          chefNom
        };
      });

      setProjects(finalProjects);
      setError(null);
    } catch {
      setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = projects.filter(project => {
    if (!project) return false;
    const term = searchTerm.toLowerCase();
    return (
      project.nom_chantier.toLowerCase().includes(term) ||
      project.adresse.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term)
    );
  });

  const handleAddProject = () => {
    setCurrentProject(null);
    const today = new Date().toISOString().split('T')[0];

    setFormData({
      nom_chantier: '',
      date_debut: today,
      date_fin: '',
      adresse: '',
      description: ''
    });
    setSelectedSkills([]);
    setSelectedChef(null);
    setOriginalChef(null);
    setFormError(''); 
    setShowModal(true);
  };


  const handleEditProject = async (project) => {
    setCurrentProject(project);

    setFormData({
      nom_chantier: project.nom_chantier || '',
      date_debut: project.date_debut || '',
      date_fin: project.date_fin || '',
      adresse: project.adresse || '',
      description: project.description || ''
    });
    setFormError('');


    try {
      const resp = await axios.get(
        `http://127.0.0.1:8000/api/chantier-competences?chantier_id=${project.id}`
      );
      const selected = resp.data.map(item => ({
        value: item.competence.id,
        label: item.competence.nom_competence
      }));
      setSelectedSkills(selected);
    } catch {
      setSelectedSkills([]);
    }

    try {
      const affectsResp = await axios.get('http://127.0.0.1:8000/api/affectations');
      const projectAffects = affectsResp.data.filter(a =>
        a.chantier && a.chantier.id === project.id
      );
      const chefAff = projectAffects.find(a =>
        a.user &&
        a.user.role &&
        a.user.role.toLowerCase() === 'chef_chantier'
      );
      if (chefAff && chefAff.user) {
        const cid = chefAff.user.id;
        const found = chefChantiers.find(c => c.value === cid);
        if (found) {
          setSelectedChef(found);
          setOriginalChef(found.value); 
        } else {
          setSelectedChef(null);
          setOriginalChef(null);
        }
      } else {
        setSelectedChef(null);
        setOriginalChef(null);
      }
    } catch {
      setSelectedChef(null);
      setOriginalChef(null);
    }

    setShowModal(true);
  };


  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chantier ?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/chantiers/${projectId}`);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        showNotification('Le chantier a été supprimé avec succès.', 'success');
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        showNotification('Erreur lors de la suppression du chantier.', 'error');
      }
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); 

    const projectData = {
      nom_chantier: formData.nom_chantier,
      date_debut: formData.date_debut,
      date_fin: formData.date_fin || null,
      adresse: formData.adresse || '',
      description: formData.description || ''
    };

    let projectId;
    try {
      if (currentProject) {
        await axios.put(
          `http://127.0.0.1:8000/api/chantiers/${currentProject.id}`,
          projectData
        );
        projectId = currentProject.id;
      } else {
        const resp = await axios.post('http://127.0.0.1:8000/api/chantiers', projectData);
        projectId = resp.data.id;
      }
      if (currentProject) {
        try {
          const associations = await axios.get(
            `http://127.0.0.1:8000/api/chantier-competences?chantier_id=${projectId}`
          );
          if (associations.data && associations.data.length > 0) {
            for (const assoc of associations.data) {
              await axios.delete(`http://127.0.0.1:8000/api/chantier-competences/${assoc.id}`);
            }
          }
        } catch {}
      }
      for (const skill of selectedSkills) {
        await axios.post('http://127.0.0.1:8000/api/chantier-competences', {
          chantier_id: projectId,
          competence_id: skill.value,
          nb_competence: 1
        });
      }
      if (selectedChef && selectedChef.value !== originalChef) {
        try {

          const existingAffects = await axios.get(
            `http://127.0.0.1:8000/api/affectations?chantier_id=${projectId}`
          );
          for (const aff of existingAffects.data) {
            if (
              aff.role === 'chef_chantier' ||
              aff.role === 'CHEF_CHANTIER'
            ) {
              await axios.delete(`http://127.0.0.1:8000/api/affectations/${aff.id}`);
            }
          }

          const affectationData = {
            user_id: selectedChef.value,
            chantier_id: projectId,
            date_d: formData.date_debut,
            date_f: formData.date_fin || null
          };

          try {
            await axios.post('http://127.0.0.1:8000/api/affectations', affectationData);
          } catch (affErr) {
  
            if (affErr.response?.status === 409) {
              setFormError("Conflit : ce chef est déjà affecté sur cette période.");
              return; 
            } else {

              throw affErr;
            }
          }
        } catch {}
      }

      
      await fetchData();
      setShowModal(false);


      showNotification(
        currentProject 
          ? 'Le chantier a été mis à jour avec succès.' 
          : 'Le chantier a été créé avec succès.',
        'success'
      );

    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      showNotification('Une erreur s\'est produite lors de l\'enregistrement.', 'error');
    }
  };


  return (
    <div className="container mx-auto p-4 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6 text-amber-800">Gestion des Chantiers</h1>
        <button
          onClick={handleAddProject}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Chantier
        </button>
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

      {/* Affichage d'erreur global éventuel */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Rechercher un chantier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Spinner de chargement ou tableau */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Nom
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Date de début
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Date de fin
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Adresse
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Chef de chantier
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Compétences
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-amber-800 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-amber-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.nom_chantier}</div>
                      <div className="text-xs text-gray-500">{project.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          project.status === 'En cours'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'Terminé'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.date_debut
                        ? new Date(project.date_debut).toLocaleDateString()
                        : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.date_fin
                        ? new Date(project.date_fin).toLocaleDateString()
                        : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.adresse}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.chefNom || 'Non assigné'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {(projectSkills[project.id] || []).map((relation, idx) => (
                          relation.competence && (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800"
                            >
                              {relation.competence.nom_competence}
                            </span>
                          )
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-amber-600 hover:text-amber-800 mr-3"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-800"
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

      {/* Modale (formulaire) */}
      {showModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            {/* Overlay pour fond grisé */}
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>

            {/* Contenu de la modale */}
            <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full w-full mx-auto">
              {/* Bouton de fermeture */}
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
                <h3 className="text-lg leading-6 font-medium text-amber-800 mb-4">
                  {currentProject ? 'Modifier le chantier' : 'Ajouter un chantier'}
                </h3>

                {/* Message d'erreur spécifique au formulaire (conflit) */}
                {formError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="nom_chantier"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nom du chantier
                      </label>
                      <input
                        type="text"
                        id="nom_chantier"
                        name="nom_chantier"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.nom_chantier}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="date_debut"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Date de début
                        </label>
                        <input
                          type="date"
                          id="date_debut"
                          name="date_debut"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md
                                     focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={formData.date_debut}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="date_fin"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Date de fin
                        </label>
                        <input
                          type="date"
                          id="date_fin"
                          name="date_fin"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md
                                     focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={formData.date_fin}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="adresse"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Adresse
                      </label>
                      <input
                        type="text"
                        id="adresse"
                        name="adresse"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.adresse}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md
                                   focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="competences"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Compétences requises
                      </label>
                      <Select
                        isMulti
                        id="competences"
                        name="competences"
                        options={availableSkills}
                        value={selectedSkills}
                        onChange={setSelectedSkills}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="chef_chantier"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Chef de chantier
                      </label>
                      <Select
                        id="chef_chantier"
                        name="chef_chantier"
                        options={chefChantiers}
                        value={selectedChef}
                        onChange={setSelectedChef}
                        className="basic-select"
                        classNamePrefix="select"
                        isClearable
                        placeholder="Sélectionner un chef de chantier"
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 })
                        }}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                        onClick={() => setShowModal(false)}
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                      >
                        {currentProject ? 'Mettre à jour' : 'Ajouter'}
                      </button>
                    </div>
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

export default ProjectManagement;