// nabeel-mp/e-voting/E-Voting-e827307a9ccaf9e84bf5d22239f0e8c4b0f5aa02/backend/evoting-frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Voters from './pages/Voters';
import Results from './pages/Results';
import SystemAdmins from './pages/SystemAdmins';
import Candidates from './pages/Candidates';
import Staff from './pages/Staff';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Layout from './components/layout';
import Roles from './pages/Role';
import Elections from './pages/Election';
import Verification from './pages/Verification';
import AssignRoles from './pages/AssignROle';
import Configuration from './pages/Configuration';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>          
              <Route path="/login" element={<Login />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='configuration' element={<Configuration />} />
            <Route path="voters" element={<Voters />} />
            <Route path="verification" element={<Verification />} />
            <Route path="voters" element={<Voters />} />
            <Route path="elections" element={<Elections />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="results" element={<Results />} />
            <Route path="admins" element={<SystemAdmins />} />
            <Route path="staff" element={<Staff />} />
            <Route path="Roles" element={<Roles />} />
            <Route path='assign-roles' element={<AssignRoles/>} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;