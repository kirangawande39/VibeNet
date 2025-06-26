import React from "react";
import { FaTimes, FaPlay, FaHeart, FaShare } from "react-icons/fa";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { IoEyeSharp } from "react-icons/io5";
import { format } from "timeago.js";

const StoryViewer = ({
  currentStory,
  currentStoryIndex,
  currentStoriesInModal = [],
  closeStory,
  goNext,
  goPrev,
  handleOverlayClick,
  togglePause,
  isPlaying,
  videoRef,
  handleVideoTimeUpdate,
  likedMap = {},
  toggleLike,
  handleStoryShare,
  currentUserId,
  handleViews,
  showViewers,
  setShowViewers,
}) => {
  if (!currentStory || !currentStory.user) return null;

  const isVideo = (url) => url?.match(/\.mp4|\.webm|\.ogg$/);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1050 }}
      onClick={handleOverlayClick}
    >
      <div className="position-relative w-100 h-100">
        {/* Progress Bar */}
        <div className="position-absolute top-0 start-0 w-100 px-3 pt-2 d-flex">
          {currentStoriesInModal.map((_, i) => (
            <div key={i} className="flex-fill mx-1">
              <div className="progress bg-secondary" style={{ height: "3px" }}>
                <div
                  className={`progress-bar ${i < currentStoryIndex ? "bg-white" : ""}`}
                  role="progressbar"
                  style={{
                    width:
                      i === currentStoryIndex
                        ? `${currentStory.progress || 0}%`
                        : i < currentStoryIndex
                        ? "100%"
                        : "0%",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="position-absolute top-0 start-0 w-100 d-flex justify-content-between align-items-center px-3 py-2">
          <div className="d-flex align-items-center">
            <img
              src={currentStory.user?.profilePic?.url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt="profile"
              className="rounded-circle"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <span className="ms-2 text-white fw-semibold">{currentStory.user.username}</span>
            <span className="ms-2 text-secondary small">{format(currentStory.createdAt)}</span>
          </div>
          <button className="btn btn-sm btn-light" onClick={closeStory}><FaTimes /></button>
        </div>

        {/* Media */}
        <div className="d-flex justify-content-center align-items-center h-100" onClick={togglePause}>
          {isVideo(currentStory.mediaUrl) ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              playsInline
              muted={false}
              controls={false}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={goNext}
              className="mw-100 mh-100"
              style={{ objectFit: "contain" }}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="story"
              className="mw-100 mh-100"
              style={{ objectFit: "contain" }}
            />
          )}

          {!isPlaying && isVideo(currentStory.mediaUrl) && (
            <div className="position-absolute top-50 start-50 translate-middle" style={{ cursor: "pointer" }}>
              <FaPlay size={48} color="white" />
            </div>
          )}

          {/* Navigation */}
          <button className="position-absolute top-50 start-0 translate-middle-y btn btn-link text-white p-2" onClick={(e) => { e.stopPropagation(); goPrev(); }}>
            <GrFormPrevious size={30} />
          </button>
          <button className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-white p-2" onClick={(e) => { e.stopPropagation(); goNext(); }}>
            <GrFormNext size={30} />
          </button>
        </div>

        {/* Footer */}
        <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="d-flex align-items-center">
            <button className="btn btn-link text-white me-3 p-0" onClick={toggleLike}>
              <FaHeart size={28} color={likedMap[currentStory._id] ? "red" : "white"} />
            </button>
            <button className="btn btn-link text-white p-0" onClick={handleStoryShare}>
              <FaShare size={24} />
            </button>
          </div>
          {currentUserId === currentStory.user._id && (
            <div className="text-white" style={{ cursor: "pointer" }} onClick={handleViews}>
              {currentStory.seenBy?.length || 0} <IoEyeSharp size={20} />
            </div>
          )}
        </div>

        {/* Viewers */}
        {showViewers && (
          <div className="position-absolute top-0 end-0 p-3" style={{ width: "300px", zIndex: 1055 }}>
            <div className="bg-light rounded p-2 shadow">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Viewed by</h6>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowViewers(false)}>
                  &times;
                </button>
              </div>
              <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                {currentStory.seenBy?.length > 0 ? (
                  currentStory.seenBy
                    .slice()
                    .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                    .map((entry) => {
                      const userLiked = currentStory.likedBy?.some((l) => l.user === entry.user._id);
                      return (
                        <li key={entry.user._id} className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            <img
                              src={
                                entry.user?.profilePic?.url ||
                                entry.user?.profilePic ||
                                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                              }
                              alt={entry.user?.username}
                              className="rounded-circle me-2"
                              style={{ width: "30px", height: "30px", objectFit: "cover" }}
                            />
                            <div>
                              <div>{entry.user.username}</div>
                              {entry.viewedAt && (
                                <small className="text-muted">{format(entry.viewedAt)}</small>
                              )}
                            </div>
                          </div>
                          {userLiked && <FaHeart size={18} color="red" />}
                        </li>
                      );
                    })
                ) : (
                  <li className="text-center text-muted">No views yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;



