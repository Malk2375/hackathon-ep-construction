import React, { useState, useEffect } from 'react';
import { Users, Briefcase, CheckCircle, Calendar } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    plannedProjects: 0,
    employees: 0,
    completedProjects: 0
  });
  
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupère les données du tableau de bord lors du montage du composant
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [chantiersResponse, employeesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/chantiers'),
          axios.get('http://127.0.0.1:8000/api/users')
        ]);
        
        const chantiers = chantiersResponse.data;
        const employees = employeesResponse.data;
        const now = new Date();
        
        let activeCount = 0;
        let plannedCount = 0;
        let completedCount = 0;
        const formattedProjects = [];
        
        // Parcourt les chantiers pour calculer les statistiques et formater les projets
        chantiers.forEach(chantier => {
          const startDate = new Date(chantier.date_debut || chantier.date_d);
          const endDate = chantier.date_fin || chantier.date_f ? new Date(chantier.date_fin || chantier.date_f) : null;
          const projectName = chantier.nom_chantier || chantier.nom;
          const address = chantier.adresse || '';
        
          if (isNaN(startDate.getTime())) {
            return; 
          }

          let status;
          if (now < startDate) {
            status = 'Planifié';
            plannedCount++;
          } else if (endDate && now > endDate) {
            status = 'Terminé';
            completedCount++;
          } else {
            status = 'En cours';
            activeCount++;
          }

          formattedProjects.push({
            id: chantier.id,
            name: projectName,
            status: status,
            startDate: startDate,
            endDate: endDate,
            address: address
          });
        });

        // Trie les projets par date de début et sélectionne les plus récents
        formattedProjects.sort((a, b) => b.startDate - a.startDate);
        const recentProjects = formattedProjects.slice(0, 6);
        setStats({
          activeProjects: activeCount,
          plannedProjects: plannedCount,
          employees: employees.length,
          completedProjects: completedCount
        });
        setRecentProjects(recentProjects);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la récupération des données du tableau de bord:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Formate une date en format français
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-800">Tableau de bord</h1>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Aujourd'hui:</span>
          <span className="font-medium">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-green-500">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <Briefcase className="text-green-800" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chantiers actifs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.activeProjects}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-amber-500">
              <div className="rounded-full bg-amber-100 p-3 mr-4">
                <Calendar className="text-amber-800" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chantiers planifiés</p>
                <p className="text-2xl font-bold text-gray-800">{stats.plannedProjects}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-blue-500">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Users className="text-blue-800" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Employés</p>
                <p className="text-2xl font-bold text-gray-800">{stats.employees}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 flex items-center border-l-4 border-purple-500">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <CheckCircle className="text-purple-800" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chantiers terminés</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedProjects}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-amber-800">Chantiers récents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Nom du chantier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Date début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Date fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun chantier trouvé
                      </td>
                    </tr>
                  ) : (
                    recentProjects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{project.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.startDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(project.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'En cours' 
                              ? 'bg-green-100 text-green-800' 
                              : project.status === 'Planifié'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;