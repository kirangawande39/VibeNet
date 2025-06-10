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
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // ✅ Default dummy suggestion data
  const defaultSuggestions = [
    {
      id: "5",
      username: "rohitsharma45",
      fullName: "Rohit Sharma",
      image: "https://wallpaperaccess.com/full/13900981.jpg"
    },
    {
      id: "1",
      username: "virat.kohli",
      fullName: "Virat Kohli",
      image: "https://wallpaperaccess.com/full/2490816.jpg"
    },
    {
      id: "2",
      username: "ms.dhoni",
      fullName: "MS Dhoni",
      image: "https://i.pinimg.com/736x/2c/85/f3/2c85f3cd66f8d3d7fcb93e6da8eee08c.jpg"
    },
    {
      id: "3",
      username: "arijitsingh",
      fullName: "Arijit Singh",
      image: "https://res.cloudinary.com/dwzmsvp7f/image/upload/f_auto/c_crop%2Cg_custom/v1728462701/yiwwlrbe78ahhohjjmum.jpg"
    },
    {
      id: "4",
      username: "nehamusic",
      fullName: "Neha Kakkar",
      image: "https://images.indianexpress.com/2023/02/neha-kakkar.jpg"
    },

  ];


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchPostData();
    fetchStories();
  }, [user]);

  const fetchPostData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/posts`);
      setPost(res.data.posts);
      setLoading(false);
    } catch (err) {
      handleError(err);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/stories`);
      setStories(res.data.stories);
    } catch (err) {
      handleError(err);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4>You must log in to continue.</h4>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <SidebarNavbar />

      <div className="feed-section">
        {/* Stories */}
        <div className="stories-wrapper">
          <StoryList stories={stories} />
        </div>

        {/* Posts */}
        <div className="posts-feed">
          {loading ? (
            <div className="spinner-container">
              <Spinner />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <div className="no-posts">No posts available</div>
          )}
        </div>
      </div>

      <div className="suggestion-panel">
        <h5 className="text-muted mb-3">Suggestions for you</h5>
        {defaultSuggestions.map((sugg) => (
          <Link to={``} className="suggestion-card" key={sugg.id}>
            <img src={sugg.image} alt={sugg.username} className="suggestion-avatar" />
            <div className="suggestion-info">
              <strong>{sugg.username}</strong>
              <small className="text-muted">{sugg.fullName}</small>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default Home;
