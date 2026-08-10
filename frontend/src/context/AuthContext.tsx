import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../services/api';

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  isAdmin?: boolean;
  permissions?: string[];
  type?: string;
}

interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  permissions: string[];
  isAdmin: boolean;
  hasPermission: (code: string) => boolean;
  hasAnyPermission: (...codes: string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const permissions = user?.permissions ?? [];
  const isAdmin = !!(user?.isAdmin || user?.role === 'Admin');

  const hasPermission = useCallback(
    (code: string) => {
      if (isAdmin) return true;
      return permissions.some((p) => p.toLowerCase() === code.toLowerCase());
    },
    [isAdmin, permissions]
  );

  const hasAnyPermission = useCallback(
    (...codes: string[]) => {
      if (isAdmin) return true;
      return codes.some((c) => hasPermission(c));
    },
    [isAdmin, hasPermission]
  );

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const body = response.data;
    // يدعم ApiResponse والشكل القديم
    const payload = body?.data ?? body?.Data ?? body;
    const token = payload?.token ?? body?.token;
    const rawUser = payload?.user ?? body?.user;

    if (!token || !rawUser) {
      throw new Error(body?.message || body?.Message || 'فشل تسجيل الدخول');
    }

    const normalized: User = {
      id: rawUser.id ?? rawUser.Id,
      username: rawUser.username ?? rawUser.Username,
      fullName: rawUser.fullName ?? rawUser.FullName,
      role: rawUser.role ?? rawUser.Role,
      email: rawUser.email ?? rawUser.Email,
      type: rawUser.type ?? rawUser.Type ?? 'user',
      isAdmin: rawUser.isAdmin === true || rawUser.IsAdmin === true || (rawUser.role ?? rawUser.Role) === 'Admin',
      permissions: rawUser.permissions ?? rawUser.Permissions ?? [],
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(normalized);
  };

  const refreshPermissions = async () => {
    try {
      const res = await api.get('/permissions/me');
      const body = res.data;
      const data = body?.data ?? body?.Data ?? body;
      if (!user) return;
      const updated: User = {
        ...user,
        isAdmin: !!data?.isAdmin,
        permissions: data?.permissions ?? [],
        role: data?.role ?? user.role,
      };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
    } catch {
      /* ignore */
    }
  };

  const register = async (data: RegisterData) => {
    const response = await api.post('/auth/register', {
      username: data.username,
      password: data.password,
      confirmPassword: data.confirmPassword,
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || '',
    });
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        permissions,
        isAdmin,
        hasPermission,
        hasAnyPermission,
        login,
        register,
        logout,
        refreshPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
