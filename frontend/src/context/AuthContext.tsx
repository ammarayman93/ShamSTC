// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
    email?: string;
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
    login: (username: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
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
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { username, password });

            if (response.data.token) {
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await api.post('/auth/register', {
                username: data.username,
                password: data.password,
                confirmPassword: data.confirmPassword,
                email: data.email,
                fullName: data.fullName,
                phoneNumber: data.phoneNumber || ''
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Registration failed');
            }

            return response.data;
        } catch (error: any) {
            console.error('Register error:', error);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            loading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;