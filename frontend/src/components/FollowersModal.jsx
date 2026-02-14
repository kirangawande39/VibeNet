import React, { useState } from 'react'
import { MdOutlinePersonSearch } from "react-icons/md";
const FollowersModal = ({ profileData, isOwnProfile, removeModal, setRemoveModal, handleRemove, setShowFollowers }) => {

    const [searchFollower, setSearchFollower] = useState("");

    return (
        <div className="story-modal-backdrop">
            <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-between mb-2'>
                    <h5>Followers</h5>
                    <button className='font-semibold bg-slate-200  p-1 text-red-600 shadow rounded flex ' onClick={() => setShowFollowers(false)}>Close</button>
                </div>

                {/* Search Input */}
                <div className="input-group mb-2">
                    <span className="input-group-text">
                        <MdOutlinePersonSearch />
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search followers..."
                        value={searchFollower}
                        onChange={(e) => setSearchFollower(e.target.value)}
                    />
                </div>

                <ul className="list-group">
                    {profileData.followers.length > 0 ? (
                        profileData.followers
                            .filter(f =>
                                f.username.toLowerCase().includes(searchFollower.toLowerCase()) ||
                                (f.name && f.name.toLowerCase().includes(searchFollower.toLowerCase()))
                            )
                            .map((follower) => (
                                <li key={follower._id} className="list-group-item d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={follower.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
                                            alt="profile"
                                            className="rounded-circle"
                                            style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                                        />
                                        <div>
                                            <strong>{follower.username}</strong><br />
                                            <small>{follower.name || ""}</small>
                                        </div>
                                    </div>

                                    {/* ✅ Show Remove button only if it's your own profile */}
                                    {isOwnProfile && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => setRemoveModal({ show: true, follower })}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </li>
                            ))
                    ) : (
                        <li className="list-group-item">No followers yet</li>
                    )}
                </ul>

            </div>

            {/* ✅ Confirmation Modal */}
            {removeModal.show && (
                <div
                    className="modal-backdrop"
                    onClick={() => setRemoveModal({ show: false, follower: null })}
                >
                    <div className="modal-content-s" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center mb-3">
                            <img
                                src={
                                    removeModal.follower?.profilePic?.url ||
                                    "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                                }
                                alt="profile"
                                className="rounded-circle"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                    marginRight: "12px",
                                }}
                            />
                            <div>
                                <h6 className="mb-0">{removeModal.follower?.username}</h6>
                                <small>{removeModal.follower?.name || ""}</small>
                            </div>
                        </div>

                        <p className="mb-3">
                            Are you sure you want to remove this follower?
                        </p>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setRemoveModal({ show: false, follower: null })}
                            >
                                Cancel
                            </button>

                            {/* ✅ Remove only allowed if isOwnProfile */}
                            {isOwnProfile && removeModal?.follower?._id && (
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleRemove(removeModal.follower._id)}
                                >
                                    Yes, Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FollowersModal
