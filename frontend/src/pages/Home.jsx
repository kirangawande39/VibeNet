import { useState, useContext, useEffect } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Home.css";
import StoryList from "../components/StoryList";
import { AuthContext } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [posts, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchPostData = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/posts`);
      setPost(res.data.posts);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/stories`);
      setStories(res.data.stories);
    } catch (err) {
      console.error("Failed to fetch stories:", err);
    }
  };

  useEffect(() => {
    fetchPostData();
    fetchStories();
  }, []);

  return (
    <div className="instagram-container">
      {/* Stories */}
      <div className="stories-wrapper">
        <StoryList stories={stories} />
      </div>

      {/* Posts - No margin between them */}
      <div className="posts-feed">
        {loading ? (
          <div className="spinner-container">
            <Spinner />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <div className="no-posts">No posts available</div>
        )}
      </div>

     
     
    </div>
  );
};

export default Home;