// import React, { useContext, useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";

// import "../assets/css/Profile.css"

// const Profile = () => {
//   const [file, setFile] = useState(null);
//   const { user } = useContext(AuthContext);

//   const { id } = useParams();

//   const [profileData, setProfileData] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       if (!user) return;
//       try {
//         const response = await axios.get(`http://localhost:5000/api/users/${id}`);
//         setProfileData(response.data);
//       } catch (err) {
//         console.error("Failed to fetch profile data:", err);
//       }
//     };

//     fetchProfileData();
//   }, [user]);

//   if (!user) {
//     return (
//       <div className="container mt-4">
//         <h3>Please login to view your profile.</h3>
//       </div>
//     );
//   }

//   if (!profileData) {
//     return (
//       <div className="container mt-4">
//         <h4>Loading profile...</h4>
//       </div>
//     );
//   }

//   const handleEdit = () => {
//     navigate(`/users/${user.id}/edit_profile`, {
//       state: { profileData },
//     });
//   };



  
//     const handleProfileImage = (e) => {
//       // Get the file from input
//       const selectedFile = e.target.files[0];
  
//       // If file is selected, update the state
//       if (selectedFile) {
//         setFile(selectedFile);
//         alert(`File selected: ${selectedFile.name}`);
//       }
//     };
  
//     const handleUpload = async () => {
//       if (!file) {
//         alert("Please select a profile picture first.");
//         return;
//       }
    
//       const formData = new FormData();
//       formData.append("profilePic", file); // "profilePic" should match your backend field name
    
//       try {
//         const res = await axios.put(`http://localhost:5000/api/users/${user.id}/uploadProfilePic`, formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         });
    
//         alert("Profile picture updated successfully!");
//         setProfileData({ ...profileData, profilePic: res.data.profilePic }); // update the UI
//         setFile(null);
//       } catch (err) {
//         console.error("Error uploading profile picture:", err);
//         alert("Failed to upload profile picture");
//       }
//     };
    

//   return (
//     <div className="container mt-4">
//       <div className="row align-items-center">
//         <div className="col-md-3 text-center">
//           <img
//             src={profileData.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
//             alt="Profile"
//             className="rounded-circle img-fluid border"
//             style={{ width: "150px", height: "150px" }}
//           />
//         </div>
//         <div className="col-md-6">
//           {/* <h3>{profileData.profilePic}</h3> */}
//           <h3>@{profileData.username}</h3>
//           {/* <h3>{profileData._id}</h3>
//           <h3>Id:{id}</h3> */}
//           <p>{profileData.bio || "No bio available"}</p>
//           <button onClick={handleEdit} className="btn btn-outline-primary btn-sm">
//             Edit Profile
//           </button>
//         </div>
//         <div className="col-md-3 text-center">
//           <p><strong>{profileData.posts?.length || 0}</strong> Posts</p>
//           <p><strong>{profileData.followers || 0}</strong> Followers</p>
//           <p><strong>{profileData.following || 0}</strong> Following</p>
//         </div>
//       </div>

//       <hr />

//       <div className="row">
//         {profileData.posts && profileData.posts.length > 0 ? (
//           profileData.posts.map((post) => (
//             <div key={post._id} className="col-md-4 mb-3">
//               <img
//                 src={post.image}
//                 alt="Post"
//                 className="img-fluid rounded"
//                 style={{ width: "100%", height: "250px", objectFit: "cover" }}
//               />
//             </div>
//           ))
//         ) : (
//           <p>No posts available</p>
//         )}
//       </div>

//       <div className="row p-4 bg-light rounded-4 shadow-sm text-center" style={{ maxWidth: "400px", margin: "40px auto" }}>
//       <h2 className="mb-2" style={{ fontWeight: "600" }}>Add a Profile Photo</h2>
//       <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
//         Add a profile picture so your friends can recognize you.
//       </p>

//       {/* File input with handleProfileImage onChange */}
//       <input
//         type="file"
//         accept="image/*"
//         className="form-control mb-3"
//         onChange={handleProfileImage}
//       />

//       {/* Upload button triggering handleUpload */}
//       <button className="btn btn-dark w-100 rounded-pill" onClick={handleUpload}>Upload Picture</button>
//     </div>


//       <h2>Complete your profile</h2>
//     <div className="container profile-boxs">
//       <div className="profile-box">
//         <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
//         <h6>Add bio</h6>
//         <p>Tell your followers a title bit <br />about yourself.</p>
//         <button onClick={handle}>Add bio</button>
//       </div>
//       <div className="profile-box">
//         <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
//         <h6>Add yo name</h6>
//         <p>Add your full name so your friends  <br />know it's you.</p>
//         <button>Edit name</button>
//       </div>
//       <div className="profile-box">
//         <img src="https://thumbs.dreamstime.com/b/default-avatar-profile-icon-social-media-user-vector-default-avatar-profile-icon-social-media-user-vector-portrait-176194876.jpg" alt="" />
//         <h6>Add profile picture</h6>
//         <p>Choose a profile picture to represent <br /> yourself on Instagram.</p>
//         <button onClick={handleUpload}>Change picture</button>
//       </div>
//     </div>


