import { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Home.css";
import StoryList from "../components/StoryList";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { useNavigate, Link } from "react-router-dom";
import { handleError } from '../utils/errorHandler';
import { toast } from 'react-toastify';
import SidebarNavbar from "../components/SidebarNavbar";
import "../assets/css/StoryList.css";



import StoryViewer from "../components/StoryViewer"


const isVideo = (url) => url?.match(/\.(mp4|webm|ogg)$/i);

const Home = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [posts, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  const currentUser = user || updateUser;
  const currentUserId = currentUser?._id || currentUser?.id;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();


  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionOpenedBefore, setSuggestionOpenedBefore] = useState(false);

  const isMobile = window.innerWidth < 768;
  const isNewUser = user?.followers?.length === 0 && user?.following?.length === 0;

  const storyUserIds = stories.map(story => story.user._id);

  // console.log("storyUserIds", storyUserIds);



  // story list 
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


  const isSeen = stories.every((s) =>
    s.seenBy.some((entry) => {
      const seenUserId = typeof entry.user === 'string' ? entry.user : entry.user?._id;
      return seenUserId === currentUserId;
    })
  );


  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/suggestions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuggestions(res.data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };

    fetchSuggestions();
  }, []);
  





  // const getUnseenCountForChat = (chatId) => {
  //   const chat = unseenCounts.find(item => item._id === chatId);
  //   return chat ? chat.unseenCount : 0;
  // };



  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/follow/${userId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (err) {
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/follow/${userId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, isFollowing: false } : user
        )
      );
    } catch (err) {
      toast.error("Failed to unfollow user");
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPostData();
    fetchStories();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (nearBottom) {
        fetchPostData();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore]);

  const fetchPostData = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await axios.get(`${backendUrl}/api/posts?page=${page}&limit=5`);
      const newPosts = res.data.posts;
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPost((prev) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem("token");
      // console.log("story token :", token);

      const res = await axios.get(`${backendUrl}/api/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStories(res.data.stories);
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    if (isMobile && isNewUser && !suggestionOpenedBefore) {
      setShowSuggestionModal(true);
      setSuggestionOpenedBefore(true);
    }
  }, [user]);


  //story viewer model 

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



  const otherUsersStories = Object.keys(storiesByUser)
    .filter((uid) => uid !== currentUserId)
    .map((uid) => ({
      user: storiesByUser[uid][0].user,
      stories: storiesByUser[uid],
    }));


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

  const hasSeenAllStoriesCurrentUser = currentUserStories.length > 0 &&
    currentUserStories.every(story =>
      story.seenBy.some(entry =>
        (typeof entry.user === 'object' ? entry.user._id : entry.user) === currentUserId
      )
    );






  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4>You must log in to continue.</h4>
      </div>
    );
  }

  return (
    <div className="vibenet-home">
      
      {isMobile && showSuggestionModal && (
        <div className="vibenet-suggestion-modal-backdrop">
          <div className="vibenet-suggestion-modal">
            <div className="d-flex">
            <h5 className="font-bold  text-[2rem]">👋 Follow minimum 5 people to get started</h5>
             <button className="vibenet-close-suggestion " onClick={() => setShowSuggestionModal(false)}>Close</button>
            </div>
            <div className="vibenet-suggestion-list-scroll">
              {(showAll ? suggestions : suggestions.slice(0, 10)).map((sugg) => (
                <div className="vibenet-suggestion-card" key={sugg._id}>
                  <Link to={`/profile/${sugg._id}`} className="vibenet-suggestion-link">
                    <img
                      src={
                        sugg.profilePic?.url ||
                        "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                      }
                      alt={sugg.username}
                      className="vibenet-suggestion-avatar"
                    />
                    <div className="vibenet-suggestion-info">
                      <span className="vibenet-suggestion-username">{sugg.username}</span>
                    </div>
                  </Link>
                  <button
                    className={`vibenet-follow-btn ${sugg.isFollowing ? "vibenet-following" : ""}`}
                    onClick={() =>
                      sugg.isFollowing
                        ? handleUnfollow(sugg._id)
                        : handleFollow(sugg._id)
                    }
                  >
                    {sugg.isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              ))}
            </div>
           
          </div>


        </div>

      )}

      <StoryViewer
        currentStory={currentStory}
        currentStoryIndex={currentStoryIndex}
        currentStoriesInModal={currentStoriesInModal}
        closeStory={closeStory}
        goNext={goNext}
        goPrev={goPrev}
        handleOverlayClick={handleOverlayClick}
        togglePause={togglePause}
        isPlaying={isPlaying}
        videoRef={videoRef}
        handleVideoTimeUpdate={handleVideoTimeUpdate}
        likedMap={likedMap}
        toggleLike={toggleLike}
        handleStoryShare={handleStoryShare}
        currentUserId={currentUserId}
        handleViews={handleViews}
        showViewers={showViewers}
        setShowViewers={setShowViewers}
      />

      <div className="vibenet-main">
        <div className="vibenet-feed">
          <div className="vibenet-stories">
            <StoryList stories={stories} hasSeenAllStoriesCurrentUser={hasSeenAllStoriesCurrentUser} currentUserStories={currentUserStories} currentUser={currentUser} otherUsersStories={otherUsersStories} currentUserId={currentUserId} isVideo={isVideo} openStory={openStory}
            isSeen={isSeen} />
          </div>

          {isMobile && !showSuggestionModal && (
            <button
              className="vibenet-show-suggestions-btn bg-slate-200"
              onClick={() => setShowSuggestionModal(true)}
            >
              Suggestions For You
            </button>
          )}

          <div className="vibenet-posts">
            {loading ? (
              <div className="vibenet-spinner">
                <Spinner />
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post,index) => (
                  <PostCard key={post._id} post={post} storyUserIds={storyUserIds} openStory={openStory}   isSeen={isSeen} />
                ))}
                {loadingMore && (
                  <div className="text-center my-3">
                    <Spinner />
                  </div>
                )}
              </>
            ) : (
              <div className="vibenet-no-posts">No posts available</div>
            )}
          </div>
        </div>

        <div className="vibenet-sidebar">
          <div className="vibenet-user-card">

            <img
              src={
                user?.profilePic?.url ||
                "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
              }
              alt={user.username}
              className="vibenet-user-avatar rounded-circle"
              onClick={(e) => {
                if (storyUserIds.includes(user._id)) {
                  e.preventDefault();
                  openStory(user._id);
                }
              }}
            />


            <div className="vibenet-user-info">
              <Link to={`/profile/${user._id}`} className="vibenet-username">
                {user.username}

              </Link>
              <span className="vibenet-name">{user.name}</span>
            </div>
          </div>


          <div className="vibenet-suggestions">
            <div className="vibenet-suggestions-header">
              <span>Suggestions For You</span>
              {suggestions.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="vibenet-show-all"
                >
                  {showAll ? "See Less" : "See All"}
                </button>
              )}
            </div>

            {suggestions.length === 0 ? (
              <p className="vibenet-no-suggestions">No suggestions found</p>
            ) : (
              <>
                {(showAll ? suggestions : suggestions.slice(0, 5)).map((sugg) => (
                  <div className="vibenet-suggestion-card" key={sugg._id}>
                    <Link to={`/profile/${sugg._id}`} className="vibenet-suggestion-link">
                      <img
                        src={
                          sugg.profilePic?.url ||
                          "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                        }
                        alt={sugg.username}
                        className="vibenet-suggestion-avatar"
                      />
                      <div className="vibenet-suggestion-info">
                        <span className="vibenet-suggestion-username">{sugg.username}</span>
                        <span className="vibenet-suggestion-mutual">
                          {sugg.mutualUsernames?.length > 0
                            ? `Followed by ${sugg.mutualUsernames[0]}${sugg.mutualUsernames.length > 1 ? ` + ${sugg.mutualUsernames.length - 1} more` : ''}`
                            : 'New to vibenet'}
                        </span>
                      </div>
                    </Link>
                    <button
                      className={`vibenet-follow-btn ${sugg.isFollowing ? "vibenet-following" : ""}`}
                      onClick={() =>
                        sugg.isFollowing
                          ? handleUnfollow(sugg._id)
                          : handleFollow(sugg._id)
                      }
                    >
                      {sugg.isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="vibenet-footer">
            <div className="vibenet-footer-links">
              <a href="#">About</a>
              <a href="#">Help</a>
              <a href="#">Press</a>
              <a href="#">API</a>
              <a href="#">Jobs</a>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Locations</a>
              <a href="#">Language</a>
            </div>
            <div className="vibenet-copyright">
              © {new Date().getFullYear()} VibeNet CLONE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
