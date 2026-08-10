import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (error) {
                console.error("Failed to parse user data", error);
            }
        }
        setLoading(false);
    }, []);

    // ÏÇáÉ ÊÓÌíá ÇáÏÎæá
    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.success) {
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
        } else {
            throw new Error(response.data.message || 'Login failed');
        }
    };

    // ÏÇáÉ ÇáÊÓÌíá (Register)
    const register = async (username, password, fullName, role) => {
        const response = await api.post('/auth/register', {
            username,
            password,
            fullName,
            role
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Registration failed');
        }
    };

    // ÏÇáÉ ÊÓÌíá ÇáÎÑæÌ
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    // ÅÑÌÇÚ ÇáÜ Provider ãÚ ßÇÝÉ ÇáÏæÇá ÇáãÚÑÝÉ
    return (_jsx(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            loading,
            login,
            logout,
            register
        },
        children: children
    }));
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};