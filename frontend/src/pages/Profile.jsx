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
import { FaUserCircle, FaInfoCircle, FaEdit } from "react-icons/fa";
import { RiDeleteBin2Line } from "react-icons/ri";
import { handleError } from '../utils/errorHandler';
import Spinner from "../components/Spinner";
import { FiMoreVertical, FiX } from "react-icons/fi";
import { MdAddBox } from "react-icons/md";
import FollowingModal from "../components/FollowingModal";
import FollowersModal from "../components/FollowersModal";
import FollowRequestModel from "../components/FollowRequestModel";



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

  const [showFollowRequest, setShowFollowRequest] = useState(false);


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

  const [openMenuId, setOpenMenuId] = useState(null);

  const [canViewPosts, setCanViewPosts] = useState(false);
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [followRequest, setFollowRequest] = useState(false);

  const [mutualCount, setMutualCount] = useState(0)
  const [mutualUsernames, setMutualUserName] = useState([])

  const [showMutualPopup, setShowMutualPopup] = useState(false);
  const [allMutualUsers, setAllMutualUsers] = useState([]);


  const [posts, setPosts] = useState([])

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);

  const navigate = useNavigate();

  const fileInputRef = useRef();

  const isOwnProfile = String(profileData?._id) === String(user?.id);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    if (!profileData || !user || !Array.isArray(profileData.followers)) return;



    // Step 2: Check if the current user follows this profile
    const isFollowed = profileData.followers.some(
      (follower) => follower._id?.toString() === user.id?.toString()
    );

    setIsFollowing(isFollowed);

    // Step 3: Handle private/public visibility
    if (profileData.isPrivate) {
      if (isOwnProfile) {
        setCanViewPosts(true);
      } else {
        setCanViewPosts(isFollowed); // follower only can view
      }
      setIsPrivateAccount(true);
    } else {
      // public account → everyone can view
      setIsPrivateAccount(false);
      setCanViewPosts(true);
    }
  }, [profileData, user]);

  useEffect(() => {
    if (!profileData || !profileData.followRequests || !user) return;

    const isSendFollowRequest = profileData.followRequests
      .some(req => req.user?._id === user.id);

    setFollowRequest(isSendFollowRequest);
    // console.log("isSendFollowRequest:", isSendFollowRequest);

  }, [user?.id, profileData?.followRequests]);



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

  // console.log("Id::", id);
  // console.log("UserId::", user?.id)



  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`${backendUrl}/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        // console.log("mutualList is ::", response.data.mutualList)
        // console.log("user", response.data.user)
        // console.log("isPrivate:::", response.data.user.isPrivate)
        setProfileData(response.data.user);
        setMutualCount(response.data.mutualCount)
        setMutualUserName(response.data.mutualList)

      } catch (err) {
        handleError(err);
      }
    };

    fetchProfileData();
  }, [user]);







  useEffect(() => {
    if (!user) return;
    if (!id) return;

    const fetchPostData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/posts/${id}`);
        setPosts(res.data.posts || []);
      } catch (err) {
        handleError(err)
      }
    };

    fetchPostData();
  }, [id]);



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
      const res = await axios.post(`${backendUrl}/api/posts/${user?.id}`, formData, {
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

      toast.success(res.data.message)



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

      toast.success(res.data.message)

      if (res.data.sendrequest) {
        setFollowRequest(res.data.sendrequest)
      }
      else {
        setIsFollowing(true);
      }
      // setProfileData(prev => ({
      //     ...prev,
      //     following: prev.following.filter(user => user._id !== userIdToUnfollow)
      //   }));
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

      setProfileData(prev => ({
        ...prev,
        following: prev.following.filter(user => user._id !== userIdToUnfollow)
      }));

      setIsFollowing(false);


      // Close modal
      setUnfollowModal({ show: false, user: null });
      // alert(res.data.message || "Unfollowed successfully!");
    } catch (err) {
      handleError(err);
    }
  };


  // const handleFollowRequest = async () => {
  //   alert("call followRequest")
  // }


  // console.log("MutuleCounts::", mutualCount)
  // console.log("MutuleUsername::", mutualCount)


  const FollowBack = profileData.following.some((followings) => followings._id == user?.id)

  // console.log("FollowBack::", FollowBack)




  const handleFollowBack = async (followbackUserId) => {
    try {
      const res = await axios.put(`${backendUrl}/api/follow/follow-back/${followbackUserId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success(res.data.message)
    }
    catch (error) {
      console.error("failed to followback", error)
    }
  }



  // console.log("profile user id:", profileData._id);
  // console.log("logged in user id:", user.id);

  return (
    <div className="profile-container">


      {/* Profile Section */}
      <div className="profile-header flex justify-between items-start w-full px-4 sm:px-6 mt-4">

        <div
          className={`flex items-center gap-4 ${uploadStory ? "cursor-pointer" : "cursor-default"}`}
          onClick={handleProfileStoryClick}
        >
          {/* Profile Image */}
          <img
            src={
              profileData.profilePic?.url ||
              "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
            }
            alt="Profile"
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 ${uploadStory ? "border-pink-500" : "border-gray-300"
              }`}
          />

          {/* Profile Text Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">
              {profileData.username}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {profileData.bio || "No bio available"}
            </p>

            {isOwnProfile ? (
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                >
                  Edit Profile
                </button>

                {profileData.followRequests?.length > 0 && (
                  <button
                    onClick={() => setShowFollowRequest(!showFollowRequest)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 text-blue-600 font-medium text-sm"
                  >
                    <span className="font-bold">{profileData.followRequests?.length}</span>
                    <span>Requests</span>
                  </button>
                )}

              </div>
            ) : (
              <div>
                {/* <span>
                requests
                {profileData.followRequests.map((data,index)=>(
                <div>{data.user._id}       {data.status}   {data.user.username}</div>
                
                ))}
               </span> */}
                {FollowBack && !isFollowing ?
                  <button onClick={() => handleFollowBack(profileData._id)} className={`mt-2 px-4 py-1 text-sm font-bold rounded-full transition ${isFollowing
                    ? "bg-gray-200 text-black border"
                    : "bg-blue-500 text-white"
                    }`}>Follow Back</button>
                  :
                  <button
                    className={`mt-2 px-4 py-1 text-sm font-bold rounded-full transition ${isFollowing
                      ? "bg-gray-200 text-black border"
                      : "bg-blue-500 text-white"
                      }`}
                    onClick={() =>
                      isFollowing
                        ? handleUnfollow(profileData._id)
                        : handleFollow(profileData._id)
                    }
                  >


                    {isFollowing
                      ? "Following"
                      : followRequest
                        ? "Request Sent"
                        : FollowBack
                          ? "Follow ack"
                          : "follow"
                    }

                  </button>
                }
              </div>
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


      {!isOwnProfile && (
        mutualCount > 0 ? (
          <div className="flex items-center gap-2 mt-2">

      
            <div className="flex -space-x-2">
              {mutualUsernames.slice(0, 2).map((user, index) => (
                <img
                  key={index}
                  src={user.profilePic}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-white object-cover"
                />
              ))}
            </div>

           
            <p className="text-sm text-gray-500">
              Followed by{" "}
              <span className="font-semibold">{mutualUsernames[0]?.username}</span>

              {mutualCount > 1 && (
                <>
                  {" "}and{" "}
                  <span
                    className="font-semibold text-blue-400 cursor-pointer"
                    onClick={() => {
                      setAllMutualUsers(mutualUsernames);
                      setShowMutualPopup(true);
                    }}
                  >
                    {mutualCount - 1} others
                  </span>
                </>
              )}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">No mutual connections</p>
        )
      )}


      {showMutualPopup && (
        <div className="mutual-popup-overlay" onClick={() => setShowMutualPopup(false)}>
          <div className="mutual-popup" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-title">Mutual Connections</h3>

            <ul className="popup-list">
              {allMutualUsers.map((user, index) => (
                <li key={index} className="popup-user">
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="popup-avatar"
                  />
                  <span className="popup-username">{user.username}</span>
                </li>
              ))}
            </ul>

            <button className="popup-close-btn" onClick={() => setShowMutualPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}





      {/* {profileData.isPrivate ?
        <div>
          <h1>This Account is Private</h1>
        </div>
        :
        <div>
          <h1>This Account is Public</h1>
        </div>
      } */}

      {/* {isPrivateAccount && !canViewPosts ? (
        <div>
          <h1>don't see posts </h1>
        </div>

      ) : (
        <div>
          see posts
        </div>
      )} */}

      {isPrivateAccount && !canViewPosts ? (
        ""
      ) :
        showFollowers && (
          <FollowersModal profileData={profileData} isOwnProfile={isOwnProfile} removeModal={removeModal} setRemoveModal={setRemoveModal} handleRemove={handleRemove} setShowFollowers={setShowFollowers} />
        )
      }




      {isPrivateAccount && !canViewPosts ? (
        ""
      ) :
        (
          showFollowing && (
            <FollowingModal profileData={profileData} isOwnProfile={isOwnProfile} unfollowModal={unfollowModal} setUnfollowModal={setUnfollowModal} handleUnfollow={handleUnfollow} setShowFollowing={setShowFollowing} />
          )
        )
      }






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

      {showFollowRequest && <FollowRequestModel onClose={() => setShowFollowRequest(false)} profileData={profileData} token={token} setProfileData={setProfileData} setFollowRequest={setFollowRequest} />}

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
        <div className="w-full flex justify-center gap-3 mt-4">

          <button
            className={`flex items-center gap-2 px-2  py-2 rounded-4 font-medium transition ${mpost
              ? "bg-black text-white"
              : "border border-gray-700 text-black hover:bg-gray-100"
              }`}
            onClick={() => {
              setMpost(true);
              setMreals(false);
            }}
          >
            <BsFillPostcardHeartFill /> Your Posts
          </button>


          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-4 font-medium transition ${mreals
              ? "bg-black text-white"
              : "border border-gray-700 text-black hover:bg-gray-100"
              }`}
            onClick={() => {
              setMpost(false);
              setMreals(true);
            }}
          >
            <MdAddBox size={22} /> Post
          </button>
        </div>
      )}




      {isPrivateAccount && !canViewPosts ? (
        <div className="text-center mt-10">
          <p className="text-5xl">🔒</p>
          <p className="text-gray-500 text-lg font-semibold">
            This account is private
          </p>
          <p className="text-sm text-gray-400">
            Follow to see their posts
          </p>
        </div>
      ) : (

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
      )}








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
