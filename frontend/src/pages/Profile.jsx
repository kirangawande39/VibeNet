// Top-level imports (No change)
import React, { useContext, useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { BsFillPostcardHeartFill } from "react-icons/bs";
import "../assets/css/Profile.css"
import { FaPlus } from "react-icons/fa";

// Start of component
const Profile = () => {
  const [file, setFile] = useState(null);
  const [mpost, setMpost] = useState(false);
  const [mreals, setMreals] = useState(true);
  const [postText, setPostText] = useState(null);
  const [postImage, setPostImage] = useState(null);
  const [story, setStory] = useState(false);
  const [uploadStory, setUploadedStory] = useState(null);
  const [storyFile, setStoryFile] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false); // for modal
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [searchFollower, setSearchFollower] = useState("");
  const [searchFollowing, setSearchFollowing] = useState("");

  const [posts,setPosts]=useState([])


  const { user } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();



  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);

        console.log("user", response.data.user)
        setProfileData(response.data.user);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    const fetchPostData = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        console.log("Posts:",res.data.posts)
        setPosts(res.data.posts);
      } catch (err) {
        console.error("Failed to fetch profile data:", err);
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
        <h4>Loading profile...</h4>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/users/${user.id}/edit_profile`, {
      state: { profileData },
    });
  };

  const handlePostImage = (e) => {
    const selectedPost = e.target.files[0];
    if (selectedPost) {
      setPostImage(selectedPost);
      alert(`File selected: ${selectedPost.name}`);
    }
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("description", postText);
    formData.append("postImage", postImage);

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
    } catch (err) {
      console.error("Error post create :", err);
      alert("Failed to create post");
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
      const res = await axios.post("http://localhost:5000/api/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      // Store the uploaded story data in the parent component state
      const story = res.data.story;
      setUploadedStory(story);

      alert("Story uploaded successfully!");
    } catch (err) {
      alert("Upload failed: " + err.response?.data?.message || err.message);
    }
  };




  const handleProfileStoryClick = () => {
    if (uploadStory) setShowStoryModal(true);
  };

  return (
    <div className="profile-container">
      <ToastContainer />

      {/* Profile Section */}
      <div className="profile-header d-flex justify-content-between align-items-center">
        <div className={`d-flex align-items-center ${uploadStory ? 'story-ring' : ''}`} onClick={handleProfileStoryClick} style={{ cursor: uploadStory ? "pointer" : "default" }}>
          <img
            src={profileData.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Profile"
            className="profile-img"
          />
          <div className="ms-4">
            <h3 className="username">{profileData.username}</h3>
            <p className="bio">{profileData.bio || "No bio available"}</p>
            <button className="btn btn-outline-primary btn-sm" onClick={handleEdit}>
              Edit Profile
            </button>
          </div>
        </div>
        <div className="text-end">
          <div className="profile-stats">
            <span><strong>{profileData.posts?.length || 0}</strong> Posts</span>
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
      </div>
      {/* Followers Modal */}

      {showFollowers && (
        <div className="story-modal-backdrop" onClick={() => setShowFollowers(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Followers</h5>

            {/* Search Input */}
            <div className="input-group mb-2">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
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
                          src={follower.profilePic || "/default-profile.png"}
                          alt="profile"
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                        />
                        <div>
                          <strong>{follower.username}</strong><br />
                          <small>{follower.name || ""}</small>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary">Following</button>
                    </li>
                  ))
              ) : (
                <li className="list-group-item">No followers yet</li>
              )}
            </ul>

            <button className="story-close-btn" onClick={() => setShowFollowers(false)}>×</button>
          </div>
        </div>
      )}


      {showFollowing && (
        <div className="story-modal-backdrop" onClick={() => setShowFollowing(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Following</h5>

            {/* Search Input */}
            <div className="input-group mb-2">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
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
                          src={followed.profilePic || "/default-profile.png"}
                          alt="profile"
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px", objectFit: "cover", marginRight: "10px" }}
                        />
                        <div>
                          <strong>{followed.username}</strong><br />
                          <small>{followed.name || ""}</small>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline-primary">Following</button>
                    </li>
                  ))
              ) : (
                <li className="list-group-item">Not following anyone</li>
              )}
            </ul>

            <button className="story-close-btn" onClick={() => setShowFollowing(false)}>×</button>
          </div>
        </div>
      )}




      {/* Story upload button */}
      <div>
        <h3 className="story-btn" onClick={handleStoryClick}>
          <FaPlus />
        </h3>
      </div>

      {/* Upload Story */}

      <div className="my-3">
        <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleUpload} style={{ display: "none" }} />
        {/* <button className="btn btn-success ms-2" onClick={handleUpload}>Upload Story</button> */}
      </div>


      {/* Story Modal */}
      {showStoryModal && uploadStory && (
        <div className="story-modal-backdrop" onClick={() => setShowStoryModal(false)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            {uploadStory?.mediaUrl?.endsWith(".mp4") ? (
              <video
                src={uploadStory.mediaUrl}
                controls
                autoPlay
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
      <div className="media-switcher my-4 d-flex justify-content-center gap-3">
        <button className={`btn ${mpost ? "btn-dark" : "btn-outline-dark"}`} onClick={() => { setMpost(true); setMreals(false); }}>
          <BsFillPostcardHeartFill /> Posts
        </button>
        <button className={`btn ${mreals ? "btn-dark" : "btn-outline-dark"}`} onClick={() => { setMpost(false); setMreals(true); }}>
          Reels
        </button>
      </div>

      

      {/* Posts Section */}
      {mpost ? (
        <div className="post-gallery row">
          {posts && posts.length > 0 ? (
             posts.map((post) => (
              <div key={post._id} className="col-md-4 mb-4">
                <div className="post-card shadow-sm">
                  <img src={post.image} alt="Post" className="post-img" />
                  <p className="post-caption">{post.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No posts available</p>
          )}
        </div>
      ) : (
        <div className="create-post-card">
          <h2>Create Post</h2>
          <p className="text-muted">Share your thoughts and optionally add an image.</p>
          <input type="file" accept="image/*" className="form-control mb-3" onChange={handlePostImage} />
          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Write a description..."
            onChange={(e) => setPostText(e.target.value)}
          ></textarea>
          <button className="btn btn-primary w-100 rounded-pill" onClick={handleCreatePost}>
            Post
          </button>
        </div>
      )}

      {/* Suggestion Boxes */}
      <div className="suggestion-section mt-5">
        <h4 className="mb-4">Complete your profile</h4>
        <div className="row gap-3 justify-content-center">

        </div>
      </div>

    </div>
  );
};

export default Profile;
