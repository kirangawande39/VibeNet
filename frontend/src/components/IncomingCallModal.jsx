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
        .catch(() => { });

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] px-4">

          <div
            className="
      w-full max-w-sm
      bg-zinc-900/95
      border border-white/10
      rounded-3xl
      shadow-2xl
      overflow-hidden
    "
          >

            {/* TOP */}
            <div className="p-6 text-center">

              <div className="relative mx-auto w-24 h-24 mb-4">

                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />

                {/* Avatar */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                  {incomingCall.username?.charAt(0)?.toUpperCase()}
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                Incoming Video Call
              </p>

              <h2 className="text-white text-2xl font-bold mt-2 break-all">
                {incomingCall.username}
              </h2>

              <div className="flex justify-center mt-4">
                <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full">
                  Calling...
                </span>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="px-6 pb-6">

              <div className="flex items-center justify-center gap-8">

                {/* Reject */}
                <button
                  onClick={() => {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    rejectIncomingCall();
                  }}
                  style={{ borderRadius: "9999px" }}
                  className="
            w-16 h-16
            bg-red-500 hover:bg-red-600
            text-white
            text-lg
            font-semibold
            shadow-xl
            transition-all
            duration-200
            active:scale-95
          "
                >
                  ✕
                </button>

                {/* Accept */}
                <button
                  onClick={() => {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    acceptIncomingCall();
                  }}
                  style={{ borderRadius: "9999px" }}
                  className="
            w-16 h-16
            bg-green-500 hover:bg-green-600
            text-white
            text-lg
            font-semibold
            shadow-xl
            transition-all
            duration-200
            active:scale-95
          "
                >
                  ✓
                </button>

              </div>

              <div className="flex justify-center gap-16 mt-3">
                <span className="text-red-400 text-sm">Decline</span>
                <span className="text-green-400 text-sm">Accept</span>
              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
};

export default IncomingCallModal;