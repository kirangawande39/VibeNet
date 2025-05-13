import React, { useState, useRef, useEffect } from "react";
import "../assets/css/StoryList.css";
import { FaArrowLeft, FaArrowRight, FaTimes, FaHeart, FaShare } from "react-icons/fa";

const StoryList = ({ stories }) => {
  const [index, setIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const currentStory = index !== null ? stories[index] : null;

  const openStory = (i) => {
    setIndex(i);
    setProgress(0);
  };

  const closeStory = () => setIndex(null);

  const goNext = () => (index < stories.length - 1 ? setIndex(index + 1) : closeStory());
  const goPrev = () => index > 0 && setIndex(index - 1);

  useEffect(() => {
    if (index === null || !videoRef.current) return;
    const video = videoRef.current;

    video.currentTime = 0;
    video.play().catch(console.error);

    const updateProgress = () =>
      setProgress((video.currentTime / video.duration) * 100);

    const onEnd = () => setTimeout(goNext, 500);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", onEnd);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", onEnd);
    };
  }, [index]);

  const handleOverlayClick = (e) => {
    const x = e.clientX, w = window.innerWidth;
    if (x < w / 3) goPrev();
    else if (x > (w / 3) * 2) goNext();
  };

  if (!stories?.length) return null;

  return (
    <>
      <div className="story-list-container">
        {stories.map((s, i) => (
          <div key={s._id} className="story-item" onClick={() => openStory(i)}>
            <div className="story-circle">
              <div className="story-gradient-border">
                <video
                  className="story-preview"
                  src={s.mediaUrl}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
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
              <video
                ref={videoRef}
                src={currentStory.mediaUrl}
                className="story-modal-video"
                autoPlay
                muted
              />

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
                    src={currentStory.user.profilePic || "/default-profile.png"}
                    alt="Profile"
                    className="story-profile-img"
                  />
                  <span className="story-modal-username">
                    {currentStory.user.username}
                  </span>
                </div>
                <div className="story-actions">
                  <button className="story-action-btn"><FaHeart /></button>
                  <button className="story-action-btn"><FaShare /></button>
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
