const Group = require("../models/Group");
const GroupChat = require("../models/GroupChat");
const User = require("../models/User");
const { notificationQueue } = require("../queues/notificationQueue");

const sharp = require("sharp");

const cloudinary =
  require("cloudinary").v2;

const streamifier =
  require("streamifier");

const cretaeNewGroup = async (req) => {
  // console.log("cretaeNewGroup called")
  let creatorId =
    req.user.id;

  const formData =
    req.body;

  let groupImageUrl = "";
  let groupImagePublicId = "";

  // If Group Image Exists
  if (req.file) {

    // Compress Group Image
    const compressedBuffer =
      await sharp(req.file.buffer)

        .resize(500)

        .webp({
          quality: 70,
        })

        .toBuffer();

    // Upload To Cloudinary
    const result =
      await new Promise(
        (resolve, reject) => {

          const stream =
            cloudinary
              .uploader
              .upload_stream(

                {
                  folder:
                    "groups",
                },

                (
                  error,
                  result
                ) => {

                  if (error)
                    reject(error);

                  else
                    resolve(result);

                }
              );

          streamifier
            .createReadStream(
              compressedBuffer
            )
            .pipe(stream);

        }
      );

    groupImageUrl =
      result.secure_url;

    groupImagePublicId =
      result.public_id;

  }

  // Create Group
  const newGroup =
    await Group.create({

      name:
        formData.name,

      description:
        formData.description,

      icon: {

        url:
          groupImageUrl,

        public_id:
          groupImagePublicId,

      },

      privacy:
        formData.privacy,

      creator:
        creatorId,

      admins:
        [creatorId],

      members:
        [creatorId]

    });

  // Add Group To User
  await User.findByIdAndUpdate(

    creatorId,

    {
      $addToSet: {
        groups:
          [newGroup._id]
      }
    }

  );

  return {

    message:
      "Group created sucessfuly..",

    group:
      newGroup

  };

};



// get groups
const getGroups = async (req) => {

  const userId = req.user.id;

  const user = await User.findById(userId)
    .populate({
      path: "groups",
      populate: [
        {
          path: "members",
          model: "User",
          select: "_id username profilePic bio"
        }
      ]
    });

  return { groups: user.groups };
};


// send group message
const sendGroupMessage = async (req) => {
  try {

    // console.log("sendGroupMessage service called");

    const { message, groupId } = req.body;
    const senderId = req.user?.id;

    // console.log("Req:", req)
    // console.log("Req io:", req.io)

    // console.log("senderId:", senderId);

    // save message in DB
    const newMessage = await GroupChat.create({
      groupId,
      senderId,
      message,
      mediaUrl: "",
    });

    // populate sender details
    const populatedMsg = await newMessage.populate(
      "senderId",
      "username email profilePic"
    );

    // get group members
    const groupMembers = await Group.findById(groupId).populate({
      path: "members",
      select: "fcmToken _id",
    });

    // emit realtime message to group
    req.io.to(groupId).emit("receive-group-message", populatedMsg);

    // get all member tokens except sender
    const memberTokens = groupMembers?.members
      ?.filter(
        (member) =>
          member?._id.toString() !== senderId.toString()
      )
      ?.map((member) => member?.fcmToken)
      ?.filter((token) => token);

    // console.log("memberTokens:", memberTokens);

    // notification content
    const platformName = "VibeNet";
    const username = populatedMsg?.senderId?.username;

    const title = `${platformName} - New message from ${username}`;

    const text = `on ${groupMembers?.name} : ${newMessage?.message}`;

    // send notification to all members
    await Promise.all(
      memberTokens.map((fcmToken) =>
        notificationQueue.add("send-group-notification", {
          fcmToken,
          title,
          text,
        })
      )
    );

    // console.log("populatedMsg:", populatedMsg);

    return populatedMsg;

  } catch (error) {

    // console.log("sendGroupMessage Error:", error);

    throw error;
  }
};


// get group messages
const getGroupsMessage = async (req) => {

  const groupId = req.params.groupId;

  const messages = await GroupChat.find({ groupId: groupId })
    .populate("senderId", "username email profilePic");

  return { messages };
};


// add group members
const addGropuMembers = async (req) => {

  const { groupId, members } = req.body;
  const adminId = req.user.id;

  if (!groupId || !members) {
    throw new Error("GroupId and members required");
  }

  const group = await Group.findById(groupId);
  if (!group) {
    throw new Error("Group not found");
  }

  const isAdmin = group.admins.some(
    (admin) => admin.toString() === adminId.toString()
  );

  if (!isAdmin) {
    throw new Error("You are not admin of this group");
  }

  const uniqueMembers = members.filter(
    (id) => !group.members.map((m) => m.toString()).includes(id.toString())
  );

  group.members.push(...uniqueMembers);
  await group.save();

  await User.updateMany(
    { _id: { $in: uniqueMembers } },
    { $addToSet: { groups: groupId } }
  );

  return {
    message: "Members added successfully",
    addedMembers: uniqueMembers,
  };
};


// delete group
const deleteGroupByCreator = async (req) => {

  const creatorId = req.user.id;
  const groupId = req.params.groupId;

  let group = await Group.findById(groupId);

  if (!group) {
    throw new Error("Group not found");
  }

  if (!group.admins.includes(creatorId)) {
    throw new Error("Only creator can delete this group");
  }

  await User.updateMany(
    { _id: { $in: group.members } },
    { $pull: { gorups: groupId } }
  );

  await GroupChat.deleteMany({ groupId: groupId });

  await Group.findByIdAndDelete(groupId);

  return { message: "Group and all group chats deleted successfully" };
};


module.exports = {
  cretaeNewGroup,
  getGroups,
  sendGroupMessage,
  getGroupsMessage,
  addGropuMembers,
  deleteGroupByCreator
};