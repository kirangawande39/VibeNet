import React, { useContext, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

import "../assets/css/EditProfile.css"
const EditProfile = () => {
  const { updateUser } = useContext(AuthContext);
  const location = useLocation();
  const profileData = location.state?.profileData;
  const posts = location.state?.posts;

  const [user, setUser] = useState(profileData || null);
  const [isEditingBioName, setIsEditingBioName] = useState(false);
  const [bio, setBio] = useState(profileData?.bio || "");
  const [name, setName] = useState(profileData?.name || "");

  const fileInputRef = useRef(null);

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger">Please login to view your profile.</h4>
      </div>
    );
  }

  const handleBioNameSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, bio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");

      const updatedUser = { ...user, name, bio };
      console.log('updateUser:', updateUser)
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success("Profile updated!");
      setIsEditingBioName(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await fetch(
        `http://localhost:5000/api/users/${user._id}/uploadProfilePic`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const updatedUser = { ...user, profilePic: data.profilePic };
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile picture.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row gy-5">
        {/* Profile Card */}
        <div className="col-md-4">
          <div className="card p-4 shadow rounded-4 text-center">
            <img
              src={
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Profile"
              className="rounded-circle mb-3 border"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
              }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleProfilePicUpload}
            />
            <button className="btn btn-outline-primary btn-sm mb-3" onClick={triggerFileInput}>
              Change Profile Picture
            </button>

            <h4 className="fw-bold">@{user.username}</h4>
            <div className="d-flex justify-content-around mt-3">
              <div>
                <strong>{posts?.length || 0}</strong>
                <p className="mb-0 small">Posts</p>
              </div>
              <div>
                <strong>{user.followers?.length || 0}</strong>
                <p className="mb-0 small">Followers</p>
              </div>
              <div>
                <strong>{user.following?.length || 0}</strong>
                <p className="mb-0 small">Following</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Bio and Name Section */}
        <div className="col-md-8">
          <div className="card p-4 shadow rounded-4">
            {isEditingBioName ? (
              <>
                <h5 className="mb-3 fw-bold">Edit Profile</h5>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <textarea
                  className="form-control mb-3"
                  rows="3"
                  placeholder="Write your bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button className="btn btn-success" onClick={handleBioNameSave}>
                    <FaSave className="me-1" />
                    Save Changes
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditingBioName(false)}
                  >
                    <FaTimes className="me-1" />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="fw-bold">Hello, {user.name || user.username} 👋</h3>
                <p className="mt-3"><strong>Bio:</strong> {user.bio || "No bio available"}</p>
                <button
                  className="btn btn-outline-primary btn-sm mt-3"
                  onClick={() => setIsEditingBioName(true)}
                >
                  <FaEdit className="me-1" /> Edit Name & Bio
                </button>
              </>
            )}
          </div>

          {/* User Posts */}
          <div className="mt-5 mb-5">
            <h4 className="mb-4 fw-semibold">Your Posts</h4>

            {posts && posts.length > 0 ? (
              <div className="masonry-grid">
                {posts.map((post) => (
                  <div key={post.id} className="masonry-item">
                    <div className="card border-0 shadow-sm mb-3">
                      <img
                        src={post.image}
                        alt="Post"
                        className="card-img-top"
                        style={{ width: "100%", height: "auto", objectFit: "cover" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No posts available</p>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default EditProfile;


