import React, { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";
import ringtone from "../assets/sound/vibenet_rington.mp3";

const IncomingCallModal = () => {
  const audioRef = useRef(null);

  const { incomingCall, acceptIncomingCall, rejectIncomingCall, isCalling } = useCall();

  // 🔓 GLOBAL AUDIO UNLOCK (run once)
  useEffect(() => {
    const unlockAudio = () => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});

      document.removeEventListener("click", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
    };
  }, []);

  // 🔊 PLAY / STOP RINGTONE
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isCalling) {
      audio.currentTime = 0;

      audio.play().catch((err) => {
        console.log("Autoplay blocked:", err);
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [isCalling]);

  return (
    <>
     
      <audio ref={audioRef} src={ringtone} loop preload="auto" />

     
      {!incomingCall ? null : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-11/12 max-w-sm">
            <h2 className="text-xl font-bold mb-2">Incoming Video Call</h2>
            <p className="mb-4 break-all">From: {incomingCall.from}</p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  acceptIncomingCall();
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  rejectIncomingCall();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IncomingCallModal;