import { useState, useContext, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "../assets/css/CommentBox.css";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AuthContext } from "../context/AuthContext";
import { MdDeleteForever } from "react-icons/md";
import socket from "../socket";
import { handleError } from '../utils/errorHandler';
dayjs.extend(relativeTime);
import { ToastContainer, toast } from 'react-toastify';
import Spinner from "./Spinner";

const CommentBox = ({ postId }) => {
  const { user, updateUser } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading,setLoading]=useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // ⏬ Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/comments/${postId}`);
        setComments(res.data.comments);
      } catch (err) {
         handleError(err);
      }
      finally{
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // ✅ Join post-specific room
  useEffect(() => {
    socket.emit("join-post", postId);
  }, [postId]);

  // ✅ Listen for live comments
  useEffect(() => {
    const handleNewComment = (comment) => {
      if (comment.postId === postId) {
        setComments((prev) => [...prev, comment]);
      }
    };

    socket.on("new-comment", handleNewComment);

    return () => {
      socket.off("new-comment", handleNewComment);
    };
  }, [postId]);


  useEffect(() => {
    const handleDeleteComment = ({ commentId }) => {
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    };

    socket.on("delete-comment", handleDeleteComment);

    return () => {
      socket.off("delete-comment", handleDeleteComment);
    };
  }, [postId]); // ✅ make sure it's listening correctly for current post



  // 📝 Submit new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/comments/${postId}`,
        { newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const commentWithPostId = {
        ...res.data,
        postId: res.data.post,
        user: user  // ✅ So that delete icon appears immediately
      };

      socket.emit("new-comment", commentWithPostId);
      setComments((prev) => [...prev, commentWithPostId]);  // ✅ Show live with icon
      setNewComment("");
    } catch (err) {
       handleError(err);
    }
  };


  // ❌ Delete comment
  const handleCommentDelete = async (commentId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/comments/${commentId}`);
      alert(res.data.message);

      // Locally update UI
      setComments((prev) => prev.filter((c) => c._id !== commentId));

      // ✅ Emit delete to others
      socket.emit("delete-comment", {
        commentId,
        postId,
      });
    } catch (err) {
      handleError(err);
    }
  };


  return (
    <div className="comment-box">
      <ToastContainer/>
      <div className="comments-list">
        {loading ? 
        <Spinner/>
        :
        comments.slice(0).reverse().map((comment) => (
          <div key={comment._id} className="comment">
            <img
              src={
                (typeof comment.user?.profilePic === 'string'
                  ? comment.user?.profilePic
                  : comment.user?.profilePic?.url)
                || (typeof user?.profilePic === 'string'
                  ? user?.profilePic
                  : user?.profilePic?.url)
                || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }

              className="comment-profile-pic"
            />
            <div className="comment-content">
              <div className="comment-header">
                <strong>{comment.user?.username || user.username}</strong>
                <span className="comment-time">{dayjs(comment.createdAt).fromNow()}</span>

                {/* ✅ Show delete icon if logged-in user is the comment owner */}
                {comment.user?._id === user?.id && (
                  <div className="comment-delete-btn">
                    <span onClick={() => handleCommentDelete(comment._id)}>
                      <MdDeleteForever />
                    </span>
                  </div>
                )}
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          </div>
        ))
        
        }

      </div>

      <form className="comment-form" onSubmit={handleCommentSubmit}>
        <img
          src={
            user.profilePic?.url ||
            updateUser.profilePic?.url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Profile"
          className="comment-profile-pic"
        />
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit" title="Send">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default CommentBox;
