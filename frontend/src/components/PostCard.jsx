import "bootstrap/dist/css/bootstrap.min.css";
import CommentBox from "./CommentBox"; // ✅ Import CommentBox component
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AiFillLike } from "react-icons/ai";
dayjs.extend(relativeTime);
import { LiaCommentSolid } from "react-icons/lia";
import { useState } from "react";


const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false); // whether the user liked
  const [likeCount, setLikeCount] = useState(0); // total like count

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1); // user is unliking
    } else {
      setLikeCount(prev => prev + 1); // user is liking
    }
    setLiked(!liked); // toggle like state
  };

  const handleComments = () => {
    alert("like this button ")
  }




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
          <button onClick={handleLike}><AiFillLike /></button>
          <button onClick={handleComments}><LiaCommentSolid /></button>
        </div>
        <br />
        <div className="d-flex justify-content-between text-muted">
          <span>❤️ {post.likes || 0} Likes</span>
          <span>💬 {post.comments?.length || 0} Comments</span>
        </div>
        <p className="mb-1">
          <strong>{post.user.username || "Unknown"}</strong> {post.text || "Default caption for testing."}
        </p>
        <span>{dayjs(post.createdAt).fromNow()}</span>
        <br/>

        {liked ? 'Unlike' : 'Like'}
        <p>Like Count:{likeCount}</p>
        
      </div>

      {/* ✅ Comment Box Added Here */}
      {/* <CommentBox postId={post._id || "12345"} /> */}
    </div>
  );
};

export default PostCard;
