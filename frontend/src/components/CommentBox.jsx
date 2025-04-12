import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

import "../assets/css/CommentBox.css";

const CommentBox = ({ postId }) => {
  // ✅ Default comments (Backend se connect hone tak ye use kar sakte ho)
  const [comments, setComments] = useState([
    { _id: 1, userId: { username: "john_doe" }, text: "Nice post!" },
    { _id: 2, userId: { username: "jane_smith" }, text: "Amazing content ❤️" },
    { _id: 3, userId: { username: "michael_23" }, text: "Keep it up! 🔥" }
  ]);
  
  const [newComment, setNewComment] = useState("");

  // ✅ Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // ✅ Add new comment to the list
    const newCommentData = {
      _id: Date.now(),
      userId: { username: "test_user" }, // Default user for now
      text: newComment
    };

    setComments([...comments, newCommentData]); // Update UI
    setNewComment(""); // Clear input
  };

  return (
    <div className="comment-box">
      {/* Comments List */}
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <strong>{comment.userId.username}:</strong> {comment.text}
          </div>
        ))}
      </div>

      {/* Comment Input */}
      <form className="comment-form" onSubmit={handleCommentSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          required
        />
        <button type="submit">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default CommentBox;
