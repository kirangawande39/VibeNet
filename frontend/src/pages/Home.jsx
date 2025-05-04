import { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "../components/PostCard";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Home.css"
import StoryList from "../components/StoryList";
const Home = () => {
  const [posts, setPosts] = useState([
    {
      _id: "5",
      username: "rohit_sharma_fan",
      image: "https://i.pinimg.com/originals/50/49/db/5049dbe455cefac341ea3d5dfad22746.jpg", // Aap yahan Rohit Sharma ki image ka link daal sakte hain
      caption: "Hitman at his best! 💥🏏",
      likes: 500,
      comments: 50,
    },

    {
      _id: "3",
      username: "virat_kohli_fan",
      image: "https://th.bing.com/th/id/OIP.wUspZqd75qvmLbXUMUWEEAHaEK?rs=1&pid=ImgDetMain", // Aap yahan Virat Kohli ki image ka link daal sakte hain
      caption: "King Kohli for a reason! 👑🏏",
      likes: 600,
      comments: 60,
    },


    {
      _id: "4",
      username: "ms_dhoni_fan",
      image: "https://i.pinimg.com/736x/00/70/d3/0070d396f4690552418f7959164acd28.jpg", // Aap yahan MS Dhoni ki image ka link daal sakte hain
      caption: "Captain Cool! �🏏",
      likes: 550,
      comments: 55,
    },

  ]);

  // useEffect(() => {
  //   axios
  //     .get("http://localhost:5000/api/posts")
  //     .then((res) => {
  //       if (res.data.length > 0) {
  //         setPosts(res.data);
  //       } // Agar backend data mile to overwrite karein
  //     })
  //     .catch((err) => console.error("API Error:", err));
  // }, []);

  return (
    <div className="container mt-4">
      <StoryList />

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
