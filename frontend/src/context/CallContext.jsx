import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import { toast } from "react-toastify";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const navigate = useNavigate();

  const [incomingCall, setIncomingCall] = useState(null);
  const [callData, setCallData] = useState(null);
  const [isCalling, setIsCalling] = useState(false);



  useEffect(() => {
    socket.on("incoming-call", (data) => {
      // console.log("Incoming call received:", data);
      setIncomingCall(data);
      setIsCalling(true);
    });

    socket.on("call-rejected", () => {
      // console.log("Call rejected by receiver");

      setIncomingCall(null);
      setCallData(null);
      setIsCalling(false); 

      toast.warning("Call rejected");
    });

    socket.on("call-ended", () => {
      // console.log("Call ended");

      setIncomingCall(null);
      setCallData(null);
      setIsCalling(false);
    });

    
    return () => {
      socket.off("incoming-call");
      socket.off("call-rejected");
      socket.off("call-ended");
    };
  }, []);


  const acceptIncomingCall = () => {
    if (!incomingCall) return;

    // console.log("acceptIncomingCall");

    setIsCalling(false);

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

    // console.log("IncomingCall rejected");

    setIsCalling(false);

    socket.emit("call-rejected", {
      to: incomingCall.from,
    });

    setIncomingCall(null);
  };

  const startOutgoingCall = (receiverId) => {
    if (!receiverId) return;
    // console.log("receiverId from callContext:", receiverId)
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
        isCalling
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);