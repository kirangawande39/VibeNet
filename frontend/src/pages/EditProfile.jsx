import React, { useContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { ToastContainer,toast } from "react-toastify";
const EditProfile = () => {
  const { updateUser } = useContext(AuthContext);
  const location = useLocation();
  const profileData = location.state?.profileData;

  const [user, setUser] = useState(profileData || null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profileData?.bio || "");

  console.log("EditProfile Data:", profileData);

  if (!user) {
    return (
      <div className="container mt-4">
        <h3>Please login to view your profile.</h3>
      </div>
    );
  }

  const handleSaveBio = async () => {
    const confirm = window.confirm("Are you sure you want to update your bio?");
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update profile");

      toast.success("Bio updated successfully!");
      setIsEditing(false);
      setUser({ ...user, bio }); // Update local
      updateUser({ ...user, bio }); // Optional global context update
    } catch (error) {
      console.error("Error updating bio:", error);
      toast.error("Failed to update bio");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer/>
      <div className="row align-items-center">
        <div className="col-md-3 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Profile"
            className="rounded-circle img-fluid border"
            style={{ width: "150px", height: "150px" }}
          />
        </div>

        <div className="col-md-6">
          <h3>@{user.username}</h3>

          {isEditing ? (
            <>
              <textarea
                className="form-control mb-2"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
              />
              <button className="btn btn-success btn-sm me-2" onClick={handleSaveBio}>
                Save
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <p>{user.bio || "No bio available"}</p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => setIsEditing(true)}>
                Edit Your Bio
              </button>
            </>
          )}
        </div>

        <div className="col-md-3 text-center">
          <p><strong>{user.posts?.length || 0}</strong> Posts</p>
          <p><strong>{user.followers || 0}</strong> Followers</p>
          <p><strong>{user.following || 0}</strong> Following</p>
        </div>
      </div>

      <hr />

      <div className="row">
        {user.posts && user.posts.length > 0 ? (
          user.posts.map((post) => (
            <div key={post.id} className="col-md-4 mb-3">
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
    </div>
  );
};

export default EditProfile;
