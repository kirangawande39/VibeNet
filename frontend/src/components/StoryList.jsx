import React, { useState, useRef, useEffect, useContext } from "react";
import "../assets/css/StoryList.css";
import { FaArrowLeft, FaArrowRight, FaHeart, FaShare, FaPlus, FaTimes, FaPlay, FaPause } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { format } from "timeago.js";
import { IoEyeSharp } from "react-icons/io5";
const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i);

const StoryList = ({ stories }) => {
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id;

  const [index, setIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seenStories, setSeenStories] = useState(new Set());

  const [showViewers, setShowViewers] = useState(false)

  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const seenSet = useRef(new Set());
  const storyListRef = useRef(null);

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    const uid = story.user._id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(story);
    return acc;
  }, {});

  const currentUserStories = currentUserId ? storiesByUser[currentUserId] || [] : [];
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => uid !== currentUserId)
    .map((uid) => ({
      user: storiesByUser[uid][0].user,
      stories: storiesByUser[uid],
    }));

  // Calculate unique views
const uniqueViewers = new Set();

stories.forEach(story => {
  if (story.seenBy) {
    story.seenBy.forEach(entry => {
      const userId = typeof entry === 'object' && entry.user ? entry.user._id || entry.user : entry;
      uniqueViewers.add(userId.toString());
    });
  }
});