//     </div>
//   );
// };




// export default Profile;



import React, { useContext, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUserPlus, faEllipsisH, faHeart, faComment, faBookmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import "../assets/css/Profile.css";

const Profile = () => {
  const [file, setFile] = useState(null);
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
  }, [user, id]);

  if (!user) {
    return (
      <div className="container mt-4 text-center">
        <h3 className="text-muted">Please login to view your profile.</h3>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="mt-2">Loading profile...</h4>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/users/${user.id}/edit_profile`, {
      state: { profileData },
    });
  };

  const handleProfileImage = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a profile picture first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("profilePic", file);
  
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/${user.id}/uploadProfilePic`, 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setProfileData({ ...profileData, profilePic: res.data.profilePic });
      setFile(null);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      alert("Failed to upload profile picture");
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="container">
          <div className="row align-items-center">
            {/* Profile Picture Column */}
            <div className="col-md-4 text-center position-relative">
              <div className="profile-pic-container">
                <img
                  src={profileData.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                  alt="Profile"
                  className="profile-picture"
                />
                <div className="profile-pic-overlay">
                  <label htmlFor="profile-upload" className="upload-label">
                    <FontAwesomeIcon icon={faEdit} />
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleProfileImage}
                  />
                </div>
              </div>
            </div>

            {/* Profile Info Column */}
            <div className="col-md-8">
              <div className="profile-info">
                <div className="d-flex align-items-center mb-3">
                  <h2 className="profile-username mb-0">@{profileData.username}</h2>
                  <button 
                    onClick={handleEdit} 
                    className="btn btn-outline-secondary btn-sm ms-3"
                  >
                    Edit Profile
                  </button>
                  <button className="btn btn-outline-secondary btn-sm ms-2">
                    <FontAwesomeIcon icon={faUserPlus} />
                  </button>
                  <button className="btn btn-outline-secondary btn-sm ms-2">
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </button>
                </div>

                <div className="profile-stats mb-3">
                  <div className="stat-item">
                    <span className="stat-number">{profileData.posts?.length || 0}</span>
                    <span className="stat-label">posts</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{profileData.followers || 0}</span>
                    <span className="stat-label">followers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{profileData.following || 0}</span>
                    <span className="stat-label">following</span>
                  </div>
                </div>

                <div className="profile-bio">
                  <h5 className="mb-1">{profileData.fullName || "No name provided"}</h5>
                  <p className="mb-0">{profileData.bio || "No bio available"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <div className="container">
          {/* Posts Section */}
          <div className="profile-posts">
            <div className="posts-header">
              <div className="posts-tab active">
                <span>
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  POSTS
                </span>
              </div>
            </div>

            {profileData.posts && profileData.posts.length > 0 ? (
              <div className="posts-grid">
                {profileData.posts.map((post) => (
                  <div key={post._id} className="post-item">
                    <img
                      src={post.image}
                      alt="Post"
                      className="post-image"
                    />
                    <div className="post-overlay">
                      <div className="post-stats">
                        <span>
                          <FontAwesomeIcon icon={faHeart} /> {post.likes || 0}
                        </span>
                        <span>
                          <FontAwesomeIcon icon={faComment} /> {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-posts text-center py-5">
                <div className="no-posts-icon">
                  <FontAwesomeIcon icon={faEdit} />
                </div>
                <h4>No Posts Yet</h4>
                <p className="text-muted">When you share photos and videos, they'll appear here.</p>
              </div>
            )}
          </div>

          {/* Profile Completion Section */}
          <div className="profile-completion mt-5">
            <h5 className="section-title">Complete Your Profile</h5>
            <div className="completion-cards">
              <div className="completion-card">
                <div className="card-icon">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/456/456212.png" 
                    alt="Bio" 
                  />
                </div>
                <h6>Add Bio</h6>
                <p className="text-muted">Tell your followers a little bit about yourself.</p>
                <button 
                  onClick={handleEdit} 
                  className="btn btn-outline-primary btn-sm"
                >
                  Add Bio
                </button>
              </div>

              <div className="completion-card">
                <div className="card-icon">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                    alt="Name" 
                  />
                </div>
                <h6>Add Your Name</h6>
                <p className="text-muted">Add your full name so your friends know it's you.</p>
                <button 
                  onClick={handleEdit} 
                  className="btn btn-outline-primary btn-sm"
                >
                  Edit Name
                </button>
              </div>

              <div className="completion-card">
                <div className="card-icon">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/456/456141.png" 
                    alt="Profile Picture" 
                  />
                </div>
                <h6>Add Profile Picture</h6>
                <p className="text-muted">Choose a profile picture to represent yourself.</p>
                <button 
                  onClick={() => document.getElementById('profile-upload').click()}
                  className="btn btn-outline-primary btn-sm"
                >
                  Change Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
