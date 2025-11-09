import React, { useContext, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes, FaCamera, FaPlus, FaCog } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils/errorHandler";

const EditProfile = () => {
  const { updateUser } = useContext(AuthContext);
  const location = useLocation();
  const profileData = location.state?.profileData;
  const posts = location.state?.posts;

  const [user, setUser] = useState(profileData || null);
  const [isEditingBioName, setIsEditingBioName] = useState(false);
  const [bio, setBio] = useState(profileData?.bio || "");
  const [name, setName] = useState(profileData?.name || "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);

  const [showFabMenu, setShowFabMenu] = useState(false);
  const token = localStorage.getItem("token");

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h4 className="text-red-500 text-xl font-semibold">
          Please login to view your profile.
        </h4>
      </div>
    );
  }

  const handleBioNameSave = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    } catch (err) {
      handleError(err);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("profilePic", file);

      const res = await fetch(
        `${backendUrl}/api/users/${user._id}/uploadProfilePic`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const updatedUser = { ...user, profilePic: data.profilePic };
      setUser(updatedUser);
      updateUser(updatedUser);
      toast.success("Profile picture updated!");
    } catch (err) {
      handleError(err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:ml-[220px]">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="xl:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center border border-gray-200">
              {/* Profile Image */}
              <div className="relative inline-block mb-4 group">
                <img
                  src={
                    user.profilePic?.url ||
                    "https://as1.ftcdn.net/v2/jpg/03/39/45/96/1000_F_339459697_XAFacNQmwnvJRqe1Fe9VOptPWMUxlZP8.jpg"
                  }
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={triggerFileInput}
                  className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <FaCamera size={14} />
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleProfilePicUpload}
              />

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                @{user.username}
              </h3>

              {/* Stats */}
              <div className="flex justify-around mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {posts?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.followers?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {user.following?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Bio and Posts */}
          <div className="xl:col-span-2 space-y-8">
            {/* Edit Bio & Name */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              {isEditingBioName ? (
                <div className="space-y-4">
                  <h5 className="text-lg font-bold text-gray-800">
                    Edit Profile
                  </h5>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Write your bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      onClick={handleBioNameSave}
                    >
                      <FaSave size={14} />
                      Save
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      onClick={() => setIsEditingBioName(false)}
                    >
                      <FaTimes size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Hello, {user.name || user.username} 👋
                  </h3>

                  <div className="pt-2">
                    <h4 className="font-semibold text-gray-700 mb-1">Bio:</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                      {user.bio || "No bio available"}
                    </p>
                  </div>

                  <button
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:scale-105 transition-transform"
                    onClick={() => setIsEditingBioName(true)}
                  >
                    <FaEdit size={14} />
                    Edit Name & Bio
                  </button>
                </div>
              )}
            </div>

            {/* User Posts */}
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                Your Posts
              </h4>
              {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => (
                    <div key={post._id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-xl shadow-md transition-all duration-300 group-hover:shadow-xl">
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold">
                          View Post
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📷</div>
                  <p className="text-gray-500 text-lg">No posts yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Start sharing your moments!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          {showFabMenu && (
            <div className="absolute bottom-16 right-0 space-y-3">
              <button className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                <FaPlus />
              </button>
              <button className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                <FaEdit />
              </button>
              <button className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md flex items-center justify-center hover:scale-110 transition-transform">
                <FaCog />
              </button>
            </div>
          )}
          <button
            onClick={() => setShowFabMenu(!showFabMenu)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <FaPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
