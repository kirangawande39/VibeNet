import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { toast } from "react-toastify";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState(null);
  const [callData, setCallData] = useState(null);

  useEffect(() => {
    socket.on("incoming-call", (data) => {
      console.log("Incoming call received:", data);
      setIncomingCall(data);
    });

    socket.on("call-rejected", () => {
      console.log("Call rejected by receiver");
      setIncomingCall(null);
      setCallData(null);
      toast.warning("Call rejected");
    });

    socket.on("call-ended", () => {
      console.log("Call ended");
      setIncomingCall(null);
      setCallData(null);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, []);

  const acceptIncomingCall = () => {
    if (!incomingCall) return;

    setCallData({
      type: "receiver",
      from: incomingCall.from,
      offer: incomingCall.offer,
    });

    setIncomingCall(null);
    navigate("/video-call");
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) return;

    socket.emit("call-rejected", { to: incomingCall.from });
    setIncomingCall(null);
  };

  const startOutgoingCall = (receiverId) => {
    if (!receiverId) return;

    setCallData({
      type: "caller",
      to: receiverId,
    });

    navigate("/video-call");
  };

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        callData,
        setCallData,
        acceptIncomingCall,
        rejectIncomingCall,
        startOutgoingCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);