import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import GroupDetailModal from "./GroupDetailModal";
import { BiBold, BiDotsVerticalRounded } from "react-icons/bi";
import GroupActionsModal from "./GroupActionsModal";
import { handleError } from "../utils/errorHandler";
import dayjs from "dayjs";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import Spinner from "./Spinner";
import API from "../services/api";

const GroupChat = ({ selectedGroup, onBack, isMobile, user, sortedFollowers }) => {
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [openActions, setOpenActions] = useState(false);

    const [groupMessages, setGroupMessages] = useState([]);
    const [newGroupMessage, setNewGroupMessage] = useState("");

    const [typingUsers, setTypingUsers] = useState([]);

    const [loading, setLoading] = useState(true)

    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    const messageEndRef = useRef(null);
    const groupId = selectedGroup?._id;

    const TYPING_TIMEOUT = 2000;

    const navigate = useNavigate();

    // Auto scroll
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [groupMessages]);

    // Join group room
    useEffect(() => {
        if (!groupId) return;
        socket.emit("join-group", groupId);
    }, [groupId]);

    // Fetch group messages
    useEffect(() => {
        if (!groupId) return;

        const fetchMessages = async () => {
            try {
                const res = await API.get(
                    `/api/groups/messages/${groupId}`);

                setGroupMessages(res.data.messages);
            } catch (err) {
                console.error("Failed fetching group messages", err);
            }
            finally{
                setLoading(false);
            }
        };

        fetchMessages();
    }, [groupId]);

    // SOCKET — Receive Messages
    useEffect(() => {
        const handleReceive = (msg) => {
            setGroupMessages((prev) => [...prev, msg]);
        };

        socket.on("receive-group-message", handleReceive);

        return () => socket.off("receive-group-message", handleReceive);
    }, []);

    // SOCKET — Typing Listeners
    useEffect(() => {
        const handleTyping = ({ userId, username, icon }) => {
            setTypingUsers((prev) => {
                if (prev.some((u) => u.userId === userId)) return prev;
                return [...prev, { userId, username, icon }];
            });
        };

        const handleStopTyping = ({ userId }) => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
        };

        socket.on("user-typing", handleTyping);
        socket.on("user-stop-typing", handleStopTyping);

        return () => {
            socket.off("user-typing", handleTyping);
            socket.off("user-stop-typing", handleStopTyping);
        };
    }, []);

    // Start typing
    const startTyping = () => {
        if (!isTypingRef.current) {
            isTypingRef.current = true;

            socket.emit("group-typing", {
                groupId,
                user: { _id: user.id, username: user.username, icon: user.profilePic.url }
            });
        }

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            stopTyping();
        }, TYPING_TIMEOUT);
    };

    // Stop typing
    const stopTyping = () => {
        if (isTypingRef.current) {
            isTypingRef.current = false;

            socket.emit("stop-group-typing", {
                groupId,
                userId: user.id
            });
        }

        clearTimeout(typingTimeoutRef.current);
    };

    // On unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current);

            if (isTypingRef.current) {
                socket.emit("stop-group-typing", { groupId, userId: user.id });
            }
        };
    }, [groupId]);

    // Input change handler
    const handleTypingInput = (e) => {
        setNewGroupMessage(e.target.value);
        startTyping();
    };

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault();

        try {
            await API.post(
                `/api/groups/message`,
                {
                    message: newGroupMessage,
                    groupId
                },
              
            );

            setNewGroupMessage("");
            stopTyping();
        } catch (err) {
            handleError(err);
        }
    };


    //  console.log("new group message ::",newGroupMessage);


    if (!selectedGroup) {
        return <div className="text-center text-muted mt-5">Select a group to start chatting</div>;
    }

    return (
        <div className="d-flex flex-column  h-[115%]">

            {/* HEADER */}
            <div className="flex justify-between">
                <div className="d-flex align-items-center  py-2 border-bottom bg-white" style={{ height: "60px" }}>
                    <button className="px-2 text-blue-600 " onClick={() => onBack()}>
                        <MdArrowBack size={24} />
                    </button>

                    {isMobile && (
                        <button className="btn btn-link p-0 me-3" onClick={onBack} style={{ fontSize: "20px" }}>
                            <FaArrowLeft />
                        </button>
                    )}

                    <img
                        src={selectedGroup?.icon?.url || "https://cdn-icons-png.flaticon.com/512/615/615075.png"}
                        className="rounded-circle me-3"
                        width="45"
                        height="45"
                        alt="group"
                        style={{ objectFit: "cover" }}
                    />

                    <div onClick={() => setShowGroupDetails(true)} className="cursor-pointer">
                        <div className="fw-bold text-[17px]">{selectedGroup?.name}</div>
                        <div className="text-muted text-[13px]">{selectedGroup?.description}</div>
                    </div>

                    {showGroupDetails && (
                        <GroupDetailModal group={selectedGroup} onClose={() => setShowGroupDetails(false)} />
                    )}
                </div>

                <button
                    onClick={() => setOpenActions(!openActions)}
                    className="mr-2 mt-3 cursor-pointer text-[1.5rem]"
                >
                    <BiDotsVerticalRounded />
                </button>

                {openActions && (
                    <GroupActionsModal
                        group={selectedGroup}
                        user={user}
                        sortedFollowers={sortedFollowers}
                        onClose={() => setOpenActions(false)}
                    />
                )}
            </div>

            {/* MESSAGES */}

            <div className="flex-grow-1 p-3 h-[90vh]" style={{ overflowY: "auto", background: "#f7f7f7" }}>

                {loading ?
                    <Spinner />
                    :
                    groupMessages.map((msg, index) => (
                        <div key={index}>
                            {msg?.senderId?._id === user?.id ? (
                                <div className="flex justify-end">
                                    <div className="bg-green-100 p-2 mt-3 rounded-b-2xl rounded-l-2xl flex flex-col">
                                        <span className="text-pink-400 font-bold">{msg.senderId?.username}</span>
                                        <div className="flex items-center">
                                            <span className="font-semibold">{msg.message}</span>
                                            <span className="text-[0.6rem] ml-3">{dayjs(msg.createdAt).format("hh:mm A")}</span>
                                        </div>
                                    </div>

                                    <img className="h-10 w-10 rounded-full ml-2" src={msg.senderId?.profilePic?.url} alt="" />
                                </div>
                            ) : (
                                <div className="flex">
                                    <img className="h-10 w-10 rounded-full" src={msg.senderId?.profilePic?.url} alt="" />

                                    <div className="bg-green-100 p-2 mt-3 rounded-b-2xl rounded-r-2xl flex flex-col ml-2">
                                        <span className="text-pink-900 font-bold">{msg.senderId?.username}</span>
                                        <div className="flex">
                                            <span className="font-semibold">{msg.message}</span>
                                            <span className="text-[0.6rem] ml-3">{dayjs(msg.createdAt).format("hh:mm A")}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                }

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 w-fit ml-3 mt-2 mb-3 bg-green-100 px-4 py-1.5 rounded-3xl shadow-sm">
                        <img
                            src={typingUsers[0].icon}
                            alt="profile"
                            className="w-10 h-10 rounded-full border border-green-300 object-cover"
                        />

                        {/* Profile Image */}


                        {/* Typing Text */}
                        <span className="font-semibold text-green-800 text-sm">
                            {typingUsers.length === 1
                                ? `${typingUsers[0].username} is typing...`
                                : `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`}
                        </span>

                    </div>
                )}

                <div ref={messageEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="border-top bg-white p-2" style={{ height: "60px" }}>
                <form className="flex items-center gap-2 w-full" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className="flex-1 border-2 rounded-2xl p-2 px-3"
                        placeholder="Type a message..."
                        value={newGroupMessage}
                        onChange={handleTypingInput}
                        required
                    />

                    <button type="submit" style={{ borderRadius: "15px" }} className="bg-blue-600 text-white px-4 py-2 rounded-2xl">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GroupChat;
