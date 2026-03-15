import React from "react";
import { useCall } from "../context/CallContext";

const IncomingCallModal = () => {
  const { incomingCall, acceptIncomingCall, rejectIncomingCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center w-11/12 max-w-sm">
        <h2 className="text-xl font-bold mb-2">Incoming Video Call</h2>
        <p className="mb-4 break-all">From: {incomingCall.from}</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={acceptIncomingCall}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Accept
          </button>

          <button
            onClick={rejectIncomingCall}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;