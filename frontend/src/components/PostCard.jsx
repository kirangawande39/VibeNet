import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { AiFillLike } from "react-icons/ai";
import { LiaCommentSolid } from "react-icons/lia";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../assets/css/PostCard.css";
import CommentBox from "./CommentBox";
import { handleError } from '../utils/errorHandler';
dayjs.extend(relativeTime);
import { Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-toastify";

const PostCard = ({ post, storyUserIds, openStory }) => {
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(post.likes.length);
  const { user } = useContext(AuthContext);

  const [showComment, setShowComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Flying hearts state
  const [flyingLikes, setFlyingLikes] = useState([]);
  const likeSoundRef = useRef(null);
  useEffect(() => {
    const followingStatus = post.user.followers.includes(user?.id);
    setIsFollowing(followingStatus);
  }, [post.user?.followers]);

  // Remove flying hearts after animation
  useEffect(() => {
    if (flyingLikes.length === 0) return;
    const timer = setTimeout(() => {
      setFlyingLikes([]);
    }, 2000); // animation duration
    return () => clearTimeout(timer);
  }, [flyingLikes]);

  const triggerFlyingHearts = () => {
    // Add multiple hearts at random horizontal positions
    const hearts = Array.from({ length: 5 }).map(() => ({
      id: Math.random().toString(36).substr(2, 9),
      left: Math.random() * 80 + 10, // 10% to 90% left
    }));
    setFlyingLikes(hearts);
  };

  const handleLikeAndUnlike = async () => {
    if (liked) {
      await handleUnlike();
    } else {
      await handleLike();

      // Play like sound
      if (likeSoundRef.current) {
        likeSoundRef.current.currentTime = 0;
        likeSoundRef.current.play();
      }

      triggerFlyingHearts();
    }
    setLiked(!liked);
  };

  const handleLike = async () => {
    try {
      const res = await API.post(
        `/api/likes/${post._id}/like`,
        {},
      );
      setTotalLikes(res.data.totalLikes);
    } catch (err) {
      console.error("failed post like", err);

    }
  };

  const handleUnlike = async () => {
    try {
      const res = await API.post(
        `/api/likes/${post._id}/unlike`,
        {},

      );
      setTotalLikes(res.data.totalLikes);
    } catch (err) {
      console.error("failed post unLike", err);
    }
  };

  const handleComment = () => {
    setShowComment((prev) => !prev);
  };

  const handleFollow = async () => {
    try {
      const res = await API.post(
        `/api/follow/${post.user._id}/follow`,
        {},
      );
      setIsFollowing(true);
      toast.success(res.data.message || "Followed successfully!");
    } catch (err) {
      handleError(err);
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await API.post(
        `/api/follow/${post.user._id}/unfollow`,
        {},

      );
      setIsFollowing(false);
      toast.success(res.data.message || "Unfollowed successfully!");
    } catch (err) {
      handleError(err);
    }
  };


  return (
    <div className="mt-3 ">

      {/* Audio element for like sound */}
      <audio
        ref={likeSoundRef}
        src="https://actions.google.com/sounds/v1/cartoon/pop.ogg"
        preload="auto"
      />




      {/* Post Header */}
      <div className="card-header d-flex align-items-center">
        <img
          src={post.user?.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
          className={`rounded-circle me-2 ${storyUserIds.includes(post?.user?._id) ? "border border-danger border-2" : ""}`}
          width="40"
          height="40"
          style={{ objectFit: "cover", cursor: "pointer" }}
          onClick={() => {
            if (storyUserIds.includes(post.user._id)) {
              openStory(post.user._id); // call Home.jsx function
            }
          }}
        />


        <Link
          to={`/profile/${post?.user?._id}`}
          className="text-decoration-none text-dark fw-bold"
        >
          <strong>{post.user?.username || "Unknown"}</strong>
        </Link>

          {flyingLikes.map((heart) => (
        <div
          key={heart.id}
          className="flying-like"
          style={{ left: `${heart.left}%` }}
        >
          ❤️
        </div>
      ))}



        <br />
        {user?.id === post.user?._id ? (
          " "
        ) : (
          <div className="follow-btn">
            {isFollowing ? (
              <span onClick={handleUnfollow}>Unfollow</span>
            ) : (
              <span onClick={handleFollow}>Follow</span>
            )}
          </div>
        )}
      </div>
      {/* Post Image */}

     

      <div className="w-full h-[300px]  flex items-center justify-center overflow-hidden rounded-lg">
        <img
          src={post.image}
          alt="post"
          className="max-w-full max-h-full object-contain rounded-2xl"
        />
      </div>



      {/* Post Body */}

      <div className="card-body">
        <div
          className="like-comments"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h3 className={liked ? "like" : "unlike"} onClick={handleLikeAndUnlike}>
            <AiFillLike />
          </h3>
          <h3
            onClick={handleComment}
            style={{ color: showComment ? "#007bff" : "black" }}
          >
            <LiaCommentSolid />
          </h3>
        </div>
        <br />
        <div className="d-flex justify-content-between text-muted">
          <span className="">❤️ {totalLikes || 0} Likes</span>
          <span>💬 {post.comments?.length || 0} Comments</span>
        </div>
        <p className="mb-1">
          <strong>{post.user?.username || "Unknown"}</strong>{" "}
          {post.text || "Default caption for testing."}
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
