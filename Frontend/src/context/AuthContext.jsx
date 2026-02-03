import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      try {
        const decoded = jwtDecode(adminToken);
        setUser({ ...decoded, role: 'ADMIN' }); 
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('admin_token');
      }
    }

    const voterToken = localStorage.getItem('voter_token');
    if (voterToken) {
      try {
        const decoded = jwtDecode(voterToken);
        setUser({ ...decoded, role: 'VOTER' }); 
      } catch (e) {
        localStorage.removeItem('voter_token');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (token, role = 'admin') => {
    if (role === 'voter') {
        localStorage.setItem('voter_token', token);
    } else {
        localStorage.setItem('admin_token', token);
    }
    const decoded = jwtDecode(token);
    setUser({ ...decoded, role: role.toUpperCase() });
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('voter_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);