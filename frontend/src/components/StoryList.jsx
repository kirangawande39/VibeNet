import React, { useState, useRef, useEffect } from "react";
import "../assets/css/StoryList.css";
import { FaArrowLeft, FaArrowRight, FaTimes, FaHeart, FaShare } from "react-icons/fa";

const isVideo = (url) => {
  return url.match(/\.(mp4|webm|ogg)$/i);
};

const StoryList = ({ stories }) => {
  const [index, setIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const currentStory = index !== null ? stories[index] : null;

  const openStory = (i) => {
    setIndex(i);
    setProgress(0);
  };

  const closeStory = () => {
    setIndex(null);
    setProgress(0);
  };

  const goNext = () => {
    if (index < stories.length - 1) {
      setIndex(index + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
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
    if (e.target.closest(".story-modal-content")) return;
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
        {stories.map((s, i) => (
          <div key={s._id} className="story-item" onClick={() => openStory(i)}>
            <div className="story-circle">
              <div className="story-gradient-border">
                {isVideo(s.mediaUrl) ? (
                  <video className="story-preview" src={s.mediaUrl} muted loop preload="metadata" />
                ) : (
                  <img className="story-preview" src={s.mediaUrl} alt="preview" />
                )}
              </div>
            </div>
            <p className="story-username">{s.user?.username}</p>
          </div>
        ))}
      </div>

      {currentStory && (
        <div className="story-modal-overlay" onClick={handleOverlayClick}>
          <div className="story-modal">
            <div className="story-progress-container">
              <div className="story-progress-bar" style={{ width: `${progress}%` }} />
            </div>

            <div className="story-modal-content">
              {isVideo(currentStory.mediaUrl) ? (
                <video
                  ref={videoRef}
                  src={currentStory.mediaUrl}
                  className="story-modal-video"
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={currentStory.mediaUrl}
                  className="story-modal-image"
                  alt="story"
                />
              )}

              {index > 0 && (
                <button className="story-nav-btn prev-btn" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
                  <FaArrowLeft />
                </button>
              )}
              {index < stories.length - 1 && (
                <button className="story-nav-btn next-btn" onClick={(e) => { e.stopPropagation(); goNext(); }}>
                  <FaArrowRight />
                </button>
              )}
              <button className="story-close-btn" onClick={(e) => { e.stopPropagation(); closeStory(); }}>
                <FaTimes />
              </button>

              <div className="story-overlay">
                <div className="story-user-info">
                  <img
                    src={currentStory.user.profilePic || "https://img.freepik.com/premium-vector/avatar-profile-icon-flat-style-male-user-profile-vector-illustration-isolated-background-man-profile-sign-business-concept_157943-38764.jpg"}
                    alt="Profile"
                    className="story-profile-img"
                  />
                  <span className="story-modal-username">{currentStory.user.username}</span>
                </div>
                <div className="story-actions">
                  <button className="story-action-btn" onClick={handleStoryLike}><FaHeart /></button>
                  <button className="story-action-btn" onClick={handleStoryShare}><FaShare /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoryList;
