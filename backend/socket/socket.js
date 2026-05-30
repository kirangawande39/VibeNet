const onlineUsers = new Map();
const lastSeen = new Map();

const initSocket = (io) => {
  io.on("connection", (socket) => {


    // Jab user online hota hai, uska socket.id ko userId se map karo

    socket.on("user-online", (userId) => {
      // console.log("User online call");
      // console.log(userId, socket.id);
      onlineUsers.set(userId, socket.id); // userId -> socketId
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });






    socket.on("join-chat", (chatId) => socket.join(chatId));




    // chat message only
    socket.on("send-message", ({ chatId, message }) => {
      socket.to(chatId).emit("receive-message", {
        ...message,
        chatId,
      });
    });

    socket.on("typing", ({ chatId, senderId }) => {
      socket.to(chatId).emit("typing", { senderId });
    });

    socket.on("stop-typing", ({ chatId, senderId }) => {
      socket.to(chatId).emit("stop-typing", { senderId });
    });

    socket.on("delete-message", ({ chatId, msgId }) => {
      socket.to(chatId).emit("delete-message", { msgId });
    });

    socket.on("message-seen", ({ chatId, userId }) => {
      socket.to(chatId).emit("message-seen", { chatId, userId });
    });

    socket.on("mark-seen", ({ chatId, userId }) => {
      socket.to(chatId).emit("message-seen", { chatId, seenBy: userId });
    });



    //Post  only 
    socket.on("join-post", (postId) => {
      socket.join(postId);
    });

    socket.on("new-comment", (comment) => {
      const { postId } = comment;
      if (postId) socket.to(postId).emit("new-comment", comment);
    });

    socket.on("delete-comment", ({ commentId, postId }) => {
      if (postId) socket.to(postId).emit("delete-comment", { commentId });
    });





    socket.on("join-group", (groupId) => {
      socket.join(groupId);
      // console.log("User joined group:", groupId);
    });
    // forward typing indicator to other users in the room
    socket.on("group-typing", ({ groupId, user }) => {
      // broadcast to all in room except sender
      socket.to(groupId).emit("user-typing", { userId: user._id, username: user.username, icon: user.icon });
      // console.log("groupId::",groupId)
      // console.log("user::",user)
    });

    socket.on("stop-group-typing", ({ groupId, userId }) => {
      socket.to(groupId).emit("user-stop-typing", { userId });
      // console.log("groupId::",groupId)
      // console.log("userId::",userId)
    });



    // When message sent inside group
    // socket.on("send-group-message", ({ groupId, message }) => {
    //   io.to(groupId).emit("receive-group-message", message);
    //   console.log("groupId::",groupId)
    //   console.log("message::",message)
    // });



    // socket.on("call-user", ({ to, offer, username }) => {
    //   const socketId = onlineUsers.get(to);

    //   if (!socketId) {
    //     socket.emit("user-not-available", { message: "User is offline" });
    //     return;
    //   }

    //   io.to(socketId).emit("incoming-call", {
    //     from: socket.id,
    //     offer,
    //     username
    //   });
    // });

    // socket.on("answer-call", ({ to, answer }) => {
    //   io.to(to).emit("call-answered", answer);
    // });

    // socket.on("ice-candidate", ({ to, candidate }) => {
    //   if (!to || !candidate) return;
    //   io.to(to).emit("ice-candidate", candidate);
    // });

    // socket.on("call-rejected", ({ to }) => {
    //   io.to(to).emit("call-rejected");
    // });

    // socket.on("end-call", ({ to }) => {
    //   io.to(to).emit("call-ended");
    // });


    socket.on("call-user", ({ to, offer, username }) => {
      // console.log("\n📞 CALL USER EVENT");
      // console.log("Caller Socket:", socket.id);
      // console.log("Target User ID:", to);
      // console.log("Username:", username);

      const socketId = onlineUsers.get(to);

      // console.log("Target Socket ID:", socketId);

      if (!socketId) {
        // console.log("❌ User Offline");

        socket.emit("user-not-available", {
          message: "User is offline",
        });

        return;
      }

      // console.log("✅ Sending incoming-call");

      io.to(socketId).emit("incoming-call", {
        from: socket.id,
        receiverSocketId: socketId,
        offer,
        username,
      });
    });


    socket.on("answer-call", ({ to, answer }) => {
      io.to(to).emit("call-answered", {
        answer,
        from: socket.id,
      });
    });


    socket.on("ice-candidate", ({ to, candidate }) => {
      // console.log("\n🧊 ICE CANDIDATE EVENT");
      // console.log("From:", socket.id);
      // console.log("To:", to);

      if (!to || !candidate) {
        // console.log("❌ Invalid ICE Candidate");
        return;
      }

      io.to(to).emit("ice-candidate", candidate);

      // console.log("📤 ICE Candidate Sent");
    });


    socket.on("call-rejected", ({ to }) => {
      // console.log("\n❌ CALL REJECTED EVENT");
      // console.log("Rejected By:", socket.id);
      // console.log("Notify:", to);

      io.to(to).emit("call-rejected");

      // console.log("📤 call-rejected emitted");
    });


    socket.on("end-call", ({ to }) => {
      // console.log("\n📴 END CALL EVENT");
      // console.log("Ended By:", socket.id);
      // console.log("Notify:", to);

      io.to(to).emit("call-ended");

      // console.log("📤 call-ended emitted");
    });


    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId); //here set user is offline
          lastSeen.set(userId, new Date().toISOString()); //store last seen 
          io.emit("online-users", Array.from(onlineUsers.keys())); //send Updated list to all 
          break;
        }
      }
    });
  });
};

module.exports = { initSocket, onlineUsers, lastSeen };