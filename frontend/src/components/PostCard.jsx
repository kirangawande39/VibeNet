import "bootstrap/dist/css/bootstrap.min.css";
import CommentBox from "./CommentBox"; // ✅ Import CommentBox component
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);


const PostCard = ({ post }) => {
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
        <div className="d-flex justify-content-between text-muted">
          <span>❤️ {post.likes || 0} Likes</span>
          <span>💬 {post.comments?.length || 0} Comments</span>
        </div>
        <p className="mb-1">
          <strong>{post.user.username || "Unknown"}</strong> {post.text || "Default caption for testing."}
        </p>
        <span>{dayjs(post.createdAt).fromNow()}</span>

      </div>

      {/* ✅ Comment Box Added Here */}
      <CommentBox postId={post._id || "12345"} />
    </div>
  );
};

export default PostCard;
