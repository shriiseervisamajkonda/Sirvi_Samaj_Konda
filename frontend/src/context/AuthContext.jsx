import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored || stored === 'undefined' || stored === 'null') return null;
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.data);
      localStorage.setItem('user', JSON.stringify(data.data));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('accessToken')) {
        checkAuth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Inactivity timeout: 30 minutes of inactivity
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
    let inactivityTimer = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (!localStorage.getItem('accessToken')) return;
      inactivityTimer = setTimeout(() => {
        if (localStorage.getItem('accessToken')) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
          if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile'))) {
            window.location.href = '/login?reason=idle_timeout';
          }
        }
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
    };
  }, [checkAuth]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const data = res.data;
    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;
    const userObj = data.user || data.data?.user || data.data;

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userObj) {
      if (data.must_change_password !== undefined) {
        userObj.must_change_password = data.must_change_password;
      }
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
    return data;
  };

  const googleLogin = async (googlePayload) => {
    const res = await authAPI.googleLogin(googlePayload);
    const data = res.data;
    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;
    const userObj = data.user || data.data?.user || data.data;

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
    return data;
  };

  const updateUser = useCallback((updatedUser) => {
    if (!updatedUser) return;
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const data = res.data;
    const accessToken = data.accessToken || data.data?.accessToken;
    const refreshToken = data.refreshToken || data.data?.refreshToken;
    const userObj = data.user || data.data?.user || data.data;

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const isAdmin = Boolean(user && ['developer', 'super_admin', 'admin', 'editor', 'treasurer'].includes(user.role));
  const isSuperAdmin = Boolean(user && ['developer', 'super_admin'].includes(user.role));

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, updateUser, register, logout, isAdmin, isSuperAdmin, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
