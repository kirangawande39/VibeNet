import React, { useContext, useEffect, useRef, useState } from "react";
import socket from "../socket";
import { useCall } from "../context/CallContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const VideoCall = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate();
  const { callData, setCallData } = useCall();

  const [callActive, setCallActive] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);
  const remoteCandidatesQueue = useRef([]);

  const peer = useRef(
    new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    })
  ).current;


  // console.log("user:",user)

  const startCamera = async () => {
    try {
      if (localStream.current) return localStream.current;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      const alreadyAddedKinds = peer
        .getSenders()
        .map((sender) => sender.track?.kind)
        .filter(Boolean);

      stream.getTracks().forEach((track) => {
        if (!alreadyAddedKinds.includes(track.kind)) {
          peer.addTrack(track, stream);
        }
      });

      return stream;
    } catch (err) {
      console.error("Error accessing camera/microphone:", err);
      alert("Camera/Microphone access denied or unavailable");
      return null;
    }
  };

  const flushQueuedCandidates = async () => {
    try {
      for (const candidate of remoteCandidatesQueue.current) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
      remoteCandidatesQueue.current = [];
    } catch (err) {
      console.error("Error flushing ICE candidates:", err);
    }
  };

  useEffect(() => {
    if (!callData) {
      navigate("/");
      return;
    }

    peer.ontrack = (event) => {
      console.log("Remote stream received");
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        console.log("Sending ICE candidate to:", remoteSocketId);
        socket.emit("ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    const handleCallAnswered = async (answer) => {
      try {
        console.log("Caller received answer:", answer);

        if (peer.signalingState !== "have-local-offer") {
          console.warn("Invalid signaling state:", peer.signalingState);
          return;
        }

        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        await flushQueuedCandidates();
        setCallActive(true);
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    };

    const handleIceCandidate = async (candidate) => {
      try {
        if (!candidate) return;

        if (peer.remoteDescription && peer.remoteDescription.type) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          remoteCandidatesQueue.current.push(candidate);
        }
      } catch (err) {
        console.error("Error adding remote ICE candidate:", err);
      }
    };

    const handleCallRejected = () => {
      toast.warning("Call rejected");
      endCallCleanup(false);
      navigate("/");
    };

    const handleCallEnded = () => {
      toast.info("Call ended");
      endCallCleanup(false);
      navigate("/");
    };

    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-ended", handleCallEnded);
    };
  }, [callData, remoteSocketId]);

  useEffect(() => {
    if (!callData) return;

    const initCall = async () => {
      try {
        if (callData.type === "caller") {
          setRemoteSocketId(callData.to);

          const stream = await startCamera();
          if (!stream) return;

          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);

          socket.emit("call-user", {
            username: user?.username,
            to: callData.to,
            offer,
          });

          console.log("Offer sent");
        }

        if (callData.type === "receiver") {
          setRemoteSocketId(callData.from);

          const stream = await startCamera();
          if (!stream) return;

          await peer.setRemoteDescription(
            new RTCSessionDescription(callData.offer)
          );

          await flushQueuedCandidates();

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);

          socket.emit("answer-call", {
            to: callData.from,
            answer,
          });

          console.log("Answer sent");
          setCallActive(true);
        }
      } catch (err) {
        console.error("Error initializing call:", err);
      }
    };

    initCall();
  }, [callData]);

  const endCallCleanup = (emitEnd = true) => {
    try {
      if (emitEnd && remoteSocketId) {
        socket.emit("end-call", { to: remoteSocketId });
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }

      if (localVideo.current) {
        localVideo.current.srcObject = null;
      }

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = null;
      }

      peer.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });

      setCallActive(false);
      setRemoteSocketId(null);
      setCallData(null);
      remoteCandidatesQueue.current = [];
    } catch (err) {
      console.error("Error during cleanup:", err);
    }
  };

  const endCall = () => {
    endCallCleanup(true);
    navigate("/");
  };

  return (
 <div className="h-[90vh] w-full bg-black relative overflow-hidden">

  <video
    ref={remoteVideo}
    autoPlay
    playsInline
    className="w-full h-full object-cover"
  />

  <div className="absolute top-4 right-4 w-28 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden border-2 border-white shadow-lg">
    <video
      ref={localVideo}
      autoPlay
      muted
      playsInline
      className="w-full h-full object-cover"
    />
  </div>

  <div className="absolute bottom-8 w-full flex justify-center">
    <btn
      onClick={endCall}
      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg shadow-lg transition"
    >
      {callActive ? "End Call" : "Cancel"}
    </btn>
  </div>

</div>
  );
};

export default VideoCall;