import React, { useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";  // Import AuthContext

const Profile = () => {
  const { user } = useContext(AuthContext);  // Access user from context

  // Check if user is available
  if (!user) {
    return (
      <div className="container mt-4">
        <h3>Please login to view your profile.</h3>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Profile Header */}
      <div className="row align-items-center">
        <div className="col-md-3 text-center">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Fallback image if no profilePic
            alt="Profile"
            className="rounded-circle img-fluid border"
            style={{ width: "150px", height: "150px" }}
          />
        </div>
        <div className="col-md-6">
          <h3>@{user.username}</h3>
          <p>{user.bio || "No bio available"}</p>
          <button className="btn btn-outline-primary btn-sm">Edit Profile</button>
        </div>
        <div className="col-md-3 text-center">
          <p><strong>{user.posts?.length || 0}</strong> Posts</p>
          <p><strong>{user.followers || 0}</strong> Followers</p>
          <p><strong>{user.following || 0}</strong> Following</p>
        </div>
      </div>

      <hr />

      {/* Posts Grid */}
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

export default Profile;
