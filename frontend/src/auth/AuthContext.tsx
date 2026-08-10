import { createContext, useContext, useState, ReactNode } from "react";

// 1. تعريف شكل البيانات (اختياري ولكن يفضل لـ TypeScript)
interface AuthContextType {
    user: any;
    login: (data: any) => void;
    logout: () => void;
}

// 2. تمرير null كقيمة مبدئية وتحديد النوع
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState(null);

    const login = (data: any) => {
        localStorage.setItem("token", data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};