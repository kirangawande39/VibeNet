
import React ,{useState} from 'react'
import { MdOutlinePersonSearch } from "react-icons/md";
const FollowingModal = ({profileData , isOwnProfile ,unfollowModal ,setUnfollowModal , handleUnfollow ,setShowFollowing , } ) => {
    const [searchFollowing, setSearchFollowing] = useState("")

    return (
        <div className="story-modal-backdrop" >
            <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
                 <div className='flex justify-between mb-2'>
                    <h5>Following</h5>
                    <button className='font-semibold bg-red-600 p-1 text-white rounded flex ' onClick={() => setShowFollowing(false)}>Close</button>
                </div>

                {/* Search Input */}
                <div className="input-group mb-2">
                    <span className="input-group-text">
                        <MdOutlinePersonSearch />
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search following..."
                        value={searchFollowing}
                        onChange={(e) => setSearchFollowing(e.target.value)}
                    />
                </div>

                <ul className="list-group">
                    {profileData.following.length > 0 ? (
                        profileData.following
                            .filter(f =>
                                f.username.toLowerCase().includes(searchFollowing.toLowerCase()) ||
                                (f.name && f.name.toLowerCase().includes(searchFollowing.toLowerCase()))
                            )
                            .map((followed) => (
                                <li key={followed._id} className="list-group-item d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <img
                                            src={followed.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
                                            alt="profile"
                                            className="rounded-circle"
                                            style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                                        />
                                        <div>
                                            <strong>{followed.username}</strong><br />
                                            <small>{followed.name || ""}</small>
                                        </div>
                                    </div>

                                    {/* ✅ Show "Following" button only if it's your own profile */}
                                    {isOwnProfile && (
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => setUnfollowModal({ show: true, user: followed })}
                                        >
                                            Following
                                        </button>
                                    )}
                                </li>
                            ))
                    ) : (
                        <li className="list-group-item">Not following anyone</li>
                    )}
                </ul>

              
            </div>

            {/* ✅ Confirmation Modal */}
            {unfollowModal.show && isOwnProfile && (
                <div className="modal-backdrop" onClick={() => setUnfollowModal({ show: false, user: null })}>
                    <div className="modal-content-s" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex align-items-center mb-3">
                            <img
                                src={unfollowModal.user.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
                                alt="profile"
                                className="rounded-circle"
                                style={{ width: "50px", height: "50px", objectFit: "cover", marginRight: "10px" }}
                            />
                            <div>
                                <h6 className="mb-0">{unfollowModal.user.username}</h6>
                                <small>{unfollowModal.user.name || ""}</small>
                            </div>
                        </div>

                        <p className="mb-3">Are you sure you want to unfollow this user?</p>

                        <div className="d-flex justify-content-end gap-2">
                            <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setUnfollowModal({ show: false, user: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleUnfollow(unfollowModal.user._id)}
                            >
                                Unfollow
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FollowingModal
