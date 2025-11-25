import React from "react";

const GroupDetailModal = ({ group, onClose }) => {
    if (!group) return null;

    const adminIds = group.admins;

    // console.log("Addmins::",adminIds)

    return (
        <div className="fixed inset-0  bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
                >
                    ✕
                </button>

                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={group.icon || "https://cdn-icons-png.flaticon.com/512/615/615075.png"}
                        alt="icon"
                        className="w-14 h-14 rounded-full object-cover border"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">{group.name}</h2>
                        <p className="text-gray-500 text-sm">{group.description || "No description"}</p>
                    </div>
                </div>

                <h3 className="text-lg font-semibold mt-4 mb-2">Members</h3>

                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                    {group.members.map((member, index) => {

                        const isAdmin = adminIds.includes(member._id);

                        return (

                            <div
                                key={index}
                                className="flex justify-between items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                <div className="flex ">
                                    <img
                                        src={member.profilePic.url || "https://via.placeholder.com/40"}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <span className="font-medium">@{member.username}</span>
                                        <br />
                                        <span className="font-medium text-slate-600">{member.bio}</span>
                                    </div>
                                </div>


                                <span className="bg-green-700 text-white p-1 rounded-md">{isAdmin ? "admin" : "member"}</span>
                            
                                
                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    );
};

export default GroupDetailModal;
