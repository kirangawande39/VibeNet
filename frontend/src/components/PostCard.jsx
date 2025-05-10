import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import { AiFillLike } from "react-icons/ai";
import { LiaCommentSolid } from "react-icons/lia";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "../assets/css/PostCard.css"
dayjs.extend(relativeTime);

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false); // whether the user liked
  // total like count
  const { user } = useContext(AuthContext);  // Accessing user from context
  const [totalLikes, setTotalLikes] = useState(post.likes.length)
  const token = user?.token || localStorage.getItem("token"); // Use token from context or localStorage

  const handleLikeAndUnlike = () => {
    if (liked) {
      handleUnlike();
    } else {
      handleLike();
    }
    setLiked(!liked);
  };


  const handleLike = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );

      setTotalLikes(res.data.totalLikes)
      // alert(res.data.message)
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleUnlike = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${post._id}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        }
      );
      setTotalLikes(res.data.totalLikes)
      // alert(res.data.message)
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  return (
    <div className="card shadow-sm my-3">
      {/* Post Header */}
      <div className="card-header d-flex align-items-center bg-white">
        <img
          src={post.user.profilePic}
          alt="profile"
          className="rounded-circle me-2"
          width="40"
          height="40"
        />
        <strong>{post.user.username || "Unknown"}</strong>
      </div>

      {/* Post Image */}
      <img src={post.image} alt="post" className="card-img-top" />

      {/* Post Body */}
      <div className="card-body">
        <div className="like-comments" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 className={liked ? 'like' : 'unlike'} onClick={handleLikeAndUnlike}><AiFillLike /></h3>
          <h3><LiaCommentSolid /></h3>
        </div>
        <br />
        <div className="d-flex justify-content-between text-muted">
          <span>❤️ {totalLikes || 0} Likes</span>
          <span>💬 {post.comments?.length || 0} Comments</span>
          {/* <span>TotalLikes : {totalLikes} </span> */}
        </div>
        {/* <span>{token ? 'Token: ' + token : 'No Token'}</span> Token display */}
        <p className="mb-1">
          <strong>{post.user.username || "Unknown"}</strong> {post.text || "Default caption for testing."}
        </p>
        <span>{dayjs(post.createdAt).fromNow()}</span>
        <br />

        {/* {liked ? 'Unlike' : 'Like'} */}
        {/* <p>Like Count: {likeCount}</p> */}
      </div>
    </div>
  );
};

export default PostCard;
