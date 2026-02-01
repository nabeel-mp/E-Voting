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
import VoterLogin from './pages/VoterLogin';
import VoterLayout from './components/VoterLayout';
import VoterDashboard from './pages/VoterDashboard';
import VotingBooth from './pages/VotingBooth';
import Landing from './pages/Landing';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/voter/login" element={<VoterLogin />} />

            {/* <Route path="/live-results" element={<PublicResults />} /> */}

            {/* --- Admin Protected Routes (Moved to /admin prefix) --- */}
            <Route path="/admin" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path='configuration' element={<Configuration />} />
              <Route path="voters" element={<Voters />} />
              <Route path="verification" element={<Verification />} />
              <Route path="elections" element={<Elections />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="results" element={<Results />} />
              <Route path="admins" element={<SystemAdmins />} />
              <Route path="staff" element={<Staff />} />
              <Route path="roles" element={<Roles />} />
              <Route path='assign-roles' element={<AssignRoles />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* --- Voter Protected Routes --- */}
            <Route path="/portal" element={<VoterLayout />}>
              <Route index element={<VoterDashboard />} />
              <Route path="vote/:id" element={<VotingBooth />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;