import React, { useContext, useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useCall } from "../context/CallContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";

const VideoCall = () => {
  const { user } = useContext(AuthContext);
  const { callData, setCallData } = useCall();
  const navigate = useNavigate();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerRef = useRef(null);
  const localStream = useRef(null);

  const pendingIce = useRef([]);
  const remoteIceQueue = useRef([]);

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const remoteSocketIdRef = useRef(null);



  // ✅ CALL STATUS
  const [callStatus, setCallStatus] = useState("Preparing Call...");

  // ✅ MEDIA STATES
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // 🔥 CREATE PEER
  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },

        {
          urls: "turn:global.relay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],



      iceCandidatePoolSize: 10,
    });



    // ✅ REMOTE VIDEO
    peer.ontrack = async (event) => {
      // console.log("🔥 ONTRACK FIRED");

      // console.log(
      //   "remoteVideo.current:",
      //   remoteVideo.current
      // );

      // console.log(
      //   "stream active:",
      //   event.streams[0].active
      // );

      // console.log(
      //   "video tracks:",
      //   event.streams[0].getVideoTracks()
      // );

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];

        // console.log(
        //   "assigned srcObject"
        // );
      }
    };


    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      const targetSocket = remoteSocketIdRef.current;

      // console.log("📤 Sending ICE:", targetSocket);

      if (targetSocket) {
        socket.emit("ice-candidate", {
          to: targetSocket,
          candidate: event.candidate,
        });
      } else {
        pendingIce.current.push(event.candidate);
      }
    };
    // ✅ CONNECTION STATUS
    peer.onconnectionstatechange = () => {
      // console.log(
      //   "CONNECTION STATE:",
      //   peer.connectionState
      // );

      const state = peer.connectionState;

      switch (state) {
        case "new":
          setCallStatus("Preparing Call...");
          break;

        case "connecting":
          setCallStatus("Connecting...");
          break;

        case "connected":
          setCallStatus("Connected");
          break;

        case "disconnected":
          setCallStatus("Disconnected");
          break;

        case "failed":
          setCallStatus("Connection Failed");
          break;

        case "closed":
          setCallStatus("Call Ended");
          break;

        default:
          break;
      }
    };

    peer.oniceconnectionstatechange = () => {
      // console.log(
      //   "ICE STATE:",
      //   peer.iceConnectionState
      // );
    };



    return peer;
  };




  // 🎥 START CAMERA
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peerRef.current.addTrack(track, stream);
    });
  };

  // 🚀 SEND ICE
  const flushPendingIce = () => {
    const targetSocket = remoteSocketIdRef.current;

    if (!targetSocket) return;

    pendingIce.current.forEach((c) => {
      socket.emit("ice-candidate", {
        to: targetSocket,
        candidate: c,
      });
    });

    pendingIce.current = [];
  };

  // 📥 RECEIVE ICE
  const handleRemoteIce = async (candidate) => {
    // console.log("📥 ICE Received:", candidate);

    if (peerRef.current.remoteDescription) {
      await peerRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } else {
      remoteIceQueue.current.push(candidate);
    }
  };

  const flushRemoteIce = async () => {
    for (let c of remoteIceQueue.current) {
      await peerRef.current.addIceCandidate(
        new RTCIceCandidate(c)
      );
    }

    remoteIceQueue.current = [];
  };

  // 🔥 INIT
  useEffect(() => {
    if (!callData) {
      navigate("/");
      return;
    }

    const init = async () => {
      if (peerRef.current) return;

      peerRef.current = createPeer();

      // 🔵 CALLER
      if (callData.type === "caller") {
        setRemoteSocketId(callData.to);
        remoteSocketIdRef.current = callData.to;

        setCallStatus("Calling...");

        await startCamera();

        const offer = await peerRef.current.createOffer();

        await peerRef.current.setLocalDescription(offer);

        socket.emit("call-user", {
          to: callData.to,
          username: user?.username,
          offer,
        });
      }

      // 🟢 RECEIVER
      if (callData.type === "receiver") {
        setRemoteSocketId(callData.from);
        remoteSocketIdRef.current = callData.from;

        setCallStatus("Joining Call...");

        await startCamera();

        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(callData.offer)
        );

        await flushRemoteIce();

        const answer = await peerRef.current.createAnswer();

        await peerRef.current.setLocalDescription(answer);

        socket.emit("answer-call", {
          to: callData.from,
          answer,
        });
      }
    };

    init();
  }, [callData]);

  // 🚀 ICE SEND
  useEffect(() => {
    if (remoteSocketId) {
      flushPendingIce();

      setTimeout(() => {
        flushPendingIce();
      }, 500);
    }
  }, [remoteSocketId]);

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    const handleAnswer = async (data) => {
      setCallStatus("Connecting...");
      // console.log("ANSWER RECEIVED");
      // console.log("Socket ID:", data.from);
      // ✅ actual receiver socket id save karo
      setRemoteSocketId(data.from);
      remoteSocketIdRef.current = data.from;

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );

      await flushRemoteIce();
    };

    const handleCallEnded = () => {
      setCallStatus("Call Ended");

      setTimeout(() => {
        endCall(false);
      }, 1000);
    };

    socket.on("call-answered", handleAnswer);

    socket.on("ice-candidate", handleRemoteIce);

    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-answered", handleAnswer);

      socket.off("ice-candidate", handleRemoteIce);

      socket.off("call-ended", handleCallEnded);
    };
  }, []);

  // 🎤 TOGGLE MIC
  const toggleMic = () => {
    const audioTrack =
      localStream.current?.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setIsMuted(!audioTrack.enabled);
  };

  // 📹 TOGGLE VIDEO
  const toggleVideo = () => {
    const videoTrack =
      localStream.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;

    setIsVideoOff(!videoTrack.enabled);
  };

  const endCall = (emit = true) => {

    // console.log("END CALL CLICKED");
    // console.log("remoteSocketId:", remoteSocketId);

    if (emit && remoteSocketId) {
      socket.emit("end-call", { to: remoteSocketId });
    }

    localStream.current?.getTracks().forEach((t) => t.stop());

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    setCallData(null);
    navigate("/");
  };




  return (
    <div
      className="w-full bg-black relative overflow-hidden h-[calc(100vh-120px)]   sm:h-screen"
    >

      {/* REMOTE VIDEO */}
      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        className={`
  w-full h-full bg-black transition-all duration-300
  ${callStatus === "Connected"
            ? "object-contain"
            : "object-cover"
          }
`}
      />

      


      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* TOP BAR */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 sm:p-6 flex justify-between items-start">

        <div>
          <h5 className="text-white text-2xl  font-bold">
            Video Call
          </h5>

          <div
            className="
    flex items-center gap-2
    bg-black/40
    backdrop-blur-md
    border border-white/10
    rounded-full
    px-3 py-2
    w-fit
  "
          >
            <div
              className={`
      w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0
      ${callStatus === "Connected"
                  ? "bg-green-500"
                  : callStatus === "Connection Failed"
                    ? "bg-red-500"
                    : "bg-yellow-400"
                }
    `}
            />

            <p className="text-white text-sm sm:text-base leading-none m-0">
              {callStatus}
            </p>
          </div>
        </div>

      </div>

      {/* LOCAL VIDEO */}
      <div
        className="
          absolute
          top-5 right-4
          sm:right-6
          z-20
          w-28 h-40
          sm:w-40 sm:h-52
          md:w-52 md:h-64
          rounded-3xl
          overflow-hidden
          border border-white/20
          bg-black
          shadow-2xl
          backdrop-blur-lg
        "
      >
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-15 left-0 w-full flex justify-center z-20 px-4">

        <div
          className="
    bg-black/20
    backdrop-blur-xl
    border border-white/10
    rounded-full
    px-3 sm:px-5
    py-2 sm:py-3
    flex items-center justify-center
    gap-3 sm:gap-5
    shadow-2xl
    max-w-max
    mx-auto
  "
        >
          {/* MIC */}
          <button
            onClick={toggleMic}
            style={{ borderRadius: "9999px" }}
            className={`
      w-12 h-12 sm:w-14 sm:h-14
      flex items-center justify-center
      text-white text-lg sm:text-xl
      transition-all duration-200
      active:scale-95
      shadow-lg
      ${isMuted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/15 hover:bg-white/25"
              }
    `}
          >
            {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>

          {/* END CALL */}
          <button
            onClick={() => endCall()}
            style={{ borderRadius: "9999px" }}
            className="
      w-14 h-14 sm:w-16 sm:h-16
      bg-red-500 hover:bg-red-600
      flex items-center justify-center
      text-white text-xl sm:text-2xl
      shadow-xl
      transition-all duration-200
      active:scale-95
    "
          >
            <FaPhoneSlash />
          </button>

          {/* VIDEO */}
          <button
            onClick={toggleVideo}
            style={{ borderRadius: "9999px" }}
            className={`
      w-12 h-12 sm:w-14 sm:h-14
      flex items-center justify-center
      text-white text-lg sm:text-xl
      transition-all duration-200
      active:scale-95
      shadow-lg
      ${isVideoOff
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/15 hover:bg-white/25"
              }
    `}
          >
            {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;