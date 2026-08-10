import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
// 2. تمرير null كقيمة مبدئية وتحديد النوع
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const login = (data) => {
        localStorage.setItem("token", data.token);
        setUser(data.user);
    };
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, login, logout }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
