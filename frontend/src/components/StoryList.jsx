import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/StoryList.css";
import {
  FaPlus,
} from "react-icons/fa";



const StoryList = ({ stories, hasSeenAllStoriesCurrentUser, currentUserStories, currentUser, otherUsersStories, currentUserId, isVideo, openStory, isSeen }) => {

  // if (!stories?.length) return null;

  return (
    <>
      {/* Story Thumbnails */}
      <div className="container mt-3">
        <div className="d-flex overflow-auto pb-2">
          {/* Your Story Bubble */}


          <div
            className="text-center position-relative me-3 flex-shrink-0"
            onClick={() => openStory(currentUserId, 0)}
            style={{ cursor: "pointer", minWidth: "80px", maxWidth: "90px" }}
          >
            <div
              className={`rounded-circle border border-2 ${hasSeenAllStoriesCurrentUser ? "border-secondary" : "border-primary"}`}
              style={{
                width: "70px",
                height: "70px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {currentUserStories?.length > 0 ? (
                isVideo(currentUserStories[0].mediaUrl) ? (
                  <video
                    className="w-100 h-100 object-fit-cover"
                    src={currentUserStories[0].mediaUrl}
                    muted
                    loop
                    preload="metadata"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <img
                    className="w-100 h-100 object-fit-cover"
                    src={currentUserStories[0].mediaUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                    alt="Your Story"
                    style={{ objectFit: "cover" }}
                  />
                )
              ) : (
                <img
                  className="w-100 h-100 object-fit-cover"
                  src={
                    currentUser.profilePic?.url ||
                    currentUser?.profilePic ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="Your Story"
                  style={{ objectFit: "cover" }}
                />
              )}
              {currentUserStories.length === 0 && (
                <div
                  className="position-absolute  text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px",
                    bottom: "8px",
                    right: "8px",
                    fontSize: "14px",
                  }}
                >
                  <FaPlus size={30}  />
                </div>
              )}
            </div>
            <small className="d-block mt-1 text-truncate" style={{ maxWidth: "90px" }}>
              Your Story
            </small>
          </div>

          {/* Other Users' Stories */}
          {otherUsersStories.map(({ user, stories }) => {

            return (
              <div
                key={user._id}
                className="text-center position-relative me-3 flex-shrink-0"
                onClick={() => openStory(user._id, 0)}
                style={{ cursor: "pointer", minWidth: "80px", maxWidth: "90px" }}
              >
                <div
                  className={`rounded-circle border border-3 ${isSeen ? "border-secondary" : "border-primary"}`}
                  style={{
                    width: "70px",
                    height: "70px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {isVideo(stories[0].mediaUrl) ? (
                    <video
                      className="w-100 h-100 object-fit-cover"
                      src={stories[0].mediaUrl}
                      muted
                      loop
                      preload="metadata"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={stories[0].mediaUrl}
                      alt={user.username}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <small className="d-block mt-1 text-truncate" style={{ maxWidth: "90px" }}>
                  {user.username}
                </small>
                
              </div>
            );
          })}
        </div>
      </div>
    </>

  );
};

export default StoryList;
