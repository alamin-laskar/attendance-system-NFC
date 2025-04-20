// ./src/context/authContext.js
'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();
    // Return cached user if within timeout
    if (!force && user && (now - lastCheck) < cacheTimeout) {
      return user;
    }

    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setLastCheck(now);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, lastCheck]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setLastCheck(0);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);