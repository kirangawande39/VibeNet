import React, { useState } from "react";
import "../assets/css/StoryList.css";

const stories = [
  { id: 1, username: "kiran", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 2, username: "pranav", video: "https://www.w3schools.com/html/movie.mp4" },
  { id: 3, username: "prasad", video: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: 4, username: "rushi", video: "https://www.w3schools.com/html/movie.mp4" },
];

const StoryList = () => {
  const [selectedStory, setSelectedStory] = useState(null);

  const openStory = (story) => {
    setSelectedStory(story);
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <div className="story-list-container">
        {stories.map((story) => (
          <div key={story.id} className="story" onClick={() => openStory(story)}>
            <div className="story-circle">
              <video
                className="story-video"
                src={story.video}
                muted
                loop
                playsInline
                preload="metadata"
              />
            </div>
            <p className="story-username">{story.username}</p>
          </div>
        ))}
      </div>

      {/* Modal to show story on click */}
      {selectedStory && (
        <div className="story-modal" onClick={closeStory}>
          <video
            src={selectedStory.video}
            className="story-modal-video"
            controls
            autoPlay
          />
        </div>
      )}
    </>
  );
};

export default StoryList;
