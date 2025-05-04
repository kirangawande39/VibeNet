import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate , useParams} from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const {id}=useParams();
  
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
        </div>
        <div className="col-md-6">
          <h3>@{profileData.username}</h3>
          <h3>{profileData._id}</h3>
          <h3>Id:{id}</h3>
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
    </div>
  );
};

export default Profile;
