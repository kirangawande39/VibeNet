import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import "../assets/css/Profile.css"

const Profile = () => {
  const [file, setFile] = useState(null);
  const [mpost, setMpost] = useState(false);
  const [mreals, setMreals] = useState(false);
  const { user } = useContext(AuthContext);

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



  
    const handleProfileImage = (e) => {
      // Get the file from input
      const selectedFile = e.target.files[0];
  
      // If file is selected, update the state
      if (selectedFile) {
        setFile(selectedFile);
        alert(`File selected: ${selectedFile.name}`);
      }
    };
  
    const handleUpload = async () => {
      if (!file) {
        alert("Please select a profile picture first.");
        return;
      }
    
      const formData = new FormData();
      formData.append("profilePic", file); // "profilePic" should match your backend field name
    
      try {
        const res = await axios.put(`http://localhost:5000/api/users/${user.id}/uploadProfilePic`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
    
        alert("Profile picture updated successfully!");
        setProfileData({ ...profileData, profilePic: res.data.profilePic }); // update the UI
        setFile(null);
      } catch (err) {
        console.error("Error uploading profile picture:", err);
        alert("Failed to upload profile picture");
      }
    };
    

  return (
    <div className="container mt-4">
      <div className="row align-items-center">
        <div className="col-md-3 text-center">
          <img
            src={profileData.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
            alt="Profile"
            className="rounded-circle img-fluid border"
            style={{ width: "150px", height: "150px" }}
          />
           <h3>{profileData.name}</h3>
        </div>
        <div className="col-md-6">
          {/* <h3>{profileData.profilePic}</h3> */}
          <h3>{profileData.username}</h3>
          
          {/* <h3>{profileData._id}</h3>
          <h3>Id:{id}</h3> */}
          <p>{profileData.bio || "No bio available"}</p>
          <button onClick={handleEdit} className="btn btn-outline-primary btn-sm">
            Edit Profile
          </button>
        </div>
        <div className="col-md-3 text-center">
          <p><strong>{profileData.posts?.length || 0}</strong> Posts</p>
          <p><strong>{profileData.followers || 0}</strong> Followers</p>
          <p><strong>{profileData.following || 0}</strong> Following</p>
        </div>
      </div>

      <hr />
      <div className="media-post">
      <button onClick={()=>setMpost(true)}>post</button>
      <button  onClick={()=>setMreals(true)}>reals</button>
      </div>
      <hr />
     {mpost ? <h1>po is here</h1> : <h1>post is not here</h1>}
     {mreals ? <h1>reals is here</h1> : <h1>rea is not here</h1>}
      <div className="row">
        {profileData.posts && profileData.posts.length > 0 ? (
          profileData.posts.map((post) => (
            <div key={post._id} className="col-md-4 mb-3">
              <img
                src={post.image}
                alt="Post"
                className="img-fluid rounded"
                style={{ width: "100%", height: "250px", objectFit: "cover" }}
              />
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>

      <div className="row p-4 bg-light rounded-4 shadow-sm text-center" style={{ maxWidth: "400px", margin: "40px auto" }}>
      <h2 className="mb-2" style={{ fontWeight: "600" }}>Add a Profile Photo</h2>
      <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
        Add a profile picture so your friends can recognize you.
      </p>

      {/* File input with handleProfileImage onChange */}
      <input
        type="file"
        accept="image/*"
        className="form-control mb-3"
        onChange={handleProfileImage}
      />

      {/* Upload button triggering handleUpload */}
      <button className="btn btn-dark w-100 rounded-pill" onClick={handleUpload}>Upload Picture</button>
    </div>


      <h2>Complete your profile</h2>
    <div className="container profile-boxs">
      <div className="profile-box">
        <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
        <h6>Add bio</h6>
        <p>Tell your followers a title bit <br />about yourself.</p>
        <button onClick={handleEdit}>Add bio</button>
      </div>
      <div className="profile-box">
        <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
        <h6>Add yo name</h6>
        <p>Add your full name so your friends  <br />know it's you.</p>
        <button onClick={handleEdit}>Edit name</button>
      </div>
      <div className="profile-box">
        <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
        <h6>Add profile picture</h6>
        <p>Choose a profile picture to represent <br /> yourself on Instagram.</p>
        <button onClick={handleEdit}>Change picture</button>
      </div>
    </div>

    </div>
  );
};




export default Profile;






