import { useState, useContext, useEffect } from "react";
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

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [posts, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionOpenedBefore, setSuggestionOpenedBefore] = useState(false);

  const isMobile = window.innerWidth < 768;
  const isNewUser = user?.followers?.length === 0 && user?.following?.length === 0;

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
      console.log("story token :", token);

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

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4>You must log in to continue.</h4>
      </div>
    );
  }

  return (
    <div className="vibenet-home">
      <SidebarNavbar />



      {isMobile && showSuggestionModal && (
        <div className="vibenet-suggestion-modal-backdrop">
          <div className="vibenet-suggestion-modal">
            <h5>👋 Follow minimum 5 people to get started</h5>
            <div className="vibenet-suggestion-list-scroll">
              {(showAll ? suggestions : suggestions.slice(0, 10)).map((sugg) => (
                <div className="vibenet-suggestion-card" key={sugg._id}>
                  <Link to={`/user/${sugg._id}`} className="vibenet-suggestion-link">
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
            <button className="vibenet-close-suggestion" onClick={() => setShowSuggestionModal(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="vibenet-main">
        <div className="vibenet-feed">
          <div className="vibenet-stories">
            <StoryList stories={stories} />
          </div>

          {isMobile && !showSuggestionModal && (
            <button
              className="vibenet-show-suggestions-btn"
              onClick={() => setShowSuggestionModal(true)}
            >
              Suggestions
            </button>
          )}

          <div className="vibenet-posts">
            {loading ? (
              <div className="vibenet-spinner">
                <Spinner />
              </div>
            ) : posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
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
            <Link to={`/profile/${user._id}`}>
              <img
                src={
                  user.profilePic?.url ||
                  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                }
                alt={user.username}
                className="vibenet-user-avatar"
              />
            </Link>
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
                    <Link to={`/user/${sugg._id}`} className="vibenet-suggestion-link">
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
              © {new Date().getFullYear()} vibenet CLONE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
