import { createContext, useState, useEffect } from "react";

// 🔹 Context बनाओ
export const AuthContext = createContext();

// 🔹 Context Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // ✅ Login Function
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    // ✅ Logout Function
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    // ✅ Update User Function (bio या कोई भी field अपडेट करने के लिए)
    const updateUser = (updatedData) => {
        setUser(prev => {
            const updatedUser = { ...prev, ...updatedData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    

    // ✅ Restore user on reload
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
