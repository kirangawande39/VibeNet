import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaTimesCircle } from "react-icons/fa";

import { handleError } from '../utils/errorHandler';
import '../assets/css/Search.css';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [explorePosts, setExplorePosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [explorePage, setExplorePage] = useState(1);
    const [hasMoreExplore, setHasMoreExplore] = useState(true);
    const [loadingMoreExplore, setLoadingMoreExplore] = useState(false);

    // Fetch explore posts with pagination
    const fetchExplorePosts = async () => {
        if (loadingMoreExplore || !hasMoreExplore) return;

        setLoadingMoreExplore(true);
        try {
            const res = await axios.get(`${backendUrl}/api/posts?page=${explorePage}&limit=5`);
            const newPosts = res.data.posts;

            if (newPosts.length === 0) {
                setHasMoreExplore(false);
            } else {
                setExplorePosts((prev) => [...prev, ...newPosts]);
                setExplorePage((prev) => prev + 1);
            }
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingMoreExplore(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchExplorePosts();
    }, []);

    // Search logic
    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/users/search?query=${query}`);
                setResults(res.data.users);
            } catch (err) {
                handleError(err);
                setResults([]);
            }
            setLoading(false);
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    const clearAll = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <div className="search-main">
            {/* Search input */}
            <div className="input-wrapper">
                <FaSearch className="icon" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="glass-input"
                    autoFocus
                />
                {query && <FaTimesCircle className="clear-icon" onClick={clearAll} />}
            </div>

            {/* Clear All button */}
            {query && (
                <div className="clear-all-container">
                    <button className="clear-btn" onClick={clearAll}>Clear All</button>
                </div>
            )}

            {/* Results or Explore Posts */}
            {query.trim() ? (
                <div className="results-container">
                    {loading ? (
                        <p className="loading-text">Searching users...</p>
                    ) : results.length === 0 ? (
                        <p className="no-result">No users found</p>
                    ) : (
                        results.map((user) => (
                            <div className="result-card" key={user._id}>
                                <img
                                    src={user.profilePic?.url || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'}
                                    alt="dp"
                                    className="profile"
                                />
                                <div className="info d-flex">
                                    <div>
                                        <p className="uname">{user.username}</p>
                                        <p className="fname">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className="followers-list mt-3">
                                            • Followed by{" "}
                                            {user.followers && user.followers.length > 0 ? (
                                                <>
                                                    {user.followers.slice(0, 2).map(follower => (
                                                        <span key={follower._id} className="follower-name">
                                                            {follower.username}{" "}
                                                        </span>
                                                    ))}
                                                    {user.followers.length > 2 && (
                                                        <span className="follower-more">
                                                            +{user.followers.length - 2}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span>No followers</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="post-grid">
                    {explorePosts.map((post) => (
                        <div key={post._id} className="grid-item">
                            <img src={post.image} alt="post" />
                        </div>
                    ))}

                    {hasMoreExplore && (
                        <div className="text-center mt-3">
                            <button
                                className="load-more-btn"
                                onClick={fetchExplorePosts}
                                disabled={loadingMoreExplore}
                            >
                                {loadingMoreExplore ? "Loading..." : "Load More"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
