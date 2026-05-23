import React, { useContext, useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useCall } from "../context/CallContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

  // 🔥 CREATE PEER (TURN + DEBUG)
  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },

        // ✅ Reliable TURN (metered public)
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
        {
          urls: "turn:global.relay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],

      iceCandidatePoolSize: 10
    });






    // console.log("🆕 Peer created");

    // 🔥 TRACK
    peer.ontrack = (event) => {
      console.log("🔥 TRACK RECEIVED", event.streams);
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];


      }
    };

    // 🔥 ICE GENERATE
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      // console.log("📡 ICE generated");

      if (remoteSocketId) {
        socket.emit("ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      } else {
        // console.log("⏳ ICE queued");
        pendingIce.current.push(event.candidate);
      }
    };

    // 🔥 STATE DEBUG
    peer.onconnectionstatechange = () => {
      // console.log("🔗 Connection:", peer.connectionState);
    };

    peer.oniceconnectionstatechange = () => {
      // console.log("🧊 ICE State:", peer.iceConnectionState);
    };

    return peer;
  };

  // 🎥 CAMERA
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // console.log("🎥 Local tracks:", stream.getTracks());

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
    if (!remoteSocketId) return;

    // console.log("🚀 Sending queued ICE:", pendingIce.current.length);

    pendingIce.current.forEach((c) => {
      socket.emit("ice-candidate", {
        to: remoteSocketId,
        candidate: c,
      });
    });

    pendingIce.current = [];
  };

  // 📥 RECEIVE ICE
  const handleRemoteIce = async (candidate) => {
    // console.log("📥 ICE received");

    if (peerRef.current.remoteDescription) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      remoteIceQueue.current.push(candidate);
    }
  };

  const flushRemoteIce = async () => {
    // console.log("📦 Flushing remote ICE:", remoteIceQueue.current.length);

    for (let c of remoteIceQueue.current) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
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
      if (peerRef.current) {
        // console.log("⚠️ Peer already exists");
        return;
      }

      peerRef.current = createPeer();

      // 🔵 CALLER
      if (callData.type === "caller") {
        // console.log("📞 Calling:", callData.to);
        setRemoteSocketId(callData.to);

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
        // console.log("📲 Receiving call from:", callData.from);
        setRemoteSocketId(callData.from);

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

  // 🚀 SEND ICE AFTER SOCKET READY
  useEffect(() => {
    if (remoteSocketId) {
      // console.log("✅ remoteSocketId set:", remoteSocketId);

      flushPendingIce();

      setTimeout(() => {
        flushPendingIce();
      }, 500);
    }
  }, [remoteSocketId]);

  // 🔥 SOCKET
  useEffect(() => {
    const handleAnswer = async (answer) => {
      // console.log("✅ Answer received");

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      await flushRemoteIce();
    };

    socket.on("call-answered", handleAnswer);
    socket.on("ice-candidate", handleRemoteIce);

    return () => {
      socket.off("call-answered", handleAnswer);
      socket.off("ice-candidate", handleRemoteIce);
    };
  }, []);

  // ❌ END CALL
  const endCall = () => {
    // console.log("📴 Call ended");

    if (remoteSocketId) {
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
    <div className="h-screen w-full bg-black relative">

      {/* REMOTE VIDEO */}
      <video
        ref={remoteVideo}
        autoPlay
        playsInline
        controls
        className="w-full h-full object-cover"
      />

      {/* LOCAL VIDEO */}
      <div className="absolute top-4 right-4 w-32 h-44 border">
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-full h-full"
        />
      </div>

      {/* END BUTTON */}
      <div className="absolute bottom-5 w-full flex justify-center">
        <button
          onClick={endCall}
          className="bg-red-500 px-6 py-3 text-white rounded"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;