import { useState, useContext, useEffect } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Home.css"
import StoryList from "../components/StoryList";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { BsRewind } from "react-icons/bs";
const Home = () => {

  const { user } = useContext(AuthContext);

  const [posts, setPost] = useState([])

  const fetchPostData = async () => {
    
    try {
      const res = await axios.get(`http://localhost:5000/api/posts`);
      // console.log('res :' + res.data.posts);
      // console.log(res.data.posts);
      setPost(res.data.posts);
    } catch (err) {
      // alert(res.data.message);
      console.error("Failed to fetch profile data:", err);
    }
  }

  useEffect(()=>{
     fetchPostData();
  },[])



  return (
    <div className="container mt-4">
      <StoryList />
      {/* <button onClick={fetchPostData}>Thsi is post page</button> */}
      <div className="row justify-content-center">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id} className="col-md-6 mb-4">
              <PostCard post={post} />
            </div>
          ))
        ) : (
          <p className="text-center">No posts available</p>
        )}
      </div>
    </div>
  );
};

export default Home;
