
import React, { useContext, useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
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
import API from "../services/api";
import LoadingDots from "../components/common/LoadingDots";



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
  const [storyLoading, setStoryLoading] = useState(false);


  const [expandedPostId, setExpandedPostId] = useState(null);

  const [showFollowRequest, setShowFollowRequest] = useState(false);

  const [createPostStatus, setCreatePostStatus] = useState(false);


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
      const res = await API.delete(
        `/api/posts/${postId}`,
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
        const response = await API.get(`/api/users/${id}`);

        setProfileData(response.data.user);
        setMutualCount(response.data.mutualCount);
        setMutualUserName(response.data.mutualList);

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
        const res = await API.get(`/api/posts/${id}`);
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

      if (postImage.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }

      setCreatePostStatus(true);

      const res = await API.post(`/api/posts/${user?.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCreatePostStatus(false)
      toast.success(res.data.message);
      setPostImage(null);
      setPostText(null);
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

    setStoryLoading(true);

    try {
      const res = await API.post(`/api/stories`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Store the uploaded story data in the parent component state
      const story = res.data.story;
      setStoryLoading(false);
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
      const res = await API.put(
        `/api/follow/remove-follower/${followerId}`,
        {},
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

    // console.log("Follow api call");
    try {


      const res = await API.post(
        `/api/follow/${userIdTofollow}/follow`,
        {},
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
      const res = await API.post(
        `/api/follow/${userIdToUnfollow}/unfollow`,
        {},
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
      const res = await API.put(`/api/follow/follow-back/${followbackUserId}`,
        {},
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
        {storyLoading && (
          <div className="fixed right-4  top-15  bg-black text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">

            <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></span>

            <span className="text-sm font-medium">
              Story Uploading...
            </span>

          </div>
        )}

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
                <span
                  onClick={handleEdit}

                  className="px-3 py-1 border rounded-2xl  text-sm font-medium hover:bg-gray-100 transition shadow cursor-pointer"
                >
                  Edit Profile
                </span>

                {profileData.followRequests?.length > 0 && (
                  <button
                    onClick={() => setShowFollowRequest(!showFollowRequest)}
                    className="border px-3 py-1 shadow hover:bg-gray-100 rounded  "
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
            className={`flex items-center gap-2 px-2 shadow py-2 rounded-4 font-medium transition ${mpost
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
            className={`flex items-center gap-2 px-4 py-2  shadow rounded-4 font-medium transition ${mreals
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

        <div className="flex items-center justify-center py-20 px-4">

          <div className="bg-white shadow-xl rounded-3xl border border-gray-100 p-10 text-center max-w-md w-full">

            <div className="text-6xl mb-4">
              🔒
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Private Account
            </h2>

            <p className="text-gray-500 text-sm">
              Follow this account to see their posts and updates.
            </p>

          </div>

        </div>

      ) : (

        <div className=" bg-gray-50 px-1 sm:px-4 py-4">

          {mpost ? (

            <div className="max-w-7xl mx-auto">

              {posts && posts.length > 0 ? (

                <>
                  {/* POSTS GRID */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-3">

                    {posts.map((post) => (

                      <div
                        key={post._id}
                        className="group relative cursor-pointer"
                      >

                        {/* IMAGE */}
                        <div
                          className="aspect-square overflow-hidden rounded-md sm:rounded-2xl bg-gray-200"
                          onClick={() => setSelectedImage(post)}
                        >

                          <img
                            src={post.image}
                            alt="Post"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />

                        </div>

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 rounded-md sm:rounded-2xl flex items-center justify-center">

                          <span className="text-white text-sm font-semibold">
                            View
                          </span>

                        </div>

                        {/* CAPTION */}
                        <div className="mt-2 px-1">

                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">

                            {post.text.length > 100 ? (
                              <>
                                {expandedPostId === post._id
                                  ? post.text
                                  : post.text.slice(0, 20) + "... "}

                                <span
                                  onClick={() =>
                                    setExpandedPostId(
                                      expandedPostId === post._id
                                        ? null
                                        : post._id
                                    )
                                  }
                                  className="text-blue-500 cursor-pointer ml-1 hover:underline"
                                >
                                  {expandedPostId === post._id
                                    ? "less"
                                    : "more"}
                                </span>
                              </>
                            ) : (
                              post.text
                            )}

                          </p>

                        </div>

                        {/* MENU */}
                        {isOwnProfile && (

                          <div className="absolute top-2 right-2 z-20">

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMenu(post._id);
                              }}
                              aria-label="Toggle menu"
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm transition"
                            >
                              <FiMoreVertical size={14} />
                            </button>

                            {openMenuId === post._id && (

                              <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

                                <button
                                  onClick={() =>
                                    handlePostDelete(post._id)
                                  }
                                  className="flex items-center gap-2 w-full px-4 py-3 text-red-500 hover:bg-red-50 transition text-sm"
                                >
                                  <RiDeleteBin2Line />
                                  Delete
                                </button>

                              </div>

                            )}

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                  {/* IMAGE MODAL */}
                  {selectedImage && (

                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center px-2 sm:px-4">

                      <div className="relative w-full max-w-5xl">

                        {/* CLOSE BUTTON */}
                        <button
                          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
                          onClick={() => setSelectedImage(null)}
                        >
                          <FiX size={30} />
                        </button>

                        {/* MODAL CONTENT */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">

                          {/* IMAGE */}
                          <div className="flex-1 bg-black flex items-center justify-center">

                            <img
                              src={selectedImage.image}
                              alt="Selected Post"
                              className="w-full h-full max-h-[75vh] object-contain"
                            />

                          </div>

                          {/* CAPTION */}
                          <div className="w-full md:w-[350px] p-5 overflow-y-auto">

                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                              Caption
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed">
                              {selectedImage.text}
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  )}

                </>

              ) : (

                /* EMPTY STATE */
                <div className="flex items-center justify-center py-24">

                  <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full border border-gray-100">

                    <div className="text-6xl mb-4">
                      📸
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      No Posts Yet
                    </h2>

                    <p className="text-gray-500 mb-6">
                      Start sharing your moments.
                    </p>

                    {isOwnProfile && (

                      <button
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
                        onClick={() => setMpost(false)}
                      >
                        Create First Post
                      </button>

                    )}

                  </div>

                </div>

              )}

            </div>

          ) : (

            isOwnProfile && (

              <div className="max-w-2xl mx-auto">

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

                  {/* HEADER */}
                  <div className="p-6 border-b bg-gradient-to-r from-pink-500 to-purple-500 text-white">

                    <h2 className="text-2xl font-bold">
                      Create New Post
                    </h2>

                    <p className="text-sm opacity-90 mt-1">
                      Share photos with your friends
                    </p>

                  </div>

                  <div className="p-6">

                    {/* IMAGE UPLOAD */}
                    <div className="mb-6">

                      <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all
                  ${!validated && !imageSelected
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300 hover:border-pink-400"
                        }`}>

                        <i className="bi bi-images text-5xl text-gray-400"></i>

                        <p className="mt-4 text-gray-600 font-medium">
                          Drag photo here
                        </p>

                        <label
                          htmlFor="postImage"
                          className="inline-block mt-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-xl cursor-pointer hover:scale-105 transition"
                        >
                          Select from device
                        </label>

                        <input
                          type="file"
                          id="postImage"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            handlePostImage(e);
                            setImageSelected(true);
                          }}
                        />

                        {/* PREVIEW */}
                        {postImage && (

                          <div className="relative mt-6">

                            <img
                              src={URL.createObjectURL(postImage)}
                              alt="Preview"
                              className="w-full max-h-[450px] object-cover rounded-2xl shadow-md"
                            />

                            <button
                              className="absolute top-3 right-3 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPostImage(null);
                                setImageSelected(false);
                              }}
                            >
                              ✕
                            </button>

                          </div>

                        )}

                      </div>

                      {!validated && !imageSelected && (

                        <p className="text-red-500 text-sm mt-2">
                          Please select an image to continue
                        </p>

                      )}

                    </div>

                    {/* CAPTION */}
                    <div className="mb-6">

                      <textarea
                        rows="5"
                        placeholder="Write a caption..."
                        value={captionText}
                        onChange={(e) => {
                          setPostText(e.target.value);
                          setCaptionText(e.target.value);
                        }}
                        className={`w-full rounded-2xl border p-4 outline-none resize-none transition
                    ${!validated &&
                            captionText.trim() === ""
                            ? "border-red-400"
                            : "border-gray-300 focus:border-pink-500"
                          }`}
                      />

                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">

                        <span>✨ Express yourself</span>

                        <span>
                          {captionText.length}/2200
                        </span>

                      </div>

                      {!validated &&
                        captionText.trim() === "" && (

                          <p className="text-red-500 text-sm mt-2">
                            Caption is required
                          </p>

                        )}

                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-3">

                      <button
                        className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                        onClick={() => setMpost(true)}
                      >
                        Cancel
                      </button>

                      <button
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition disabled:opacity-50"
                        onClick={validateAndPost}
                        disabled={
                          !imageSelected ||
                          captionText.trim() === ""
                        }
                      >
                        {createPostStatus ? (<LoadingDots text="Sharing Post" />) : 'Share Post'}
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            )

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
