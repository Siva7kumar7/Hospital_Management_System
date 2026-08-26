import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('hms_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('auth/me/');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      localStorage.removeItem('hms_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await API.post('auth/login/', { username, password });
    localStorage.setItem('hms_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('auth/logout/');
    } catch (e) {
      console.warn("Logout error:", e);
    }
    localStorage.removeItem('hms_token');
    setUser(null);
  };

  const registerUser = async (userData) => {
    const res = await API.post('auth/register/', userData);
    localStorage.setItem('hms_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerUser, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
