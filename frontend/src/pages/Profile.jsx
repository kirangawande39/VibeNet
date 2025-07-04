// Top-level imports (No change)
import React, { useContext, useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { BsFillPostcardHeartFill } from "react-icons/bs";
import "../assets/css/Profile.css"
import { FaPlus } from "react-icons/fa";
import { MdOutlinePersonSearch } from "react-icons/md";
import { FaUserCircle, FaInfoCircle, FaEdit } from "react-icons/fa";
import { RiDeleteBin2Line } from "react-icons/ri";
import { handleError } from '../utils/errorHandler';
import Spinner from "../components/Spinner";
import { FiMoreVertical, FiX } from "react-icons/fi";
import { MdAddBox } from "react-icons/md";




// Start of component
const Profile = () => {
  const [file, setFile] = useState(null);
  const [mpost, setMpost] = useState(true);
  const [mreals, setMreals] = useState(false);
  const [postText, setPostText] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [story, setStory] = useState(false);
  const [uploadStory, setUploadedStory] = useState(null);
  const [storyFile, setStoryFile] = useState(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [validated, setValidated] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const [expandedPostId, setExpandedPostId] = useState(null);




  const validateAndPost = () => {
    if (!imageSelected || captionText.trim() === "") {
      setValidated(false);
      return;
    }
    handleCreatePost();
  };


  const [unfollowModal, setUnfollowModal] = useState({ show: false, user: null });

  const [removeModal, setRemoveModal] = useState({ show: false, follower: null });

  const [showStoryModal, setShowStoryModal] = useState(false); // for modal
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchFollower, setSearchFollower] = useState("");
  const [searchFollowing, setSearchFollowing] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const [posts, setPosts] = useState([])

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);

  const navigate = useNavigate();

  const fileInputRef = useRef();


  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (!profileData || !user || !Array.isArray(profileData.followers)) return;

    const isFollowed = profileData.followers.some(
      (follower) => follower._id?.toString() === user.id?.toString()
    );

    setIsFollowing(isFollowed);
  }, [profileData, user]);




  const toggleMenu = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  const handlePostDelete = async (postId) => {
    // alert(`Post was deleted ${postId} is here`)

    try {
      // backend route: DELETE /posts/:id
      const res = await axios.delete(
        `${backendUrl}/api/posts/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove deleted post from local state
      setPosts(posts.filter(post => post._id !== postId));
      toast.success(res.data.message);
    } catch (err) {
      handleError(err);
    }
  }


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${backendUrl}/api/users/${id}`);

        // console.log("user", response.data.user)
        setProfileData(response.data.user);
      } catch (err) {
        handleError(err);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${backendUrl}/api/posts/${id}`);
        // console.log("Posts:", res.data.posts)
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPostData();
  }, [user, id]);

  if (!user) {
    return (
      <div className="container mt-4">
        <h3>Please login to view your profile.</h3>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mt-4">
        <Spinner />
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/profile/${user.id}/edit_profile`, {
      state: { profileData, posts },
    });
  };

  const handlePostImage = (e) => {
    const selectedPost = e.target.files[0];
    if (selectedPost) {
      setPostImage(selectedPost);
      toast.success(`post selected`);
    }
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("description", postText);
    formData.append("postImage", postImage);

    try {
      const res = await axios.post(`${backendUrl}/api/posts/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
           Authorization: `Bearer ${token}`
        },
      });
      toast.success(res.data.message);
    } catch (err) {
      handleError(err);
    }
  };

  // const handleStory = () => {
  //   alert("Add your story");
  //   setStory(true);
  // };

  // const handleChange = (e) => {
  //   const selected = e.target.files[0];
  //   if (selected) {
  //     if (selected.type.startsWith("video")) {
  //       const video = document.createElement("video");
  //       video.preload = "metadata";
  //       video.onloadedmetadata = () => {
  //         window.URL.revokeObjectURL(video.src);
  //         if (video.duration > 15) {
  //           alert("Video must be 15 seconds or less.");
  //           setStoryFile(null);
  //         } else {
  //           setStoryFile(selected);
  //         }
  //       };
  //       video.src = URL.createObjectURL(selected);
  //     } else {
  //       setStoryFile(selected);
  //     }
  //   }
  // };



  // This function will open the file dialog when the user clicks on the "+ Story" button.
  const handleStoryClick = () => {
    fileInputRef.current.click();
  };



  // This function will handle the file upload process
  const handleUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Set the selected file to the state
    setStoryFile(selectedFile);

    // Create a form data object to send the file to the server
    const formData = new FormData();
    formData.append("story", selectedFile);

    try {
      const res = await axios.post(`${backendUrl}/api/stories`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Store the uploaded story data in the parent component state
      const story = res.data.story;
      setUploadedStory(story);

      toast.success("Story uploaded successfully!");
    } catch (err) {
      if (err.response && err.response.status === 429) {
        toast.error(err.response.data || "Too many requests, try again later.");
      } else {
        handleError(err);
      }
    }
  };




  const handleProfileStoryClick = () => {
    if (uploadStory) setShowStoryModal(true);
  };


  const handleRemove = async (followerId) => {


    try {
      const res = await axios.put(
        `${backendUrl}/api/follow/remove-follower/${followerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(res.data.message)

      setProfileData((prev) => ({
        ...prev,
        followers: prev.followers.filter(f => f._id !== followerId)
      }));

      // Close modal
      setRemoveModal({ show: false, follower: null });
    } catch (err) {
      handleError(err);
    }
  };


  const handleFollow = async (userIdTofollow) => {

    try {

      const res = await axios.post(
        `${backendUrl}/api/follow/${userIdTofollow}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );


      // setProfileData(prev => ({
      //     ...prev,
      //     following: prev.following.filter(user => user._id !== userIdToUnfollow)
      //   }));
      setIsFollowing(true);
    } catch (err) {
      toast.error("Failed to follow user");
    }
  };



  const handleUnfollow = async (userIdToUnfollow) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/follow/${userIdToUnfollow}/unfollow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // setProfileData(prev => ({
      //   ...prev,
      //   following: prev.following.filter(user => user._id !== userIdToUnfollow)
      // }));
      setIsFollowing(false);


      // Close modal
      setUnfollowModal({ show: false, user: null });
      // alert(res.data.message || "Unfollowed successfully!");
    } catch (err) {
      handleError(err);
    }
  };

  const isOwnProfile = String(profileData._id) === String(user.id);

  // console.log("profile user id:", profileData._id);
  // console.log("logged in user id:", user.id);

  return (
    <div className="profile-container">


      {/* Profile Section */}
      <div className="profile-header d-flex justify-content-between align-items-center">
        <div className={`d-flex align-items-center ${uploadStory ? 'story-ring' : ''}`} onClick={handleProfileStoryClick} style={{ cursor: uploadStory ? "pointer" : "default" }}>
          <img
            src={
              profileData.profilePic?.url ||

              "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
            }
            alt="Profile"
            className="profile-img"
          />
          <div className="ms-4">
            <h3 className="username">{profileData.username}</h3>
            <p className="bio">{profileData.bio || "No bio available"}</p>

            {isOwnProfile ? (
              <button className="btn btn-outline-primary btn-sm" onClick={handleEdit}>
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  className={` ${isFollowing ? "vibenet-following" : ""}`}
                  onClick={() =>
                    isFollowing
                      ? handleUnfollow(profileData._id)
                      : handleFollow(profileData._id)
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

              </>
            )}
          </div>

        </div>
      </div>
      <div className="text-end mt-4 mb-5">
        <div className="profile-stats">
          <span><strong>{posts?.length || 0}</strong> Posts</span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setShowFollowers(true)}
          >
            <strong>{profileData.followers?.length || 0}</strong> Followers
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => setShowFollowing(true)}
          >
            <strong>{profileData.following?.length || 0}</strong> Following
          </span>
        </div>

      </div>
      {/* Followers Modal */}

      {showFollowers && (
        <div className="story-modal-backdrop" onClick={() => setShowFollowers(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Followers</h5>

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

            <button className="story-close-btn" onClick={() => setShowFollowers(false)}>×</button>
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
      )}



      {showFollowing && (
        <div className="story-modal-backdrop" onClick={() => setShowFollowing(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Following</h5>

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

            <button className="story-close-btn" onClick={() => setShowFollowing(false)}>×</button>
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
      )}




      {/* Story upload button */}
      {isOwnProfile && (
        <div>
          <h3 className="story-btn" onClick={handleStoryClick}>
            <FaPlus />
          </h3>
        </div>
      )}


      {/* Upload Story */}

      {isOwnProfile && (
        <div className="my-3">
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          {/* <button className="btn btn-success ms-2" onClick={handleUpload}>Upload Story</button> */}
        </div>
      )}


      {/* Story Modal */}
      {showStoryModal && uploadStory && (
        <div className="story-modal-backdrop" onClick={() => setShowStoryModal(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            {['.mp4', '.mov', '.webm'].some(ext => uploadStory?.mediaUrl?.toLowerCase().endsWith(ext)) ? (
              <video
                src={uploadStory.mediaUrl}
                controls
                autoPlay
                muted
                loop
                className="story-media"
              />
            ) : (
              <img
                src={uploadStory.mediaUrl}
                alt="story"
                className="story-media"
              />
            )}

            <button className="story-close-btn" onClick={() => setShowStoryModal(false)}>×</button>
          </div>
        </div>
      )}



      {/* Media Switcher */}
      {isOwnProfile && (
        <div className="media-switcher my-4 d-flex justify-content-center gap-3">
          <button
            className={`btn ${mpost ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => {
              setMpost(true);
              setMreals(false);
            }}
          >
            <BsFillPostcardHeartFill /> your posts
          </button>
          <button
            className={`btn ${mreals ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => {
              setMpost(false);
              setMreals(true);
            }}
          >
            <MdAddBox size={28} /> post
          </button>
        </div>
      )}



      {/* Posts Section */}
      <div className="post-container">
        {mpost ? (
          <div className="post-gallery">
            {posts && posts.length > 0 ? (
              <>
                {/* Grid View */}
                <div className="gallery-grid">
                  {posts.map((post) => (
                    <div key={post._id} className="gallery-item">
                      <div className="post-card">
                        <div
                          className="post-img-container"
                          onClick={() => setSelectedImage(post)}
                        >
                          <img src={post.image} alt="Post" />
                        </div>
                        <p className="post-caption">
                          {post.text.length > 100 ? (
                            <>
                              {expandedPostId === post._id
                                ? post.text
                                : post.text.slice(0, 10) + "... "}
                              <span
                                onClick={() =>
                                  setExpandedPostId(
                                    expandedPostId === post._id ? null : post._id
                                  )
                                }
                                style={{ color: "blue", cursor: "pointer" }}
                              >
                                {expandedPostId === post._id ? "    less" : "more"}
                              </span>
                            </>
                          ) : (
                            post.text
                          )}
                        </p>


                        {isOwnProfile && (
                          <div className="menu-container">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(post._id);
                              }}
                              aria-label="Toggle menu"
                              className="menu-toggle-btn"
                            >
                              <FiMoreVertical size={24} />
                            </button>

                            {openMenuId === post._id && (
                              <div className="menu-dropdown">
                                <button
                                  onClick={() => handlePostDelete(post._id)}
                                  className="delete-btn"
                                >
                                  <RiDeleteBin2Line /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full Image View Modal */}
                {selectedImage && (
                  <div className="image-modal">
                    <div
                      className="modal-overlay"
                      onClick={() => setSelectedImage(null)}
                    ></div>
                    <div className="modal-content">
                      <button
                        className="close-btn"
                        onClick={() => setSelectedImage(null)}
                      >
                        <FiX size={24} />
                      </button>
                      <img
                        src={selectedImage.image}
                        alt="Selected Post"
                        className="full-image"
                      />
                      <div className="image-caption">{selectedImage.text}</div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-message">No posts available</p>
                {isOwnProfile && (
                  <button
                    className="create-first-btn"
                    onClick={() => setMpost(false)}
                  >
                    Create First Post
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          isOwnProfile && (
            <div className="create-post-container">
              <div className="card insta-card">
                <div className="card-header insta-card-header">
                  <h2 className="insta-title">Create New Post</h2>
                  <p className="insta-subtitle">
                    Share photos and videos with your friends
                  </p>
                </div>

                <div className="card-body">
                  {/* Drag & Drop Image Upload */}
                  <div className="image-upload-area text-center mb-4">
                    <div
                      className={`upload-box ${!validated && !imageSelected ? "invalid-upload" : ""
                        }`}
                    >
                      <i className="bi bi-images upload-icon"></i>
                      <p className="upload-text">Drag photo here</p>
                      <label
                        htmlFor="postImage"
                        className="upload-btn btn btn-sm btn-primary"
                      >
                        Select from device
                      </label>
                      <input
                        type="file"
                        id="postImage"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => {
                          handlePostImage(e);
                          setImageSelected(true);
                        }}
                      />

                      {/* Image Preview */}
                      {postImage && (
                        <div className="image-preview mt-3">
                          <img
                            src={URL.createObjectURL(postImage)}
                            alt="Preview"
                            className="preview-image img-fluid"
                          />
                          <button
                            className="remove-image btn-close"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostImage(null);
                              setImageSelected(false);
                            }}
                          ></button>
                        </div>
                      )}
                    </div>
                    {!validated && !imageSelected && (
                      <div className="error-message text-danger small mt-2">
                        Please select an image to continue
                      </div>
                    )}
                  </div>

                  {/* Caption Field */}
                  <div className="mb-4">
                    <div
                      className={`caption-box ${!validated && captionText.trim() === "" ? "is-invalid" : ""
                        }`}
                    >
                      <textarea
                        className="form-control insta-caption"
                        rows="4"
                        placeholder="Write a caption..."
                        value={captionText}
                        onChange={(e) => {
                          setPostText(e.target.value);
                          setCaptionText(e.target.value);
                        }}
                      ></textarea>
                      <div className="caption-footer">
                        <i className="bi bi-emoji-smile"></i>
                        <span className="char-count">
                          {captionText.length}/2,200
                        </span>
                      </div>
                    </div>
                    {!validated && captionText.trim() === "" && (
                      <div className="error-message text-danger small mt-2">
                        Caption is required
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-secondary insta-btn"
                      onClick={() => setMpost(true)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary insta-btn"
                      onClick={validateAndPost}
                      disabled={!imageSelected || captionText.trim() === ""}
                    >
                      Share Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Image Modal (backup safety) */}
        {selectedImage && (
          <div className="image-modal">
            <div
              className="modal-overlay"
              onClick={() => setSelectedImage(null)}
            ></div>
            <div className="modal-content">
              <button
                className="close-btn"
                onClick={() => setSelectedImage(null)}
              >
                <FiX size={24} />
              </button>
              <img
                src={selectedImage.image}
                alt="Selected Post"
                className="full-image"
              />
              <div className="image-caption">{selectedImage.text}</div>
            </div>
          </div>
        )}
      </div>


      {/* Suggestion Boxes */}
      {isOwnProfile && (
        <div className="suggestion-section mt-5 px-3">
          <h4 className="mb-4 fw-bold text-center">Complete your profile</h4>
          <div className="row justify-content-center g-3">

            {/* Upload profile picture */}
            <div className="col-md-4 col-sm-6">
              <div className="suggestion-box text-center p-4 rounded-4 shadow-sm border">
                <div className="icon-wrapper mb-3">
                  <FaUserCircle size={48} className="text-primary" />
                </div>
                <h6 className="fw-semibold mb-3">Upload Profile Picture</h6>
                <button
                  className="btn btn-sm btn-outline-primary rounded-pill px-4"
                  onClick={handleEdit}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Add Bio */}
            <div className="col-md-4 col-sm-6">
              <div className="suggestion-box text-center p-4 rounded-4 shadow-sm border">
                <div className="icon-wrapper mb-3">
                  <FaInfoCircle size={48} className="text-info" />
                </div>
                <h6 className="fw-semibold mb-3">Add a Bio</h6>
                <button
                  className="btn btn-sm btn-outline-info rounded-pill px-4"
                  onClick={handleEdit}
                >
                  Add Bio
                </button>
              </div>
            </div>

            {/* Edit Profile */}
            <div className="col-md-4 col-sm-6">
              <div className="suggestion-box text-center p-4 rounded-4 shadow-sm border">
                <div className="icon-wrapper mb-3">
                  <FaEdit size={48} className="text-success" />
                </div>
                <h6 className="fw-semibold mb-3">Edit Profile</h6>
                <button
                  className="btn btn-sm btn-outline-success rounded-pill px-4"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};

export default Profile;
