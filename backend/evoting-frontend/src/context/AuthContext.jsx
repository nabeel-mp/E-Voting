import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('admin_token', token);
    setUser(jwtDecode(token));
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);