import React, { useState, useRef, useEffect, useContext } from "react";
import "../assets/css/StoryList.css";
import { FaArrowLeft, FaArrowRight, FaHeart, FaShare, FaPlus, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i);

const StoryList = ({ stories }) => {
  const { user: currentUser } = useContext(AuthContext);
  const currentUserId = currentUser?._id;

  const { user } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");

  const [index, setIndex] = useState(null);
  const [progress, setProgress] = useState(0);

  const [seenStories, setSeenStories] = useState(new Set());

  const videoRef = useRef(null);
  const seenSet = useRef(new Set());

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

  const openStory = (userId, storyIndex = 0) => {
    setIndex({ userId, storyIndex });
    setProgress(0);
  };

  const closeStory = () => {
    setIndex(null);
    setProgress(0);
  };


  const uniqueViewers = new Set();

  stories.forEach(story => {
    if (story.seenBy) {
      story.seenBy.forEach(userId => uniqueViewers.add(userId));
    }
  });

  const uniqueViewsCount = uniqueViewers.size;



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


  useEffect(() => {
    console.log("Current Story ID:", currentStory?._id);
    console.log("Seen Set:", [...seenSet.current]);

    if (!currentStory || seenSet.current.has(currentStory._id)) return;

    seenSet.current.add(currentStory._id);



    // markAsSeen function me update karein
    const markAsSeen = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.put(
          `${backendUrl}/api/stories/${currentStory._id}/seen`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 200) {
          setSeenStories(prev => new Set(prev).add(currentStory._id));
        }
      } catch (err) {
        console.error("Error marking story as seen:", err);
      }
    };


    markAsSeen();
  }, [currentStory]);


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
                    "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg"
                  }
                  alt="Your Story"
                />
              )}
            </div>

          </div>
          <p className="story-username">Your Story</p>
          <div className="story-add-icon"><FaPlus /></div>
        </div>

        {/* Other Users */}
        {otherUsersStories.map(({ user, stories }) => {
          const isSeen = stories.every((s) => s.seenBy?.includes(currentUserId));
          return (
            <div key={user._id} className="story-item" onClick={() => openStory(user._id, 0)}>
              <div className="story-circle">
                <div className={`story-gradient-border ${isSeen ? "seen" : ""}`}>
                  {isVideo(stories[0].mediaUrl) ? (
                    <video className="story-preview" src={stories[0].mediaUrl} muted loop preload="metadata" />
                  ) : (
                    <img className="story-preview" src={stories[0].mediaUrl} alt={user.username} />
                  )}
                </div>
              </div>
              <p className="story-username">{user.username}</p>
              <p className="story-username">{uniqueViewsCount} views</p>


            </div>
          );
        })}

      </div>

      {/* Modal */}
      {currentStory && (
        <div className="story-modal-overlay" onClick={handleOverlayClick}>
          <div className="story-modal">
            <div className="story-progress-container">
              <div className="story-progress-bar" style={{ width: `${progress}%` }} />
            </div>

            <div className="story-modal-content">
              <div className="userProfile">
                <img src={currentStory.user.profilePic?.url || currentStory.user.profilePic || "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg"} alt={currentStory.user.username} />
                <p>{currentStory.user.username}</p>
              </div>

              <button className="story-close-btn" onClick={closeStory}><FaTimes /></button>

              {isVideo(currentStory.mediaUrl) ? (
                <video ref={videoRef} src={currentStory.mediaUrl} className="story-modal-video" autoPlay />
              ) : (
                <img src={currentStory.mediaUrl} className="story-modal-image" alt="story" />
              )}

              <button className="story-nav-btn prev" onClick={(e) => { e.stopPropagation(); goPrev(); }}><FaArrowLeft /></button>
              <button className="story-nav-btn next" onClick={(e) => { e.stopPropagation(); goNext(); }}><FaArrowRight /></button>

              <div className="story-actions">
                <button onClick={handleStoryLike}><FaHeart size={20} /></button>
                <button onClick={handleStoryShare}><FaShare size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryList;
