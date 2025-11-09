import React from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import { ToastContainer , toast } from "react-toastify";

const FollowRequestModel = ({ onClose, profileData , token ,setProfileData ,setFollowRequest }) => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

 

  const handleDecline = async (declineuserId) =>{
     try{
           const res = await axios.delete(`${backendUrl}/api/follow/follow-request/decline/${declineuserId}`,{
            headers:{
              Authorization:`Bearer ${token}`
            }
           })

           toast.success(res.data.message)

           setProfileData(prev => ({
             ...prev,
             followRequests:prev.followRequests.filter(
              req => req._id !== declineuserId
             ),
           }))

     }
     catch(error){
        console.error("Failed to Decline follow-request",error);
     }
  }

  const handleAccept = async (acceptUserId)=>{
    try{
         const res=await axios.put(`${backendUrl}/api/follow/follow-request/accept/${acceptUserId}`,
          {},
          {
            headers:{
              Authorization:`Bearer ${token}`,
            },
          }
         );
         toast.success(res.data.message)
    }
    catch(error){
      console.error("Failed to Accept follow request",error)
    }

  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-96 max-w-full p-5 relative animate-fadeIn">
        
       
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black transition"
        >
          <FaTimes size={18} />
        </button>

        <h1 className="text-xl font-semibold text-gray-900 text-center mb-5">
          Follow Requests
        </h1>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {profileData.followRequests.length > 0 ? (
            profileData.followRequests.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:shadow-md transition"
              >
                
           
                <div className="flex items-center gap-3">
                  <img
                    src={user.user?.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">
                      {user?.user?.username}
                    </span>
                  
                    {/* <span className="text-xs text-gray-600 line-clamp-2 max-w-[140px]">
                      {user.bio || "No bio available"}
                    </span> */}
                    <br />
                    <br />
                    {/* <span className="text-gray-900 font-medium">
                      {user._id}
                    </span> */}
                  </div>
                </div>

              
                <div className="flex flex-col gap-2">
                  {/* <p>{user.user._id}</p> */}
                  <button onClick={()=> handleAccept(user.user?._id)} className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Accept
                  </button>
                  {/* <p>{user.user._id}</p> */}
                  <button onClick={()=>handleDecline(user.user?._id)} className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition">
                    Decline
                  </button>
                </div>

              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No follow requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowRequestModel;
