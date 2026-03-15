import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";

const VideoCall = ({ receiverId }) => {
    const [incomingCall, setIncomingCall] = useState(null);
    const [callActive, setCallActive] = useState(false);
    const [remoteSocketId, setRemoteSocketId] = useState(null);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const localStream = useRef(null);

    const peer = useRef(
        new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        })
    ).current;

    // caller side only: camera start
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

            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
            });

            return stream;
        } catch (err) {
            console.error("Error accessing camera/microphone:", err);
            return null;
        }
    };

    useEffect(() => {
        peer.ontrack = (event) => {
            console.log("Remote track received");
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

        socket.on("incoming-call", (data) => {
            console.log("Incoming call:", data);
            setIncomingCall(data);
            setRemoteSocketId(data.from);
        });

        socket.on("call-answered", async (answer) => {
            try {
                console.log("Caller received answer:", answer);

                if (peer.signalingState !== "have-local-offer") {
                    console.warn(
                        "Cannot set answer in signaling state:",
                        peer.signalingState
                    );
                    return;
                }

                await peer.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("Caller remote description set successfully");
                setCallActive(true);
            } catch (err) {
                console.error("Error setting remote description:", err);
            }
        });

        socket.on("ice-candidate", async (candidate) => {
            try {
                if (candidate) {
                    console.log("Received ICE candidate");
                    await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (err) {
                console.error("Error adding ICE candidate:", err);
            }
        });

        socket.on("call-rejected", () => {
            console.log("Call rejected");
            alert("Call rejected");
            setIncomingCall(null);
            setCallActive(false);
        });

        socket.on("call-ended", () => {
            endCallCleanup();
        });

        socket.on("user-not-available", (data) => {
            alert(data.message || "User not available");
        });

        return () => {
            socket.off("incoming-call");
            socket.off("call-answered");
            socket.off("ice-candidate");
            socket.off("call-rejected");
            socket.off("call-ended");
            socket.off("user-not-available");
        };
    }, [peer, remoteSocketId]);

    const startCall = async () => {
        try {
            console.log("Starting call...");
            setRemoteSocketId(receiverId);

            const stream = await startCamera();
            if (!stream) {
                alert("Camera/Microphone not available");
                return;
            }

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            socket.emit("call-user", {
                to: receiverId,
                offer,
            });

            console.log("Offer sent");
        } catch (err) {
            console.error("Error starting call:", err);
        }
    };
          // for development 
    //   const acceptCall = async () => {
    //     try {
    //       console.log("Accepting call...");

    //       if (!incomingCall || !incomingCall.offer) {
    //         console.warn("No incoming call data found");
    //         return;
    //       }

    //       setRemoteSocketId(incomingCall.from);

    //       // dev mode ke liye camera open nahi kar rahe
    //       await peer.setRemoteDescription(
    //         new RTCSessionDescription(incomingCall.offer)
    //       );

    //       const answer = await peer.createAnswer();
    //       await peer.setLocalDescription(answer);

    //       socket.emit("answer-call", {
    //         to: incomingCall.from,
    //         answer,
    //       });

    //       setCallActive(true);
    //       setIncomingCall(null);

    //       console.log("Answer sent successfully");
    //     } catch (err) {
    //       console.error("Error accepting call:", err);
    //     }
    //   };


    //for production 
    const acceptCall = async () => {
        try {
            if (!incomingCall || !incomingCall.offer) return;

            setRemoteSocketId(incomingCall.from);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStream.current = stream;

            if (localVideo.current) {
                localVideo.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peer.addTrack(track, stream);
            });

            await peer.setRemoteDescription(
                new RTCSessionDescription(incomingCall.offer)
            );

            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            socket.emit("answer-call", {
                to: incomingCall.from,
                answer,
            });

            setCallActive(true);
            setIncomingCall(null);
        } catch (err) {
            console.error("Error accepting call:", err);
        }
    };
    const rejectCall = () => {
        if (!incomingCall) return;

        socket.emit("call-rejected", { to: incomingCall.from });
        setIncomingCall(null);
    };

    const endCallCleanup = () => {
        console.log("Cleaning up call...");

        setIncomingCall(null);
        setCallActive(false);
        setRemoteSocketId(null);

        if (remoteVideo.current) {
            remoteVideo.current.srcObject = null;
        }
    };

    const endCall = () => {
        if (remoteSocketId) {
            socket.emit("end-call", { to: remoteSocketId });
        }

        if (localStream.current) {
            localStream.current.getTracks().forEach((track) => track.stop());
            localStream.current = null;
        }

        if (localVideo.current) {
            localVideo.current.srcObject = null;
        }

        endCallCleanup();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            {incomingCall && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4 w-11/12 max-w-md">
                        <h2 className="text-lg font-bold">Incoming Call</h2>
                        <p>From: {incomingCall.from}</p>

                        <div className="flex flex-col sm:flex-row justify-around mt-4 gap-4">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
                                onClick={acceptCall}
                            >
                                Accept
                            </button>

                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                                onClick={rejectCall}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-2xl p-4 w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-center mb-4">Video Call</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black rounded-xl overflow-hidden w-full h-64 sm:h-80 md:h-96">
                        <video
                            ref={localVideo}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <p className="text-center text-sm py-1 bg-gray-900 text-white">
                            You
                        </p>
                    </div>

                    <div className="bg-black rounded-xl overflow-hidden w-full h-64 sm:h-80 md:h-96">
                        <video
                            ref={remoteVideo}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <p className="text-center text-sm py-1 bg-gray-900 text-white">
                            Friend
                        </p>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6 flex-wrap">
                    <button
                        onClick={startCall}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-lg shadow-md transition w-full sm:w-auto"
                    >
                        Start Call
                    </button>

                    {callActive && (
                        <button
                            onClick={endCall}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-lg shadow-md transition w-full sm:w-auto"
                        >
                            End Call
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoCall;