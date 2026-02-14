import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext();

//Context Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        // localStorage.removeItem("token");
    };


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
