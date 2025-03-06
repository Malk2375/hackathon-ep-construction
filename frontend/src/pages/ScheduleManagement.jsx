import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  X, 
  AlertTriangle, 
  Users, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Eye, 
  Plus 
} from 'lucide-react';

const ScheduleManagement = () => {
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isLoadingChantier, setIsLoadingChantier] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillsMapping, setSkillsMapping] = useState({});
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type) => {
    setNotification({ message, type });
    
    // Faire disparaître la notification après 5 secondes
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Lire localStorage
        const storedRole = localStorage.getItem('userRole');   
        const storedUserId = localStorage.getItem('userId');   

        // Normaliser
        if (storedRole) {
          setUserRole(storedRole.toLowerCase());
        }
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }


        const chantiersResp = await axios.get('http://127.0.0.1:8000/api/chantiers');
        let allChantiers = chantiersResp.data; // tableau complet

       
        const affectsResp = await axios.get('http://127.0.0.1:8000/api/affectations');
        const allAffects = affectsResp.data;   // ex: [ {id, user_id, chantier_id, ...} ]
        console.log('[fetchData] allAffects =>', allAffects);

    
        if (storedRole) {
          const roleLower = storedRole.toLowerCase();
          if ((roleLower === 'chef_chantier' || roleLower === 'ouvrier') && storedUserId) {
            const uid = parseInt(storedUserId, 10);
           
            const userAffects = allAffects.filter(a => {
             
              if (a.user_id) {
                return a.user_id === uid;
              } else if (a.user && a.user.id) {
                return a.user.id === uid;
              }
              return false;
            });
            console.log('[fetchData] userAffects =>', userAffects);

            // En extraire la liste d'IDs de chantiers
            let chantierIds = [];
            for (const aff of userAffects) {
              let chId = null;
              if (aff.chantier_id) {
                chId = aff.chantier_id;
              } else if (aff.chantier && aff.chantier.id) {
                chId = aff.chantier.id;
              }
              if (chId && !chantierIds.includes(chId)) {
                chantierIds.push(chId);
              }
            }
            console.log('[fetchData] chantierIds =>', chantierIds);


            allChantiers = allChantiers.filter(c => chantierIds.includes(c.id));
          }
        }


        const events = allChantiers.map(chantier => ({
          id: chantier.id.toString(),
          title: chantier.nom_chantier,
          start: chantier.date_debut,
          end: chantier.date_fin,
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          extendedProps: {
            description: chantier.description,
            adresse: chantier.adresse,
            chantier,
          },
        }));
        setChantiers(events);


        const usersResp = await axios.get('http://127.0.0.1:8000/api/users');
        const ouvriers = usersResp.data.filter(u => 
          u.role && u.role.toLowerCase() === 'ouvrier'
        );


        const userCompsResp = await axios.get('http://127.0.0.1:8000/api/user-competences');
        const allUC = userCompsResp.data;

        // Fusion
        const workersWithSkills = ouvriers.map(ouvrier => {
          // Filtrer allUC
          const matchingUC = allUC.filter(uc => uc.user_id === ouvrier.id);
          // Extraire .competence
          const skills = matchingUC.map(uc => uc.competence);
          return {
            id: ouvrier.id,
            name: `${ouvrier.nom || ''} ${ouvrier.prenom || ''}`.trim(),
            skills,
          };
        });
        setAvailableWorkers(workersWithSkills);

        setLoading(false);
      } catch (err) {
        console.error('Erreur chargement initial:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventClick = (info) => {
    const chantierId = parseInt(info.event.id, 10);

    setRequiredSkills([]);
    setSkillsMapping({});
    setIsLoadingChantier(true);

    loadChantierDetails(chantierId);

    setCurrentEvent({
      id: chantierId,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      description: info.event.extendedProps.description,
      adresse: info.event.extendedProps.adresse,
      chantier: info.event.extendedProps.chantier,
    });
    setShowModal(true);
  };


  const loadChantierDetails = async (chantierId) => {
    try {
      // Charger compétences
      const compsResp = await axios.get(`http://127.0.0.1:8000/api/chantier-competences?chantier_id=${chantierId}`);
      const skills = compsResp.data.map(item => item.competence);
      setRequiredSkills(skills);

      // Charger toutes les affectations (on filtre localement)
      const affResp = await axios.get('http://127.0.0.1:8000/api/affectations');
      const allAffects = affResp.data;

      // Filtrer => chantierId
      const filtered = allAffects.filter(a => {
        let chId = null;
        if (a.chantier_id) {
          chId = a.chantier_id;
        } else if (a.chantier && a.chantier.id) {
          chId = a.chantier.id;
        }
        return (chId === chantierId);
      });

      // existingAffects => seulement ouvriers
      const existingAffects = filtered.filter(a => 
        a.user && a.user.role && a.user.role.toLowerCase() === 'ouvrier'
      );

      // skillId => { affected, available, showAdd: false }
      const newMapping = {};
      for (const skill of skills) {
        const workersWithSkill = availableWorkers.filter(w =>
          w.skills.some(ws => ws.id === skill.id)
        );
        const affected = [];
        const available = [];

        for (const w of workersWithSkill) {
          const matched = existingAffects.find(a => a.user && a.user.id === w.id);
          if (matched) {
            affected.push({ id: w.id, name: w.name });
          } else {
            available.push({ id: w.id, name: w.name });
          }
        }
        newMapping[skill.id] = {
          affected,
          available,
          showAdd: false,
        };
      }

      setSkillsMapping(newMapping);
    } catch (err) {
      console.error('Erreur loadChantierDetails:', err);
    } finally {
      setIsLoadingChantier(false);
    }
  };


  const toggleAddWorker = (skillId, val) => {
    setSkillsMapping(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        showAdd: val,
      },
    }));
  };

  const handleAddWorker = (skillId, workerId) => {
    setSkillsMapping(prev => {
      const skillData = prev[skillId];
      const newAvailable = skillData.available.filter(w => w.id !== workerId);
      const chosen = skillData.available.find(w => w.id === workerId);
      const newAffected = [...skillData.affected, chosen];
      return {
        ...prev,
        [skillId]: {
          ...skillData,
          available: newAvailable,
          affected: newAffected,
        },
      };
    });
  };

  const handleRemoveWorker = (skillId, workerId) => {
    setSkillsMapping(prev => {
      const skillData = prev[skillId];
      const newAffected = skillData.affected.filter(w => w.id !== workerId);
      const chosen = skillData.affected.find(w => w.id === workerId);
      const newAvailable = [...skillData.available, chosen];
      return {
        ...prev,
        [skillId]: {
          ...skillData,
          affected: newAffected,
          available: newAvailable,
        },
      };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentEvent) return;

    try {
      const chantierId = currentEvent.id;
      // Charger toutes les affectations, puis filtrer
      const affResp = await axios.get('http://127.0.0.1:8000/api/affectations');
      const allAffects = affResp.data;
      // Filtrer => chantierId
      const filtered = allAffects.filter(a => {
        let chId = null;
        if (a.chantier_id) {
          chId = a.chantier_id;
        } else if (a.chantier && a.chantier.id) {
          chId = a.chantier.id;
        }
        return (chId === chantierId);
      });
      // existingAffects => ouvriers
      const existingAffects = filtered.filter(a => 
        a.user && a.user.role && a.user.role.toLowerCase() === 'ouvrier'
      );

      // final
      let finalWorkerIds = [];
      for (const skillId of Object.keys(skillsMapping)) {
        const { affected } = skillsMapping[skillId];
        for (const w of affected) {
          if (!finalWorkerIds.includes(w.id)) {
            finalWorkerIds.push(w.id);
          }
        }
      }

      const startString = currentEvent.chantier.date_debut;
      const endString = currentEvent.chantier.date_fin;

      // create/update
      for (const workerId of finalWorkerIds) {
        const existing = existingAffects.find(a => a.user && a.user.id === workerId);
        if (existing) {
          if (existing.date_d !== startString || existing.date_f !== endString) {
            await axios.put(`http://127.0.0.1:8000/api/affectations/${existing.id}`, {
              user_id: workerId,
              chantier_id: chantierId,
              date_d: startString,
              date_f: endString,
            });
          }
        } else {
          await axios.post('http://127.0.0.1:8000/api/affectations', {
            user_id: workerId,
            chantier_id: chantierId,
            date_d: startString,
            date_f: endString,
          });
        }
      }

      // delete
      for (const aff of existingAffects) {
        if (!finalWorkerIds.includes(aff.user.id)) {
          await axios.delete(`http://127.0.0.1:8000/api/affectations/${aff.id}`);
        }
      }

      setShowModal(false);
      refreshCalendar();
      showNotification("Les affectations ont été enregistrées avec succès.", "success");
    } catch (err) {
      console.error('Erreur handleSubmit:', err);
      showNotification("Erreur lors de l'enregistrement des affectations.", "error");
    }
  };


  const refreshCalendar = async () => {
    try {

      const storedRole = localStorage.getItem('userRole');
      const storedUserId = localStorage.getItem('userId');


      const chantiersResp = await axios.get('http://127.0.0.1:8000/api/chantiers');
      let allChantiers = chantiersResp.data;


      const affResp = await axios.get('http://127.0.0.1:8000/api/affectations');
      const allAffects = affResp.data;

    
      if (storedRole) {
        const roleLower = storedRole.toLowerCase();
        if ((roleLower === 'chef_chantier' || roleLower === 'ouvrier') && storedUserId) {
          const uid = parseInt(storedUserId, 10);
          // Filtrer allAffects pour uid
          const userAffects = allAffects.filter(a => {
            if (a.user_id) {
              return a.user_id === uid;
            } else if (a.user && a.user.id) {
              return a.user.id === uid;
            }
            return false;
          });

          // En extraire chantierIds
          let chantierIds = [];
          for (const aff of userAffects) {
            let chId = null;
            if (aff.chantier_id) {
              chId = aff.chantier_id;
            } else if (aff.chantier && aff.chantier.id) {
              chId = aff.chantier.id;
            }
            if (chId && !chantierIds.includes(chId)) {
              chantierIds.push(chId);
            }
          }

          // Filtrer allChantiers
          allChantiers = allChantiers.filter(c => chantierIds.includes(c.id));
        }
      }

      // Transformer en events
      const events = allChantiers.map(chantier => ({
        id: chantier.id.toString(),
        title: chantier.nom_chantier,
        start: chantier.date_debut,
        end: chantier.date_fin,
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        extendedProps: {
          description: chantier.description,
          adresse: chantier.adresse,
          chantier,
        },
      }));
      setChantiers(events);

    } catch (err) {
      console.error('Erreur refreshCalendar:', err);
    }
  };


  return (
    <div className="mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Planning des Chantiers</h1>
        <p className="text-gray-600 mb-4">
          Visualisez et gérez le planning de vos chantiers. Cliquez sur un chantier pour voir les détails.
        </p>
      </div>

      {/* Notification - Repositionnée ici */}
      {notification && (
        <div 
          className={`${
            notification.type === 'success' 
              ? 'bg-green-100 border-green-400 text-green-700' 
              : 'bg-red-100 border-red-400 text-red-700'
          } px-4 py-3 rounded border shadow-md mb-4`}
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

      <div className="bg-white shadow-md rounded-lg p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-800"></div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek',
            }}
            events={chantiers}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.8}
            dayMaxEvents={3}
            locale="fr"
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
            }}
            eventDidMount={(info) => {
              info.el.style.marginBottom = '4px';
            }}
          />
        )}
      </div>

      {/* MODALE */}
      {showModal && currentEvent && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full max-w-3xl">
              {/* HEADER */}
              <div className="flex items-center justify-between bg-amber-500 text-white px-4 py-3">
                <h5 className="text-lg font-medium flex items-center">
                  <Briefcase className="inline-block mr-2" size={20} />
                  {currentEvent.title}
                </h5>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* BODY */}
              <div className="px-4 py-4 space-y-4">
                {/* Détails du chantier */}
                <div className="bg-gray-100 p-4 rounded-md">
                  <h6 className="font-bold mb-3 text-gray-700">Détails du chantier</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center text-sm">
                        <MapPin size={16} className="mr-1 text-gray-600" />
                        <span className="font-medium mr-1">Adresse:</span>
                        {currentEvent.adresse}
                      </p>
                      <p className="flex items-center text-sm">
                        <Calendar size={16} className="mr-1 text-gray-600" />
                        <span className="font-medium mr-1">Dates:</span>
                        {currentEvent.start
                          ? new Date(currentEvent.start).toLocaleDateString('fr-FR')
                          : ''}
                        {' - '}
                        {currentEvent.end
                          ? new Date(currentEvent.end).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center text-sm">
                        <Eye size={16} className="mr-1 text-gray-600" />
                        <span className="font-medium mr-1">Description:</span>
                        {currentEvent.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vue selon userRole */}
                {isLoadingChantier ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-800 mx-auto mb-2"></div>
                    <p className="text-gray-600">Chargement du chantier...</p>
                  </div>
                ) : userRole === 'ouvrier' ? (
                  <p className="text-sm text-gray-600">
                    Vous êtes affecté à ce chantier. (Aucune modification possible)
                  </p>
                ) : userRole === 'chef_chantier' ? (
                  <div>
                    <h6 className="font-bold text-amber-600 flex items-center mb-3">
                      <Users className="mr-2" size={18} />
                      Ouvriers affectés par compétence
                    </h6>
                    {requiredSkills.length === 0 ? (
                      <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md flex items-center">
                        <AlertTriangle size={18} className="mr-2" />
                        Aucune compétence requise
                      </div>
                    ) : (
                      requiredSkills.map(skill => {
                        const skillData = skillsMapping[skill.id];
                        if (!skillData) {
                          return (
                            <div key={skill.id} className="border-b border-gray-200 pb-3 mb-3">
                              <h6 className="text-amber-700 font-medium mb-2">
                                {skill.nom_competence}
                              </h6>
                              <p className="text-sm text-gray-500">Chargement...</p>
                            </div>
                          );
                        }
                        return (
                          <div key={skill.id} className="border-b border-gray-200 pb-3 mb-3">
                            <h6 className="text-amber-700 font-medium mb-2">
                              {skill.nom_competence}
                            </h6>
                            {skillData.affected.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {skillData.affected.map(worker => (
                                  <div
                                    key={worker.id}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded-md"
                                  >
                                    <span className="text-sm">{worker.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Aucun ouvrier affecté
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  // userRole === 'chef_admin' ou inconnu => accès total
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h6 className="font-bold text-amber-600 flex items-center">
                      <Users className="mr-2" size={18} />
                      Ouvriers affectés par compétence
                    </h6>

                    {requiredSkills.length === 0 ? (
                      <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-md flex items-center">
                        <AlertTriangle size={18} className="mr-2" />
                        Aucune compétence requise
                      </div>
                    ) : (
                      requiredSkills.map(skill => {
                        const skillData = skillsMapping[skill.id];
                        if (!skillData) {
                          return (
                            <div key={skill.id} className="border-b border-gray-200 pb-3 mb-3">
                              <h6 className="text-amber-700 font-medium mb-2">
                                {skill.nom_competence}
                              </h6>
                              <p className="text-sm text-gray-500">Chargement...</p>
                            </div>
                          );
                        }
                        return (
                          <div key={skill.id} className="border-b border-gray-200 pb-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                              <h6 className="text-amber-700 font-medium">{skill.nom_competence}</h6>
                              <button
                                type="button"
                                onClick={() => toggleAddWorker(skill.id, !skillData.showAdd)}
                                className="flex items-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <Plus size={16} className="mr-1" />
                                Ajouter
                              </button>
                            </div>

                            {skillData.affected.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {skillData.affected.map(worker => (
                                  <div
                                    key={worker.id}
                                    className="bg-green-100 text-green-800 px-2 py-1 rounded-md flex items-center space-x-2"
                                  >
                                    <span className="text-sm">{worker.name}</span>
                                    <button
                                      type="button"
                                      className="text-red-600 hover:text-red-900"
                                      onClick={() => handleRemoveWorker(skill.id, worker.id)}
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Aucun ouvrier affecté pour cette compétence
                              </p>
                            )}

                            {skillData.showAdd && (
                              <div className="mt-3">
                                {skillData.available.length > 0 ? (
                                  <>
                                    <p className="text-sm font-medium mb-1">
                                      Choisir un ouvrier :
                                    </p>
                                    <div className="space-y-1">
                                      {skillData.available.map(w => (
                                        <button
                                          key={w.id}
                                          type="button"
                                          onClick={() => handleAddWorker(skill.id, w.id)}
                                          className="block w-full text-left px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-sm mb-1"
                                        >
                                          {w.name}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    Aucun ouvrier supplémentaire disponible
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;