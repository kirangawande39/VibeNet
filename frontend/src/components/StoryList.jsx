import React, { useState, useRef, useEffect, useContext } from "react";
import "../assets/css/StoryList.css";
import { FaArrowLeft, FaArrowRight, FaHeart, FaShare, FaPlus, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const isVideo = (url) => {
  return url?.match(/\.(mp4|webm|ogg)$/i);
};

const StoryList = ({ stories }) => {
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id;

  const [index, setIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  // Group stories by userId for easier modal navigation
  const storiesByUser = stories.reduce((acc, story) => {
    const uid = story.user._id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(story);
    return acc;
  }, {});

  // Get current user stories if any
  const currentUserStories = currentUserId ? storiesByUser[currentUserId] || [] : [];

  // Prepare display array with "Your Story" first
  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => uid !== currentUserId)
    .map((uid) => ({
      user: storiesByUser[uid][0].user,
      stories: storiesByUser[uid],
    }));

  const openStory = (userId, storyIndex = 0) => {
    setIndex({ userId, storyIndex });
    setProgress(0);
  };

  const closeStory = () => {
    setIndex(null);
    setProgress(0);
  };

  // Modal state
  const currentUserIdInModal = index?.userId;
  const currentStoryIndex = index?.storyIndex || 0;
  const currentUserStoriesInModal = currentUserIdInModal ? storiesByUser[currentUserIdInModal] : null;
  const currentStory = currentUserStoriesInModal ? currentUserStoriesInModal[currentStoryIndex] : null;

  const goNext = () => {
    if (!currentUserStoriesInModal) return;

    if (currentStoryIndex < currentUserStoriesInModal.length - 1) {
      // Next story in current user's stories
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex + 1 });
      setProgress(0);
    } else {
      // Go to next user's first story
      const userIds = Object.keys(storiesByUser);
      const currentUserPos = userIds.indexOf(currentUserIdInModal);
      if (currentUserPos < userIds.length - 1) {
        const nextUserId = userIds[currentUserPos + 1];
        setIndex({ userId: nextUserId, storyIndex: 0 });
        setProgress(0);
      } else {
        closeStory();
      }
    }
  };

  const goPrev = () => {
    if (!currentUserStoriesInModal) return;

    if (currentStoryIndex > 0) {
      // Previous story in current user's stories
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex - 1 });
      setProgress(0);
    } else {
      // Go to previous user's last story
      const userIds = Object.keys(storiesByUser);
      const currentUserPos = userIds.indexOf(currentUserIdInModal);
      if (currentUserPos > 0) {
        const prevUserId = userIds[currentUserPos - 1];
        const prevUserStories = storiesByUser[prevUserId];
        setIndex({ userId: prevUserId, storyIndex: prevUserStories.length - 1 });
        setProgress(0);
      }
    }
  };

  useEffect(() => {
    if (index === null || !isVideo(currentStory?.mediaUrl)) return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(console.error);

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const onEnd = () => {
      setTimeout(goNext, 500);
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", onEnd);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", onEnd);
    };
  }, [index, currentStory]);

  const handleOverlayClick = (e) => {
    if (e.target.closest(".story-modal-contents")) return;
    const x = e.clientX;
    const w = window.innerWidth;

    if (x < w / 3) goPrev();
    else if (x > (w / 3) * 2) goNext();
  };

  const handleStoryLike = () => alert("Story liked!");
  const handleStoryShare = () => alert("Story shared!");

  if (!stories?.length) return null;

  return (
    <>
      <div className="story-list-container">
        {/* Your Story Bubble Always First */}
        <div
          className="story-item your-story"
          onClick={() => openStory(currentUserId, 0)}
          style={{ position: "relative", cursor: "pointer" }}
        >
          <div className="story-circle">
            <div className="story-gradient-border">
              {currentUserStories.length > 0 ? (
                isVideo(currentUserStories[0].mediaUrl) ? (
                  <video
                    className="story-preview"
                    src={currentUserStories[0].mediaUrl}
                    muted
                    loop
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="story-preview"
                    src={currentUserStories[0].mediaUrl}
                    alt="Your Story"
                  />
                )
              ) : (
                <img
                  className="story-preview"
                  src={
                    currentUser.profilePic?.url || currentUser?.profilePic ||
                    "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg"
                  }
                  alt="Your Story"
                />
              )}
            </div>
          </div>
          <p className="story-username">Your Story</p>

          {/* Plus icon bottom-right corner */}
          <div className="story-add-icon">
            <FaPlus />
          </div>
        </div>

        {/* Other users stories */}
        {otherUsersStories.map(({ user, stories }) => (
          <div
            key={user._id}
            className="story-item"
            onClick={() => openStory(user._id, 0)}
            style={{ cursor: "pointer" }}
          >
            <div className="story-circle">
              <div className="story-gradient-border">
                {isVideo(stories[0].mediaUrl) ? (
                  <video
                    className="story-preview"
                    src={stories[0].mediaUrl}
                    muted
                    loop
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="story-preview"
                    src={stories[0].mediaUrl}
                    alt={user.username}
                  />
                )}
              </div>
            </div>
            <p className="story-username">{user.username}</p>
          </div>
        ))}
      </div>

      {/* Story Modal */}
      {currentStory && (
  <div className="story-modal-overlay" onClick={handleOverlayClick}>
    <div className="story-modal">
      {/* Progress bar */}
      <div className="story-progress-container">
        <div className="story-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      
      <div className="story-modal-content">
        {/* User profile at top left */}
        <div className="userProfile">
          <img 
            src={currentStory.user.profilePic?.url || currentStory.user.profilePic || "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg"} 
            alt={currentStory.user.username} 
          />
          <p>{currentStory.user.username}</p>
        </div>
        
        {/* Close button at top right */}
        <button className="story-close-btn" onClick={closeStory}>
          <FaTimes />
        </button>

        {/* Story content */}
        {isVideo(currentStory.mediaUrl) ? (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            className="story-modal-video"
            autoPlay
           
          />
        ) : (
          <img
            src={currentStory.mediaUrl}
            className="story-modal-image"
            alt="story"
          />
        )}

        {/* Navigation buttons */}
        <button
          className={`story-nav-btn prev ${currentStoryIndex === 0 &&
            Object.keys(storiesByUser).indexOf(currentUserIdInModal) === 0 ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={currentStoryIndex === 0 &&
            Object.keys(storiesByUser).indexOf(currentUserIdInModal) === 0}
        >
          <FaArrowLeft />
        </button>

        <button
          className={`story-nav-btn next ${currentStoryIndex === currentUserStoriesInModal.length - 1 &&
            Object.keys(storiesByUser).indexOf(currentUserIdInModal) === Object.keys(storiesByUser).length - 1 ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          disabled={currentStoryIndex === currentUserStoriesInModal.length - 1 &&
            Object.keys(storiesByUser).indexOf(currentUserIdInModal) === Object.keys(storiesByUser).length - 1}
        >
          <FaArrowRight />
        </button>

        {/* Action buttons */}
        <div className="story-actions">
          <button onClick={handleStoryLike}>
            <FaHeart size={20} />
          </button>
          <button onClick={handleStoryShare}>
            <FaShare size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default StoryList;