// ./src/context/authContext.js
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from './toastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(0);
  const [rateLimitBackoff, setRateLimitBackoff] = useState(0);
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes

  const { showToast } = useToast() || {};

  // Memoize the checkAuth function
  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();

    // Check rate limit backoff
    if (rateLimitBackoff > now) {
      console.log('Rate limit backoff active, skipping auth check');
      return user;
    }

    // Use cached data if available and not forced refresh
    if (!force && user && (now - lastCheck) < cacheTimeout) {
      return user;
    }

    // Only set loading true if we're actually making a request
    if (!user || force) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
        const backoffUntil = now + (retryAfter * 1000);
        setRateLimitBackoff(backoffUntil);
        
        if (force && showToast) {
          showToast('Too many requests. Please try again later.', 'warning');
        }
        
        return user;
      }

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        setLastCheck(now);
        return data.user;
      } else {
        setUser(null);
        setError(data.message || 'Authentication failed');
        return null;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setError(error.message || 'Authentication check failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, lastCheck, rateLimitBackoff, showToast, cacheTimeout]);

  const clearAuth = useCallback(() => {
    setUser(null);
    setLastCheck(0);
    setError(null);
    setRateLimitBackoff(0);
  }, []);

  // Memoize the auth context value
  const authContextValue = useMemo(() => ({
    user, 
    loading, 
    error,
    checkAuth, 
    clearAuth,
    rateLimited: rateLimitBackoff > Date.now()
  }), [user, loading, error, checkAuth, clearAuth, rateLimitBackoff]);

  // Initial auth check when context is mounted
  useEffect(() => {
    let mounted = true;
    
    const initialCheck = async () => {
      if (mounted) {
        await checkAuth();
      }
    };
    
    initialCheck();
    
    return () => {
      mounted = false;
    };
  }, []); // Intentionally empty because checkAuth contains all necessary dependencies

  // Reset rate limit backoff when it expires
  useEffect(() => {
    if (rateLimitBackoff > 0) {
      const timeout = setTimeout(() => {
        setRateLimitBackoff(0);
      }, rateLimitBackoff - Date.now());

      return () => clearTimeout(timeout);
    }
  }, [rateLimitBackoff]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);