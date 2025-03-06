import React, { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, Calendar, LogOut, BookOpen } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  const isRestrictedRole = userRole === 'chef_chantier' || userRole === 'ouvrier';
  
  if (isRestrictedRole) {
    return null;
  }

  return (
    <div className="w-64 bg-amber-800 text-white flex flex-col h-full">
      <div className="p-5 border-b border-amber-700 flex items-center">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
          <Briefcase className="text-amber-800" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">EP Construction</h1>
          <p className="text-xs text-amber-200">Gestion des chantiers</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-4">
          <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2 pl-3">
            Principal
          </p>
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${isActive ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`
                }
                end
              >
                <Home className="mr-3" size={20} />
                <span>Tableau de bord</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/employees" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${isActive ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`
                }
              >
                <Users className="mr-3" size={20} />
                <span>Employés</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/projects" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${isActive ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`
                }
              >
                <Briefcase className="mr-3" size={20} />
                <span>Chantiers</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/skills" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${isActive ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`
                }
              >
                <BookOpen className="mr-3" size={20} />
                <span>Compétences</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/schedule" 
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${isActive ? 'bg-amber-700 text-white' : 'text-amber-100 hover:bg-amber-700 hover:text-white'}`
                }
              >
                <Calendar className="mr-3" size={20} />
                <span>Planning</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-amber-700">
        <button 
          onClick={handleLogout}
          className="flex items-center p-3 w-full rounded-lg text-amber-100 hover:bg-amber-700 hover:text-white"
        >
          <LogOut className="mr-3" size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;