const uniqueViewsCount = uniqueViewers.size;


  const openStory = (userId, storyIndex = 0) => {
    setIndex({ userId, storyIndex });
    setProgress(0);
    setIsPlaying(true);
  };

  const closeStory = () => {
    setIndex(null);
    setProgress(0);
    setIsPlaying(false);
    clearInterval(progressInterval.current);
  };

  const togglePause = () => {
    if (isVideo(currentStory?.mediaUrl)) {
      if (isPlaying) {
        videoRef.current?.pause();
      } else {
        videoRef.current?.play().catch(console.error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const currentUserIdInModal = index?.userId;
  const currentStoryIndex = index?.storyIndex || 0;
  const currentUserStoriesInModal = currentUserIdInModal ? storiesByUser[currentUserIdInModal] : null;
  const currentStory = currentUserStoriesInModal ? currentUserStoriesInModal[currentStoryIndex] : null;

  const goNext = () => {
    if (!currentUserStoriesInModal) return;

    if (currentStoryIndex < currentUserStoriesInModal.length - 1) {
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex + 1 });
      setProgress(0);
    } else {
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
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex - 1 });
      setProgress(0);
    } else {
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

  // Mark story as seen
  useEffect(() => {
    if (!currentStory || seenSet.current.has(currentStory._id)) return;
    seenSet.current.add(currentStory._id);

    const markAsSeen = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res=await axios.put(
          `${backendUrl}/api/stories/${currentStory._id}/seen`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data.message)
        setSeenStories(prev => new Set(prev).add(currentStory._id));
      } catch (err) {
        console.error("Error marking story as seen:", err);
      }
    };

    markAsSeen();
  }, [currentStory]);






  // Handle video stories
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

  // Handle image stories progress
  useEffect(() => {
    if (index === null || isVideo(currentStory?.mediaUrl)) return;

    clearInterval(progressInterval.current);
    setProgress(0);

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            setTimeout(goNext, 300);
            return 100;
          }
          return prev + (100 / 50); // 5 seconds for each story (5000ms / 100ms)
        });
      }, 100);
    }

    return () => clearInterval(progressInterval.current);
  }, [index, currentStory, isPlaying]);

  const handleOverlayClick = (e) => {
    if (e.target.closest(".story-modal-contents")) return;
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w / 3) goPrev();
    else if (x > (w / 3) * 2) goNext();
  };

  const handleStoryLike = () => alert("Story liked!");
  const handleStoryShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this story',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("Story shared!");
    }
  };

  const handleViews = () => {
    setShowViewers(true)
  }

  if (!stories?.length) return null;

  return (
    <>
      <div className="story-list-container" ref={storyListRef}>
        {/* Your Story Bubble Always First */}
        <div
          className="story-item your-story"
          onClick={() => openStory(currentUserId, 0)}
        >
          <div className="story-circle">
            <div className={`story-gradient-border ${currentUserStories.length > 0 && currentUserStories.every(story => seenStories.has(story._id)) ? "seen" : ""}`}>
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
                    currentUser.profilePic?.url ||
                    currentUser?.profilePic ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="Your Story"
                />
              )}
            </div>
          </div>
          <p className="story-username">Your Story</p>
          {currentUserStories.length === 0 && (
            <div className="story-add-icon"><FaPlus /></div>
          )}
        </div>

        {/* Other Users */}
        {otherUsersStories.map(({ user, stories }) => {
          const isSeen = stories.every((s) => s.seenBy?.includes(currentUserId));
          return (
            <div key={user._id} className="story-item" onClick={() => openStory(user._id, 0)}>
              <div className="story-circle">
                <div className={`story-gradient-border ${isSeen ? "seen" : ""}`}>
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
          );
        })}
      </div>

      {/* Story Modal */}
      {currentStory && (
        <div className="story-modal-overlay" onClick={handleOverlayClick}>
          <div className="story-modal">
            {/* Progress bars */}
            <div className="story-progress-container">
              {currentUserStoriesInModal?.map((_, i) => (
                <div key={i} className="story-progress-track">
                  <div
                    className={`story-progress-bar ${i < currentStoryIndex ? "completed" : ""}`}
                    style={{
                      width: i === currentStoryIndex ? `${progress}%` :
                        i < currentStoryIndex ? "100%" : "0%"
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="story-modal-content">
              {/* Header */}
              <div className="story-header">
                <div className="user-profile">
                  <img
                    src={currentStory.user.profilePic?.url ||
                      currentStory.user.profilePic ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                    alt={currentStory.user.username}
                  />
                  <span>{currentStory.user.username}</span>
                </div>
                <span className="story-time">{format(currentStory.createdAt)}</span>
                <button className="story-close-btn" onClick={closeStory}>
                  <FaTimes />
                </button>
              </div>

              {/* Story content */}
              <div className="story-content" onClick={togglePause}>
                {isVideo(currentStory.mediaUrl) ? (
                  <video
                    ref={videoRef}
                    src={currentStory.mediaUrl}
                    className="story-media"
                    autoPlay
                    playsInline
                    muted={false}
                    controls={false}
                  />

                ) : (
                  <img
                    src={currentStory.mediaUrl}
                    className="story-media"
                    alt="story"
                  />
                )}
                {isVideo(currentStory.mediaUrl) && (
                  <div className="story-play-indicator">
                    {isPlaying ? " ": <FaPlay />}
                  </div>
                )}

              </div>

              {/* Navigation buttons */}
              <button
                className="story-nav-btn prev"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
              >
                <FaArrowLeft />
              </button>
              <button
                className="story-nav-btn next"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
              >
                <FaArrowRight />
              </button>

              {/* Footer actions - moved to bottom */}
              <div className="story-footer">
                {/* <input
                  type="text"
                  placeholder="Send message"
                  className="story-reply-input"
                /> */}
                <div className="story-action-buttons">
                  <button onClick={handleStoryLike}>
                    <FaHeart size={20} />
                  </button>
                  <button onClick={handleStoryShare}>
                    <FaShare size={20} />
                  </button>
                </div>
                {currentUser.id === currentStory.user._id ? <div className="story-views ">
                  {uniqueViewsCount} <IoEyeSharp onClick={handleViews} />
                </div>
                  :
                  " "
                }
              </div>


              {showViewers && (
                <div className="story-viewers-modal">
                  <div className="viewers-header">
                    <h4>Viewed by</h4>
                    <button onClick={() => setShowViewers(false)}>&times;</button>
                  </div>

                  <ul className="viewers-list">
                    {currentStory?.seenBy?.length > 0 ? (
                      // Sort by viewedAt descending (latest first)
                      currentStory.seenBy
                        .slice() // copy array
                        .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                        .map((entry) => (
                          <li key={entry.user._id} className="viewer-item">
                            <img
                              src={
                                entry.user?.profilePic?.url ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                              }
                              alt={entry.user?.username}
                              className="viewer-avatar"
                            />
                            <div className="viewer-details">
                              <span className="viewer-name">{entry.user.username}</span>
                              {entry.viewedAt && (
                                <span className="viewer-time">
                                  {format(entry.viewedAt)}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                    ) : (
                      <li className="no-viewers">No views yet.</li>
                    )}
                  </ul>
                </div>
              )}

            </div>


          </div>
        </div>
      )}
    </>
  );
};

export default StoryList;