import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Voters from './pages/Voters';
import Results from './pages/Results';
import SystemAdmins from './pages/SystemAdmins';
import Layout from './components/layout';

// Placeholder components for brevity (You can implement similarly to Voters/Admins)
const Candidates = () => <div className="text-white">Candidates Page (Implement using /api/admin/candidates)</div>;
const Staff = () => <div className="text-white">Staff Management (Implement using /api/auth/admin/roles)</div>;
const AuditLogs = () => <div className="text-white">Audit Logs (Implement using /api/audit/logs)</div>;
const Settings = () => <div className="text-white">Settings Page</div>;

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="voters" element={<Voters />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="results" element={<Results />} />
            <Route path="admins" element={<SystemAdmins />} />
            <Route path="staff" element={<Staff />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;