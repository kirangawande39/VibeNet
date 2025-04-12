import React from "react";
import "../assets/css/StoryList.css"; // ✅ Custom CSS file

const stories = [
  { id: 1, username: "kiran", avatar: "https://i.pravatar.cc/60?u=john" },
  { id: 2, username: "pranav", avatar: "https://i.pravatar.cc/60?u=jane" },
  { id: 3, username: "prasad", avatar: "https://i.pravatar.cc/60?u=michael" },
  { id: 4, username: "rushi", avatar: "https://i.pravatar.cc/60?u=sarah" },
  { id: 5, username: "chimpu", avatar: "https://i.pravatar.cc/60?u=david" },
  { id: 1, username: "kiran", avatar: "https://i.pravatar.cc/60?u=john" },
  { id: 2, username: "pranav", avatar: "https://i.pravatar.cc/60?u=jane" },
  { id: 3, username: "prasad", avatar: "https://i.pravatar.cc/60?u=michael" },
  { id: 4, username: "rushi", avatar: "https://i.pravatar.cc/60?u=sarah" },
  { id: 5, username: "chimpu", avatar: "https://i.pravatar.cc/60?u=david" },
];

const StoryList = () => {
  return (
    <div className="story-list-container">
      {stories.map((story) => (
        <div key={story.id} className="story">
          <img src={story.avatar} alt={story.username} className="story-avatar" />
          <p className="story-username">{story.username}</p>
        </div>
      ))}
    </div>
  );
};

export default StoryList;
