const express = require("express")

const { cretaeNewGroup, getGroups, sendGroupMessage, getGroupsMessage, addGropuMembers, deleteGroupByCreator } = require("../controllers/groupControllers")

const { protect } = require("../middlewares/authMiddleware");
const multer = require("multer")
const router = express.Router();

const { groupImageStorage } = require("../config/cloudConfig")

const upload = multer({ storage:groupImageStorage })

router.post("/", upload.single('groupIcon'), protect, cretaeNewGroup)

router.get("/", protect, getGroups)
router.get("/messages/:groupId", protect, getGroupsMessage)


router.post("/message", protect, sendGroupMessage)

router.post("/add-members", protect, addGropuMembers);

router.delete("/delete-group/:groupId", protect, deleteGroupByCreator)






module.exports = router;