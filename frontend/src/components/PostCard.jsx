import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AiFillLike } from "react-icons/ai";
import { LiaCommentSolid } from "react-icons/lia";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import "../assets/css/PostCard.css";
import CommentBox from "./CommentBox";

dayjs.extend(relativeTime);

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(post.likes.length);
  const { user } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");

  const [showComment, setShowComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // Initially false or fetch from backend

  // Fetching if the user is following the post's user
  useEffect(() => {
    const followingStatus = post.user.followers.includes(user.id);
    setIsFollowing(followingStatus);
  }, [post.user.followers, user.id]);

  // Toggle like/unlike
  const handleLikeAndUnlike = async () => {
    if (liked) {
      await handleUnlike();
    } else {
      await handleLike();
    }
    setLiked(!liked); // Toggle the state
  };

  // Like a post
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${post._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTotalLikes(res.data.totalLikes);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Unlike a post
  const handleUnlike = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${post._id}/unlike`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTotalLikes(res.data.totalLikes);
    } catch (error) {
      console.error("Error unliking post:", error);
    }
  };

  // Show/Hide comment box
  const handleComment = () => {
    setShowComment(prev => !prev);
  };

  // Follow a user
  const handleFollow = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/follow/${post.user._id}/follow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(true);
      alert(res.data.message || "Followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // Unfollow a user
  const handleUnfollow = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/follow/${post.user._id}/unfollow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsFollowing(false);
      alert(res.data.message || "Unfollowed successfully!");
    } catch (error) {
      console.error("Error unfollowing user:", error);
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
        <br />
        {user.id === post.user._id ?

          " "
          :
          <div className="follow-btn">
            {isFollowing ? (
              <spam onClick={handleUnfollow}>Unfollow</spam>
            ) : (
              <spam onClick={handleFollow}>Follow</spam>
            )}
          </div>

        }

      </div>

      {/* Post Image */}
      <div style={{ height: '300px', overflow: 'hidden' }}>
        <img
          src={post.image}
          alt="post"
          className="card-img-top img-fluid"
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
        />
      </div>


      {/* Post Body */}
      <div className="card-body">
        <div className="like-comments" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 className={liked ? 'like' : 'unlike'} onClick={handleLikeAndUnlike}>
            <AiFillLike />
          </h3>
          <h3 onClick={handleComment} style={{ color: showComment ? '#007bff' : 'black' }}>
            <LiaCommentSolid />
          </h3>
        </div>
        <br />
        <div className="d-flex justify-content-between text-muted">
          <span>❤️ {totalLikes || 0} Likes</span>
          <span>💬 {post.comments?.length || 0} Comments</span>
        </div>
        <p className="mb-1">
          <strong>{post.user.username || "Unknown"}</strong> {post.text || "Default caption for testing."}
        </p>
        <span>{dayjs(post.createdAt).fromNow()}</span>
        <br />

        {/* Toggleable Comment Box */}
        {showComment && <CommentBox postId={post._id} />}
      </div>
    </div>
  );
};

export default PostCard;
