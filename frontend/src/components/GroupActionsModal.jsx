import React, { useState } from "react";
import { handleError } from "../utils/errorHandler";
import { toast } from "react-toastify";
import API from "../services/api";

const GroupActionsModal = ({ onClose, sortedFollowers, group, user }) => {
  const [showFriendList, setShowFriendList] = useState(false);

  const groupId = group._id;

  const [selectedMembers, setSelectedMembers] = useState([]);



  const handleSelectMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };


  const handleAddMembers = async () => {
    try {
      // console.log("selectedMembers::",selectedMembers)
      let res = await API.post(`/api/groups/add-members`,
        {
          groupId,
          members: selectedMembers
        },
       
      )

      toast.success(res.data.message)

    }
    catch (err) {
      handleError(err)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    try {
       let res=await API.delete(`/api/groups/delete-group/${groupId}`)

       toast.success(res.data.message)
    }
    catch (err) {
      handleError(err)
    }
  }

  return (
    <>
      <div className="fixed top-32 right-10 z-50">
        <div className="w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-2">

          <button
            onClick={() => setShowFriendList(true)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Add Friends
          </button>

          <button onClick={()=>handleDeleteGroup(groupId)} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">
            Delete Group
          </button>
      

          <button
            onClick={onClose}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
          >
            Close
          </button>
        </div>
      </div>

      {showFriendList && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white w-80 sm:w-96 p-6 rounded-xl shadow-xl flex flex-col gap-5">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add Friends</h2>
              <button onClick={handleAddMembers} className="bg-blue-600 hover:bg-blue-400 rotate-x-1 text-white p-1 px-2 rounded-lg ">
                Add
              </button>

              <button
                onClick={() => setShowFriendList(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 max-h-72 overflow-y-auto">

              {sortedFollowers.map((follower) => (
                <label
                  key={follower._id}
                  className=" gap-4 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <img
                      src={follower.profilePic.url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover border"
                    />

                    <div>
                      <p className="font-medium text-gray-800">{follower.username}</p>

                    </div>

                    <input
                      type="checkbox"
                      name="selectFriend"
                      checked={selectedMembers.includes(follower._id)}
                      onChange={() => handleSelectMember(follower._id)}
                      className="w-4 h-4 accent-blue-600"
                    />

                  </div>

                </label>
              ))}

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GroupActionsModal;




