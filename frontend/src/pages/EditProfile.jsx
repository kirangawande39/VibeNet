import React, { useContext, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const EditProfile = () => {
  const { updateUser } = useContext(AuthContext);
  const location = useLocation();
  const profileData = location.state?.profileData;

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

      const res = await fetch(`http://localhost:5000/api/users/${user._id}/uploadProfilePic`, {
        method: "PUT",
        body: formData,
      });

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
      <div className="row">
        <div className="col-md-4">
          <div className="card p-4 shadow-lg border-0 rounded-4 text-center">
            <img
              src={user.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              alt="Profile"
              className="rounded-circle border mb-3"
              style={{ width: "150px", height: "150px", objectFit: "cover" }}
            />
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleProfilePicUpload}
            />
            {/* Button to trigger file input */}
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={triggerFileInput}
            >
              Change Profile Picture
            </button>

            <h4 className="fw-bold mt-3">@{user.username}</h4>
            <p className="mb-1"><strong>{user.posts?.length || 0}</strong> Posts</p>
            <p className="mb-1"><strong>{user.followers || 0}</strong> Followers</p>
            <p><strong>{user.following || 0}</strong> Following</p>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card p-4 shadow-lg border-0 rounded-4">
            {isEditingBioName ? (
              <>
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
                <button className="btn btn-success me-2" onClick={handleBioNameSave}>
                  <FaSave className="me-1" /> Save Changes
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditingBioName(false)}
                >
                  <FaTimes className="me-1" /> Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="fw-bold">Welcome, {user.name || user.username}!</h3>
                <p className="mb-2"><strong>Bio:</strong> {user.bio || "No bio available"}</p>
                <button
                  className="btn btn-outline-primary btn-sm mt-3"
                  onClick={() => setIsEditingBioName(true)}
                >
                  <FaEdit className="me-1" /> Edit Name & Bio
                </button>
              </>
            )}
          </div>

          <hr className="my-5" />
          <h4 className="mb-4">Your Posts</h4>
          <div className="row">
            {user.posts && user.posts.length > 0 ? (
              user.posts.map((post) => (
                <div key={post.id} className="col-md-4 mb-4">
                  <div className="card border-0 shadow-sm">
                    <img
                      src={post.image}
                      alt="Post"
                      className="card-img-top"
                      style={{ height: "250px", objectFit: "cover" }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
