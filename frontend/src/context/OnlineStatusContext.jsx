import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import socket from "../socket"; // make sure this is a shared socket instance

const OnlineContext = createContext();
export const useOnline = () => useContext(OnlineContext);

export const OnlineProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [allOnlineUsers, setAllOnlineUsers] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Emit user-online on load
  useEffect(() => {
    if (user && user._id) {
      socket.emit("user-online", user._id);
    }

    // ✅ Emit user-offline when tab/browser closes
    const handleUnload = () => {
      if (user && user._id) {
        socket.emit("user-offline", user._id);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (user && user._id) {
        socket.emit("user-offline", user._id);
      }
    };
  }, [user]);


  // ✅ Listen for online-users update from server
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setAllOnlineUsers(users);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  return (
    <OnlineContext.Provider value={{ allOnlineUsers }}>
      {children}
    </OnlineContext.Provider>
  );
};
