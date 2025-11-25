const mongoose=require('mongoose')

const GroupChatSchema=new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group",
        required:true
    },

    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    message:{
        type:String,
        required:true
    },

    mediaUrl:{
        type:String,
        default:""
    }
},
{timestamps:true}
);

module.exports = mongoose.model("GroupChat", GroupChatSchema);