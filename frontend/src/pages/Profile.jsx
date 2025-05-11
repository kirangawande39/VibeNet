import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { BsFillPostcardHeartFill } from "react-icons/bs";
import "../assets/css/Profile.css"
import { FaPlus } from "react-icons/fa";

const Profile = () => {
  const [file, setFile] = useState(null);
  const [mpost, setMpost] = useState(false);
  const [mreals, setMreals] = useState(true);
  const { user } = useContext(AuthContext);
  const [postText, setPostText] = useState(null);
  const [postImage, setPostImage] = useState(null);


  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setProfileData(response.data);
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
        setProfileData(prev => ({
          ...prev,
          posts: res.data.posts
        }));

      } catch (err) {
        console.error("Failed to fetch profile data:", err);
      }
    };

    fetchPostData();
  }, [user, id]); // Also add `id` to dependencies if it's dynamic


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

    // If file is selected, update the state
    if (selectedPost) {
      setPostImage(selectedPost);
      alert(`File selected: ${selectedPost.name}`);
    }
  }

  // const handlePostText = (e) => {
  //     const postText=e.target.value;

  //     setPostText(postText)

  // }

  const handleCreatePost = async () => {
    // console.log('Post Image:' + postImage.name)
    // console.log('Post Text:' + postText)


    const formData = new FormData();
    formData.append("description", postText); // 'dis' is your post description
    formData.append("postImage", postImage);

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message); // shows: "Post created successfully"
      console.log(res.data.post);
      console.l
    }
    catch (err) {
      console.error("Error post create :", err);
      alert("Failed to create post");
    }
  }

  const handleStory=()=>{
    alert("Story is here")
  }


  return (
    <div className="profile-container">
      <ToastContainer />
      <div className="profile-header d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
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
            <span><strong>{profileData.followers.length || 0}</strong> Followers</span>
            <span><strong>{profileData.following.length || 0}</strong> Following</span>
          </div>
        </div>
      </div>
  
            <h3 className="story-btn" onClick={handleStory}>
            <FaPlus/>
            </h3>
      <div className="media-switcher my-4 d-flex justify-content-center gap-3">
        <button className={`btn ${mpost ? "btn-dark" : "btn-outline-dark"}`} onClick={() => { setMpost(true); setMreals(false); }}>
          <BsFillPostcardHeartFill /> Posts
        </button>
        <button className={`btn ${mreals ? "btn-dark" : "btn-outline-dark"}`} onClick={() => { setMpost(false); setMreals(true); }}>
          Reels
        </button>
      </div>
  
      {mpost ? (
        <div className="post-gallery row">
          {profileData.posts && profileData.posts.length > 0 ? (
            profileData.posts.map((post) => (
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
  
      <div className="suggestion-section mt-5">
        <h4 className="mb-4">Complete your profile</h4>
        <div className="row gap-3 justify-content-center">
          <div className="profile-box">
            <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="bio" />
            <h6>Add Bio</h6>
            <p>Tell your followers about yourself.</p>
            <button onClick={handleEdit}>Add Bio</button>
          </div>
          <div className="profile-box">
            <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="name" />
            <h6>Add Your Name</h6>
            <p>Help your friends recognize you.</p>
            <button onClick={handleEdit}>Edit Name</button>
          </div>
          <div className="profile-box">
            <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="pic" />
            <h6>Add Profile Picture</h6>
            <p>Choose a picture to represent yourself.</p>
            <button onClick={handleEdit}>Change Picture</button>
          </div>
        </div>
      </div>
    </div>
  );
  
};




export default Profile;






