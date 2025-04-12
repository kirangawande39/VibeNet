import { createContext, useState, useEffect } from "react";

// 🔹 Context बनाओ
export const AuthContext = createContext();

// 🔹 Context Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // ✅ Login Function (User Data Store करने के लिए)
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));  // 🔹 LocalStorage में Save करो
    };

    // ✅ Logout Function (User Data Remove करने के लिए)
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    // ✅ App Reload होने पर User Data Restore करो
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
