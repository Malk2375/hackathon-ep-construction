import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import ProjectManagement from './pages/ProjectManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SkillsManagement from './pages/SkillsManagement';
import AccessDenied from './pages/AccessDenied';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DefaultRedirect />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="employees" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EmployeeManagement />
            </ProtectedRoute>
          } />
          <Route path="projects" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProjectManagement />
            </ProtectedRoute>
          } />
          <Route path="schedule" element={
            <ProtectedRoute allowedRoles={['admin', 'chef_chantier', 'ouvrier']}>
              <ScheduleManagement />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="skills" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SkillsManagement />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function DefaultRedirect() {
  const role = localStorage.getItem('userRole');
  
  useEffect(() => {
    console.log("Redirection par défaut, rôle:", role);
  }, [role]);
  
  if (role === 'admin' || role === 'chef_admin') {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/schedule" replace />;
  }
}

export default App;