const { text } = require("body-parser");
const Group = require("../models/Group")
const GroupChat = require("../models/GroupChat")

const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

const notificationQueue= require("../queues/notificationQueue")

const cretaeNewGroup = async (req, res, next) => {
    let creatorId = req.user.id;
    const formData = req.body;

    // console.log("Name",groupFormData.name)

    try {
        // console.log("Group route is here")
        // console.log("creatorId::", creatorId)
        const groupImageUrl = req.file?.path;
        const groupImagePublicId = req.file?.filename;
        // console.log("groupImageUrl", groupImageUrl)
        // console.log("groupImagePublicId", groupImagePublicId)

        // console.log("groupFormData", formData)

        const newGroup = await Group.create({
            name: formData.name,
            description: formData.description,
            icon: {
                url: groupImageUrl,
                public_id: groupImagePublicId
            },
            privacy: formData.privacy,
            creator: creatorId,
            admins: [creatorId],
            members: [creatorId]
        })

        await User.findByIdAndUpdate(
            creatorId,
            {
                $addToSet: { groups: [newGroup._id] }
            }
        )

        res.status(201).json({ message: "Group created sucessfuly..", group: newGroup })
    }
    catch (err) {
        next(err)
    }
}

const getGroups = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId)
            .populate({
                path: "groups",
                populate: [
                    {
                        path: "members",
                        model: "User",
                        select: "_id username profilePic bio"
                    },
                    // {
                    //     path: "admins",
                    //     model: "User",
                    //     select: "_id username profilePic"
                    // }
                ]
            });

        // console.log("POPULATED GROUPS ===>", JSON.stringify(user.groups, null, 2));

        res.status(200).json({ groups: user.groups });

    } catch (err) {
        next(err);
    }
};


const sendGroupMessage = async (req, res, next) => {

    
    try {
        // console.log("Send Group Message");
        const { message, groupId } = req.body;


        // console.log("Group Message body is ::",req.body);
        const senderId = req.user.id;


      


        const newMessage = await GroupChat.create({
            groupId,
            senderId,
            message,
            mediaUrl: "",
        });

        // console.log("newMessage::",newMessage)


        const populatedMsg = await newMessage.populate(
            "senderId",
            "username email profilePic"
        );

        // console.log("populateMsg", populatedMsg.senderId.username)

        const GroupMembers = await Group.findById(groupId).populate({
            path: "members",
            select: "fcmToken _id"
        });


        req.io.to(groupId).emit("receive-group-message", populatedMsg);

        const memberToken = GroupMembers.members.filter((member) => member._id.toString() !== senderId.toString()).map((member) => member.fcmToken).filter(token => token)


        const platformName = "VibeNet";
        const username = populatedMsg.senderId.username;
        const title = `${platformName} - New message form ${username}`;

        const text = `on ${GroupMembers.name} : ${newMessage.message}`

      

            memberToken.forEach((fcmToken)  => {
                // sendNotification(token, title, body)
                notificationQueue.add("send-group-notification",{
                    fcmToken,
                    title,
                    text
                });

                // console.log(fcmToken , title , text) 

                // console.log("Text is ::",text);

            })
    



        // console.log("GroupMembers::",memberToken);

        // console.log("populatedMsg::",populatedMsg)




        return res.status(201).json(populatedMsg);
    } catch (error) {
        next(error);
    }
};



const getGroupsMessage = async (req, res, next) => {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    // console.log("group Id is ::", groupId);
    // console.log(userId)
    try {

        const messages = await GroupChat.find({ groupId: groupId }).populate("senderId", "username email profilePic");


        // const senderId=messages.filter((message) => message.senderId._id == userId)

        // console.log("senderId", senderId)

        // // console.log("Messages::", messages);

        res.status(200).json({ messages })

    }
    catch (err) {
        next(err)
    }
}

const addGropuMembers = async (req, res, next) => {
    const { groupId, members } = req.body;
    const adminId = req.user.id;

    try {
        if (!groupId || !members) {
            return res.status(400).json({ message: "GroupId and members required" });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isAdmin = group.admins.some(
            (admin) => admin.toString() === adminId.toString()
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "You are not admin of this group" });
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

        return res.status(200).json({
            message: "Members added successfully",
            addedMembers: uniqueMembers,
        });

    } catch (err) {
        next(err);
    }
};

const deleteGroupByCreator = async (req, res, next) => {
    const creatorId = req.user.id;
    const groupId = req.params.groupId;
    // console.log("delete route is here")
    try {
        let group = await Group.findById(groupId)


        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }



        if (!group.admins.includes(creatorId)) {
            return res.status(403).json({ message: "Only creator can delete this group" });
        }

        await User.updateMany(
            { _id: { $in: group.members } },
            { $pull: { gorups: groupId } }
        )

        await GroupChat.deleteMany({ groupId: groupId });


        await Group.findByIdAndDelete(groupId);



        res.status(200).json({ message: "Group and all group chats deleted successfully" })

    }
    catch (err) {
        next(err)
    }
}


module.exports = { cretaeNewGroup, getGroups, sendGroupMessage, getGroupsMessage, addGropuMembers, deleteGroupByCreator }