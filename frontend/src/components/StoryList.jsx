import React, { useState, useRef, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/StoryList.css"; // see below for custom CSS
import {
  FaHeart,
  FaShare,
  FaPlus,
  FaTimes,
  FaPlay,


} from "react-icons/fa";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoEyeSharp } from "react-icons/io5";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { format } from "timeago.js";

const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i);

const StoryList = ({ stories }) => {
  const { user } = useContext(AuthContext);
  const currentUser = user || updateUser;
  const currentUserId = currentUser?._id || currentUser?.id;

  const token = localStorage.getItem("token");
  console.log("Token : ", token)

  console.log("currentUserId :", currentUserId);
  console.log("User :", user.id);

  const [index, setIndex] = useState(null); // { userId, storyIndex } or null
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seenStories, setSeenStories] = useState(new Set());
  const [showViewers, setShowViewers] = useState(false);

  const [likedMap, setLikedMap] = useState({});
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const videoRef = useRef(null);
  const progressInterval = useRef(null);
  const nextTimeout = useRef(null);
  const seenSet = useRef(new Set());
  const storyListRef = useRef(null);



  useEffect(() => {
    const initialMap = {};

    stories.forEach((story) => {
      const likedByUser = story.likedBy.some(
        (entry) => entry.user === currentUserId
      );
      initialMap[story._id] = likedByUser;
    });

    setLikedMap(initialMap);
  }, [stories]);


  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    const uid = story.user._id;
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(story);
    return acc;
  }, {});

  const currentUserStories = currentUserId
    ? storiesByUser[currentUserId] || []
    : [];
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => uid !== currentUserId)
    .map((uid) => ({
      user: storiesByUser[uid][0].user,
      stories: storiesByUser[uid],
    }));

  //  // Calculate unique viewers overall
  // const uniqueViewers = new Set();

  // stories.forEach((story) => {
  //   if (Array.isArray(story.seenBy)) {
  //     story.seenBy.forEach((entry) => {
  //       let userId;

  //       if (entry?.user?._id) {
  //         userId = entry.user._id;
  //       } else if (entry?.user) {
  //         userId = entry.user;
  //       } else if (typeof entry === "string") {
  //         userId = entry;
  //       }

  //       if (userId) {
  //         uniqueViewers.add(userId.toString());
  //       }
  //     });
  //   }
  // });

  // const uniqueViewsCount = uniqueViewers.size;
  // console.log("✅ Total Unique Viewers:", uniqueViewsCount);


  const openStory = (userId, storyIndex = 0) => {
    clearInterval(progressInterval.current);
    clearTimeout(nextTimeout.current);

    setIndex({ userId, storyIndex });
    setProgress(0);
    setIsPlaying(true);
    setShowViewers(false);
    setIsUserInteracting(false);
  };

  const closeStory = (e) => {
    if (e) e.stopPropagation();
    setIndex(null);
    setProgress(0);
    setIsPlaying(false);
    clearInterval(progressInterval.current);
    clearTimeout(nextTimeout.current);
    setIsUserInteracting(false);
  };

  const togglePause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };


  const currentUserIdInModal = index?.userId;
  const currentStoryIndex = index?.storyIndex || 0;
  const currentStoriesInModal = currentUserIdInModal
    ? storiesByUser[currentUserIdInModal] || []
    : [];
  const currentStory = currentStoriesInModal
    ? currentStoriesInModal[currentStoryIndex]
    : null;

  const goNext = () => {
    if (!index || isUserInteracting) return;
    if (!currentStoriesInModal) return;

    if (currentStoryIndex < currentStoriesInModal.length - 1) {
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex + 1 });
      setProgress(0);
      setIsPlaying(true);
    } else {
      const userIds = Object.keys(storiesByUser);
      const currentUserPos = userIds.indexOf(currentUserIdInModal);
      if (currentUserPos < userIds.length - 1) {
        const nextUserId = userIds[currentUserPos + 1];
        setIndex({ userId: nextUserId, storyIndex: 0 });
        setProgress(0);
        setIsPlaying(true);
      } else {
        closeStory();
      }
    }
  };

  const goPrev = () => {
    if (!index) return;
    if (!currentStoriesInModal) return;

    if (currentStoryIndex > 0) {
      setIndex({ userId: currentUserIdInModal, storyIndex: currentStoryIndex - 1 });
      setProgress(0);
      setIsPlaying(true);
    } else {
      const userIds = Object.keys(storiesByUser);
      const currentUserPos = userIds.indexOf(currentUserIdInModal);
      if (currentUserPos > 0) {
        const prevUserId = userIds[currentUserPos - 1];
        const prevUserStories = storiesByUser[prevUserId];
        setIndex({
          userId: prevUserId,
          storyIndex: prevUserStories.length - 1,
        });
        setProgress(0);
        setIsPlaying(true);
      }
    }
  };




  useEffect(() => {
    if (!currentStory || seenSet.current.has(currentStory._id)) return;
    seenSet.current.add(currentStory._id);

    const markAsSeen = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;
        await axios.put(
          `${backendUrl}/api/stories/${currentStory._id}/seen`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSeenStories((prev) => new Set(prev).add(currentStory._id));
      } catch (err) {
        console.error("Error marking story as seen:", err);
      }
    };
    markAsSeen();
  }, [currentStory]);

  const handleVideoTimeUpdate = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video && video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  useEffect(() => {
    if (!index || !isVideo(currentStory?.mediaUrl)) return;
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(console.error);

    const onEnded = () => {
      goNext();
    };

    video.addEventListener("timeupdate", handleVideoTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", handleVideoTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [index, currentStory, isUserInteracting]);

  useEffect(() => {
    if (!index || isVideo(currentStory?.mediaUrl)) return;

    clearInterval(progressInterval.current);
    clearTimeout(nextTimeout.current);
    setProgress(0);

    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            nextTimeout.current = setTimeout(() => {
              goNext();
            }, 300);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }

    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(nextTimeout.current);
    };
  }, [index, currentStory, isPlaying, isUserInteracting]);

  const handleOverlayClick = (e) => {
    if (e.target.closest(".modal-content")) return;
    const x = e.clientX;
    const w = window.innerWidth;
    if (x < w / 3) goPrev();
    else if (x > (w / 3) * 2) goNext();
  };

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!currentStory) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsUserInteracting(true);
    setTimeout(() => setIsUserInteracting(false), 1000);

    try {
      if (likedMap[currentStory._id]) {
        await axios.put(
          `${backendUrl}/api/stories/${currentStory._id}/unlike`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedMap((prev) => ({ ...prev, [currentStory._id]: false }));
      } else {
        await axios.put(
          `${backendUrl}/api/stories/${currentStory._id}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLikedMap((prev) => ({ ...prev, [currentStory._id]: true }));
      }
    } catch (error) {
      console.error("Error liking/unliking story:", error);
    }
  };

  const handleStoryShare = (e) => {
    e.stopPropagation();
    setIsUserInteracting(true);
    setTimeout(() => setIsUserInteracting(false), 800);

    if (navigator.share) {
      navigator
        .share({
          title: "Check out this story",
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      alert("Story shared!");
    }
  };

  const handleViews = (e) => {
    e.stopPropagation();
    setShowViewers(true);
    setIsUserInteracting(true);
    setTimeout(() => setIsUserInteracting(false), 800);
  };

  if (!stories?.length) return null;

  return (
    <>
      {/* Story Thumbnails */}
      <div className="container mt-3">
        <div className="d-flex overflow-auto pb-2">
          {/* Your Story Bubble */}
          <div
            className="text-center position-relative me-3 flex-shrink-0"
            onClick={() => openStory(currentUserId, 0)}
            style={{ cursor: "pointer", minWidth: "80px", maxWidth: "90px" }}
          >
            <div
              className={`rounded-circle border border-2 ${currentUserStories?.length > 0 &&
                currentUserStories.every((s) => seenStories.has(s._id))
                ? "border-secondary"
                : "border-primary"
                }`}
              style={{
                width: "70px",
                height: "70px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {currentUserStories?.length > 0 ? (
                isVideo(currentUserStories[0].mediaUrl) ? (
                  <video
                    className="w-100 h-100 object-fit-cover"
                    src={currentUserStories[0].mediaUrl}
                    muted
                    loop
                    preload="metadata"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <img
                    className="w-100 h-100 object-fit-cover"
                    src={currentUserStories[0].mediaUrl}
                    alt="Your Story"
                    style={{ objectFit: "cover" }}
                  />
                )
              ) : (
                <img
                  className="w-100 h-100 object-fit-cover"
                  src={
                    currentUser.profilePic?.url ||
                    currentUser?.profilePic ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="Your Story"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
            <small className="d-block mt-1 text-truncate" style={{ maxWidth: "90px" }}>
              Your Story
            </small>
            {currentUserStories.length === 0 && (
              <div
                className="position-absolute bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "20px",
                  height: "20px",
                  bottom: "0",
                  right: "15px",
                  fontSize: "14px",
                }}
              >
                <FaPlus size={12} />
              </div>
            )}
          </div>

          {/* Other Users' Stories */}
          {otherUsersStories.map(({ user, stories }) => {
            const isSeen = stories.every((s) =>
              s.seenBy?.includes(currentUserId)
            );
            return (
              <div
                key={user._id}
                className="text-center position-relative me-3 flex-shrink-0"
                onClick={() => openStory(user._id, 0)}
                style={{ cursor: "pointer", minWidth: "80px", maxWidth: "90px" }}
              >
                <div
                  className={`rounded-circle border border-2 ${isSeen ? "border-secondary" : "border-primary"
                    }`}
                  style={{
                    width: "70px",
                    height: "70px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {isVideo(stories[0].mediaUrl) ? (
                    <video
                      className="w-100 h-100 object-fit-cover"
                      src={stories[0].mediaUrl}
                      muted
                      loop
                      preload="metadata"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={stories[0].mediaUrl}
                      alt={user.username}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <small className="d-block mt-1 text-truncate" style={{ maxWidth: "90px" }}>
                  {user.username}
                </small>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Modal */}
      {currentStory && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          onClick={handleOverlayClick}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-dark border-0">
              {/* Progress Bars */}
              <div className="d-flex px-3 pt-3">
                {currentStoriesInModal?.map((_, i) => (
                  <div key={i} className="flex-fill mx-1">
                    <div className="progress bg-secondary" style={{ height: "4px" }}>
                      <div
                        className={`progress-bar ${i < currentStoryIndex ? "bg-white" : ""}`}
                        role="progressbar"
                        style={{
                          width:
                            i === currentStoryIndex
                              ? `${progress}%`
                              : i < currentStoryIndex
                                ? "100%"
                                : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-body p-0 position-relative">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center p-2">
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        currentStory.user.profilePic?.url ||
                        currentStory.user.profilePic ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                      }
                      alt={currentStory.user.username}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <span className="ms-2 text-white fw-semibold">
                      {currentStory.user.username}
                    </span>
                    <span className="ms-2 text-secondary small">
                      {format(currentStory.createdAt)}
                    </span>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={closeStory}
                    aria-label="Close Story Modal"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Story Media */}
                <div
                  className="fullscreen-story position-relative"
                  onClick={togglePause}
                  style={{ maxHeight: "70vh", overflow: "hidden" }}
                >
                  {isVideo(currentStory.mediaUrl) ? (
                    <video
                      ref={videoRef}
                      src={currentStory.mediaUrl}
                      playsInline
                      muted={false}
                      controls={false}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onEnded={goNext}
                      style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}
                    />
                  ) : (
                    <img
                      src={currentStory.mediaUrl}
                      alt="story"
                      style={{ width: "100%", height: "auto", maxHeight: "70vh", objectFit: "contain" }}
                    />
                  )}

                  {/* Play Icon when paused */}
                  {isVideo(currentStory.mediaUrl) && !isPlaying && (
                    <div
                      className="position-absolute top-50 start-50 translate-middle"
                      style={{ cursor: "pointer" }}
                      onClick={togglePause}   // click pe play karega
                    >
                      <FaPlay size={48} color="white" />
                    </div>
                  )}


                  {/* Navigation Buttons */}
                  <button
                    className="position-absolute top-50 start-0 translate-middle-y btn btn-link text-white p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    aria-label="Previous Story"
                  >
                    <GrFormPrevious size={30} />
                  </button>
                  <button
                    className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-white p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    aria-label="Next Story"
                  >
                    <GrFormNext size={30} />
                  </button>
                </div>

                {/* Footer Actions */}
                <div
                  className="d-flex justify-content-between align-items-center px-3 py-2 border-top"
                  style={{ backgroundColor: "#1c1c1c" }}
                >
                  {/* Like & Share */}
                  <div className="d-flex align-items-center">
                    {/* Like Button */}
                    <button
                      className="btn btn-link text-white me-3 p-0 d-flex align-items-center"
                      type="button"
                      onClick={toggleLike}
                    >
                      <FaHeart
                        size={28}
                        color={likedMap?.[currentStory?._id] ? "red" : "white"}
                        className="me-1"
                      />
                      {/* <span>{likedMap?.[currentStory?._id] ? "Liked" : "Like"}</span> */}
                    </button>

                    {/* Share Button */}
                    <button
                      className="btn btn-link text-white p-0 d-flex align-items-center"
                      type="button"
                      onClick={handleStoryShare}
                    >
                      <FaShare re size={24} className="me-1" />

                    </button>
                  </div>

                  {/* View Count (Only for Owner) */}
                  {currentUserId === currentStory?.user?._id && (
                    <div
                      className="d-flex align-items-center text-white"
                      style={{ cursor: "pointer" }}
                      onClick={handleViews}
                    >
                      <span className="me-1">{currentStory?.seenBy?.length || 0}</span>
                      <IoEyeSharp size={20} />
                    </div>
                  )}
                </div>

                {/* Viewers Modal */}
                {showViewers && (
                  <div
                    className="position-absolute top-0 end-0 p-3"
                    style={{ width: "300px", zIndex: 1055 }}
                  >
                    <div className="bg-light rounded p-2 shadow">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Viewed by</h6>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowViewers(false)}
                          aria-label="Close viewers list"
                        >
                          &times;
                        </button>
                      </div>
                      <ul className="list-unstyled mb-0" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {currentStory?.seenBy?.length > 0 ? (
                          currentStory.seenBy
                            .slice()
                            .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
                            .map((entry) => {
                              // Check if this user is in likedBy list by comparing user ids
                              const userLiked = currentStory.likedBy?.some(
                                (likedEntry) => likedEntry.user === entry.user._id
                              );

                              return (
                                <li
                                  key={entry.user._id}
                                  className="d-flex align-items-center justify-content-between mb-2"
                                >
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

                                  {/* Show red heart if user liked the story */}
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
          </div>
        </div>
      )}
    </>

  );
};

export default StoryList;
