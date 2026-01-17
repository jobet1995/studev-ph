'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, SessionData } from '../lib/auth';

interface SessionContextType {
  isAuthenticated: boolean;
  user: SessionData['user'] | null;
  loading: boolean;
  validateAndRefreshSession: () => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SessionData['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  const validateAndRefreshSession = async () => {
    try {
      // Check if session exists and is not expired
      const tokenExists = !!authService.getToken();
      const expired = authService.isSessionExpired();

      if (!tokenExists || expired) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate session with backend
      const isValid = await authService.validateSession();
      
      if (isValid) {
        setIsAuthenticated(true);
        setUser(authService.getUser());
      } else {
        // Try to refresh the session
        const refreshed = await authService.refreshSession();
        if (refreshed) {
          setIsAuthenticated(true);
          setUser(authService.getUser());
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Session validation error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear session data
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('refresh_token');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    validateAndRefreshSession();
    
    // Set up periodic session validation
    const interval = setInterval(async () => {
      if (isAuthenticated) {
        await validateAndRefreshSession();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: SessionContextType = {
    isAuthenticated,
    user,
    loading,
    validateAndRefreshSession,
    logout
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};