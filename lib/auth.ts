import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

// Advanced types for session management
export interface SessionData {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    role: string;
    profilePicture?: string;
    permissions: string[];
  };
  expiresAt: number;
  issuedAt: number;
  refreshTokenExpiresAt?: string;
}

export interface AuthConfig {
  tokenName: string;
  refreshTokenName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge: number;
  };
  localStorageKeys: {
    token: string;
    refreshToken: string;
    user: string;
    sessionState: string;
  };
  tokenExpirationBuffer: number; // in seconds (default 5 minutes)
}

/**
 * Default configuration for authentication system
 */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  tokenName: 'auth_token',
  refreshTokenName: 'refresh_token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
  localStorageKeys: {
    token: 'admin_token',
    refreshToken: 'refresh_token',
    user: 'admin_user',
    sessionState: 'session_state',
  },
  tokenExpirationBuffer: 5 * 60, // 5 minutes
};

/**
 * Advanced authentication service class
 */
export class AuthService {
  private config: AuthConfig;

  constructor(config: Partial<AuthConfig> = {}) {
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config };
  }

  /**
   * Initialize session with token and user data
   * @param sessionData - The session data including tokens, user info, and expiration times
   */
  public setSession(sessionData: SessionData): void {
    const { token, refreshToken, user, expiresAt, issuedAt, refreshTokenExpiresAt } = sessionData;
    
    // Store in localStorage
    localStorage.setItem(this.config.localStorageKeys.token, token);
    localStorage.setItem(this.config.localStorageKeys.user, JSON.stringify(user));
    localStorage.setItem(this.config.localStorageKeys.sessionState, JSON.stringify({
      expiresAt,
      issuedAt,
      userId: user.id
    }));

    if (refreshToken) {
      localStorage.setItem(this.config.localStorageKeys.refreshToken, refreshToken);
      
      // Store refresh token expiration if provided
      if (refreshTokenExpiresAt) {
        localStorage.setItem(this.config.localStorageKeys.refreshToken + '_expiresAt', refreshTokenExpiresAt);
      }
    }

    // Set HttpOnly cookie for security
    this.setCookie(this.config.tokenName, token);
    if (refreshToken) {
      this.setCookie(this.config.refreshTokenName, refreshToken);
    }
  }

  /**
   * Get authentication token from various sources
   */
  public getToken(): string | null {
    // Try localStorage first
    const tokenFromStorage = localStorage.getItem(this.config.localStorageKeys.token);
    if (tokenFromStorage) {
      return tokenFromStorage;
    }

    // Try cookies (client-side)
    if (typeof document !== 'undefined') {
      return this.getCookie(this.config.tokenName);
    }

    // For server components, we'll handle separately
    return null;
  }

  /**
   * Get user data from localStorage
   */
  public getUser(): SessionData['user'] | null {
    const userDataStr = localStorage.getItem(this.config.localStorageKeys.user);
    if (userDataStr) {
      try {
        return JSON.parse(userDataStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get session state information
   */
  public getSessionState(): { expiresAt: number; issuedAt: number; userId: string } | null {
    const sessionStateStr = localStorage.getItem(this.config.localStorageKeys.sessionState);
    if (sessionStateStr) {
      try {
        return JSON.parse(sessionStateStr);
      } catch (error) {
        console.error('Error parsing session state:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if session is valid (not expired)
   */
  public isSessionValid(): boolean {
    const sessionState = this.getSessionState();
    if (!sessionState) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    // Check if token is expired considering buffer time
    return sessionState.expiresAt > (now + this.config.tokenExpirationBuffer);
  }

  /**
   * Check if session is expired
   */
  public isSessionExpired(): boolean {
    const sessionState = this.getSessionState();
    if (!sessionState) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return sessionState.expiresAt <= now;
  }

  /**
   * Check if token needs refresh (will expire soon)
   */
  public needsRefresh(): boolean {
    const sessionState = this.getSessionState();
    if (!sessionState) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return sessionState.expiresAt <= (now + this.config.tokenExpirationBuffer);
  }

  /**
   * Check if refresh token is expired
   */
  public isRefreshTokenExpired(): boolean {
    const refreshTokenExpiryStr = localStorage.getItem(this.config.localStorageKeys.refreshToken + '_expiresAt');
    if (!refreshTokenExpiryStr) {
      // If we don't have the expiry date, assume it's not expired
      return false;
    }

    try {
      const refreshTokenExpiry = new Date(refreshTokenExpiryStr);
      const now = new Date();
      return now >= refreshTokenExpiry;
    } catch (error) {
      console.error('Error parsing refresh token expiry:', error);
      return false;
    }
  }

  /**
   * Validate session by checking token existence and validity
   */
  public async validateSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Verify token with backend
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Refresh session token if needed
   */
  public async refreshSession(): Promise<boolean> {
    // Check if the refresh token itself is expired
    if (this.isRefreshTokenExpired()) {
      // Refresh token has expired, need to log out
      this.clearSession();
      return false;
    }
    
    if (!this.needsRefresh() && this.isSessionValid()) {
      return true; // No refresh needed
    }

    const refreshToken = localStorage.getItem(this.config.localStorageKeys.refreshToken);
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Handle new response format from refresh endpoint
        const { token, refreshToken: newRefreshToken, user, expiresAt, refreshTokenExpiresAt } = responseData.data || responseData;
        
        // Calculate issuedAt based on expiresAt
        const issuedAt = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) - (15 * 60) : Math.floor(Date.now() / 1000);
        
        // Update session with new tokens
        this.setSession({
          token,
          refreshToken: newRefreshToken,
          user,
          expiresAt: expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : Math.floor(Date.now() / 1000) + (15 * 60),
          issuedAt,
          refreshTokenExpiresAt
        });
        
        // Store refresh token expiration in localStorage for tracking
        if (refreshTokenExpiresAt) {
          localStorage.setItem(this.config.localStorageKeys.refreshToken + '_expiresAt', refreshTokenExpiresAt);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Session refresh error:', error);
      return false;
    }
  }

  /**
   * Clear all session data
   */
  public clearSession(): void {
    // Clear cookies
    this.clearCookie(this.config.tokenName);
    this.clearCookie(this.config.refreshTokenName);
    
    // Clear localStorage
    localStorage.removeItem(this.config.localStorageKeys.token);
    localStorage.removeItem(this.config.localStorageKeys.refreshToken);
    localStorage.removeItem(this.config.localStorageKeys.user);
    localStorage.removeItem(this.config.localStorageKeys.sessionState);
  }

  /**
   * Redirect to login page
   */
  public redirectToLogin(returnUrl?: string): void {
    const redirectUrl = returnUrl ? `/admin/login?return=${encodeURIComponent(returnUrl)}` : '/admin/login';
    redirect(redirectUrl);
  }

  /**
   * Check user permissions
   */
  public hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user || !user.permissions) {
      return false;
    }
    
    return user.permissions.includes(permission) || user.permissions.includes('*');
  }

  /**
   * Wait for session to be ready
   */
  public async waitForSession(timeoutMs: number = 5000): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkSession = () => {
        if (this.isSessionValid()) {
          resolve(true);
        } else if (Date.now() - startTime >= timeoutMs) {
          resolve(false);
        } else {
          setTimeout(checkSession, 100);
        }
      };
      
      checkSession();
    });
  }

  /**
   * Internal method to set cookie
   */
  private setCookie(name: string, value: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=${value}; Path=${this.config.cookieOptions.path}; ${
        this.config.cookieOptions.httpOnly ? 'HttpOnly;' : ''
      } ${this.config.cookieOptions.secure ? 'Secure;' : ''} SameSite=${
        this.config.cookieOptions.sameSite
      }; Max-Age=${this.config.cookieOptions.maxAge};`;
    }
  }

  /**
   * Internal method to get cookie
   */
  private getCookie(name: string): string | null {
    if (typeof document !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
      return cookieValue || null;
    }
    return null;
  }

  /**
   * Internal method to clear cookie
   */
  private clearCookie(name: string): void {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; Path=${this.config.cookieOptions.path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
  }
}

/**
 * Global instance of AuthService
 */
export const authService = new AuthService();

/**
 * Hook for client-side session management
 */
export function useSessionManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const isValid = await authService.validateSession();
        setIsAuthenticated(isValid);
      } catch (error) {
        console.error('Session check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  return { isAuthenticated, isLoading };
}

// For server-side usage
export async function getServerToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(DEFAULT_AUTH_CONFIG.tokenName)?.value || null;
  } catch (_error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Intentionally unused - error caught to handle server context issues gracefully
    // If not in server context, return null
    return null;
  }
}