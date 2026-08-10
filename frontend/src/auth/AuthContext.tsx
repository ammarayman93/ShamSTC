import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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

/** قوالب افتراضية إن لم ترجع الصلاحيات من الـ API */
const ROLE_DEFAULT_PERMISSIONS: Record<string, string[]> = {
  Admin: ['*'],
  Employee: [
    'dashboard.view',
    'clients.view', 'clients.create', 'clients.edit', 'clients.renew',
    'clients.speed', 'clients.activate', 'clients.status',
    'clients.password.view', 'clients.password.reset',
    'plans.view',
    'tickets.view', 'tickets.manage',
  ],
  Support: [
    'dashboard.view',
    'clients.view', 'clients.edit', 'clients.renew', 'clients.speed',
    'clients.suspend', 'clients.activate', 'clients.status',
    'clients.password.view', 'clients.password.reset',
    'plans.view', 'mikrotik.view',
    'tickets.view', 'tickets.manage',
  ],
  Accountant: [
    'dashboard.view',
    'clients.view',
    'invoices.view', 'invoices.create', 'invoices.pay',
    'payments.view', 'payments.create',
    'cashboxes.view', 'cashboxes.manage',
    'expenses.view', 'expenses.create',
    'sales.view', 'sales.manage',
    'purchases.view', 'purchases.manage',
    'accounts.view', 'accounts.manage',
    'reports.view', 'reports.financial',
    'plans.view',
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function roleIsAdmin(role?: string, flag?: boolean) {
  if (flag === true) return true;
  return (role || '').trim().toLowerCase() === 'admin';
}

function buildEffectivePermissions(user: User | null): string[] {
  if (!user) return [];
  if (roleIsAdmin(user.role, user.isAdmin)) return ['*'];

  const fromApi = Array.isArray(user.permissions) ? user.permissions.filter(Boolean) : [];
  // إن رجعت من السيرفر قائمة حقيقية نستخدمها
  if (fromApi.length > 0 && !(fromApi.length === 1 && fromApi[0] === '*')) {
    return fromApi;
  }
  // وإلا قالب الدور
  const role = user.role || 'Employee';
  return ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.Employee;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        parsed.isAdmin = roleIsAdmin(parsed.role, parsed.isAdmin);
        if (!Array.isArray(parsed.permissions)) parsed.permissions = [];
        setUser(parsed);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // مرة واحدة بعد استعادة الجلسة: حدّث الصلاحيات من السيرفر
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/permissions/me');
        if (cancelled) return;
        const data = res.data?.data ?? res.data?.Data ?? res.data;
        if (!data) return;
        setUser((prev) => {
          if (!prev) return prev;
          const role = data.role ?? data.Role ?? prev.role;
          const perms = Array.isArray(data.permissions)
            ? data.permissions
            : Array.isArray(data.Permissions)
              ? data.Permissions
              : prev.permissions || [];
          const updated: User = {
            ...prev,
            role,
            isAdmin: roleIsAdmin(role, data.isAdmin === true || data.IsAdmin === true),
            permissions: perms,
          };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      } catch {
        /* قالب الدور كافٍ */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = roleIsAdmin(user?.role, user?.isAdmin);
  const permissions = useMemo(() => buildEffectivePermissions(user), [user]);

  const hasPermission = useCallback(
    (code: string) => {
      if (!code) return true;
      if (isAdmin || permissions.includes('*')) return true;
      return permissions.some((p) => p.toLowerCase() === code.toLowerCase());
    },
    [isAdmin, permissions]
  );

  const hasAnyPermission = useCallback(
    (...codes: string[]) => {
      if (isAdmin || permissions.includes('*')) return true;
      if (!codes || codes.length === 0) return true;
      return codes.some((c) => hasPermission(c));
    },
    [isAdmin, permissions, hasPermission]
  );

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    const body = response.data;
    const payload = body?.data ?? body?.Data ?? body;
    const token = payload?.token ?? payload?.Token ?? body?.token ?? body?.Token;
    const rawUser = payload?.user ?? payload?.User ?? body?.user ?? body?.User;

    if (!token) {
      throw new Error(body?.message || body?.Message || 'فشل تسجيل الدخول');
    }

    const role = rawUser?.role ?? rawUser?.Role ?? 'Employee';
    const normalized: User = {
      id: rawUser?.id ?? rawUser?.Id ?? 0,
      username: rawUser?.username ?? rawUser?.Username ?? username,
      fullName: rawUser?.fullName ?? rawUser?.FullName ?? username,
      role,
      email: rawUser?.email ?? rawUser?.Email,
      type: rawUser?.type ?? rawUser?.Type ?? 'user',
      isAdmin: roleIsAdmin(role, rawUser?.isAdmin === true || rawUser?.IsAdmin === true),
      permissions: Array.isArray(rawUser?.permissions)
        ? rawUser.permissions
        : Array.isArray(rawUser?.Permissions)
          ? rawUser.Permissions
          : [],
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(normalized);
  };

  const refreshPermissions = async () => {
    try {
      const res = await api.get('/permissions/me');
      const data = res.data?.data ?? res.data?.Data ?? res.data;
      if (!user) return;
      const role = data?.role ?? data?.Role ?? user.role;
      const updated: User = {
        ...user,
        role,
        isAdmin: roleIsAdmin(role, data?.isAdmin === true || data?.IsAdmin === true),
        permissions: Array.isArray(data?.permissions)
          ? data.permissions
          : Array.isArray(data?.Permissions)
            ? data.Permissions
            : user.permissions || [],
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
        isAuthenticated: !!user && !!localStorage.getItem('token'),
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
  if (!ctx) {
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      permissions: [] as string[],
      isAdmin: false,
      hasPermission: () => false,
      hasAnyPermission: () => false,
      login: async () => {
        throw new Error('AuthProvider مفقود');
      },
      register: async () => {
        throw new Error('AuthProvider مفقود');
      },
      logout: () => {},
      refreshPermissions: async () => {},
    } as AuthContextType;
  }
  return ctx;
};

export default AuthContext;
