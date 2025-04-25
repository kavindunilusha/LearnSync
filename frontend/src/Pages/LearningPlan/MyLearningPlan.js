import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './post.css';
import './MyLearningPlan.css';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosCreate } from "react-icons/io";
import NavBar from '../../Components/NavBar/NavBar';
import { HiCalendarDateRange } from "react-icons/hi2";

function MyLearningPlan() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchOwnerName, setSearchOwnerName] = useState('');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/learningPlan');
        const userPosts = response.data.filter(post => post.postOwnerID === userId); // Filter posts by userID
        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []); // Ensure this runs only once on component mount

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:8080/learningPlan/${id}`);
        alert('Post deleted successfully!');
        setFilteredPosts(filteredPosts.filter((post) => post.id !== id)); // Update the list after deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleUpdate = (id) => {
    window.location.href = `/updateLearningPlan/${id}`;
  };

  return (
    <div className="my-learning-page">
      <NavBar />
      <div className="my-learning-content">
        <div className="my-learning-grid">
          {filteredPosts.length === 0 ? (
            <div className="no-learning">
              <h3>No Learning Plans Found</h3>
              <p>Start by creating your first learning plan</p>
              <button 
                className="create-button"
                onClick={() => (window.location.href = '/addLearningPlan')}
              >
                Create Learning Plan
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="my-learning-card">
                <div className="user-header">
                  <div className="owner-info">
                    <span className="owner-name">{post.postOwnerName}</span>
                  </div>
                  {post.postOwnerID === userId && (
                    <div className="action-buttons">
                      <FaEdit
                        onClick={() => handleUpdate(post.id)}
                        className="action-icon"
                      />
                      <RiDeleteBin6Fill
                        onClick={() => handleDelete(post.id)}
                        className="action-icon"
                      />
                    </div>
                  )}
                </div>

                <h3 className="learning-title">{post.title}</h3>
                <div className="learning-date">
                  <HiCalendarDateRange />
                  {post.startDate} to {post.endDate}
                </div>
                <span className="category-badge">{post.category}</span>
                
                <p className="learning-description">{post.description}</p>
                
                <div className="tags-container">
                  {post.tags?.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>

                <div className="media-section">
                  {post.imageUrl && (
                    <img
                      src={`http://localhost:8080/learningPlan/planImages/${post.imageUrl}`}
                      alt={post.title}
                    />
                  )}
                  {post.contentURL && (
                    <iframe
                      src={getEmbedURL(post.contentURL)}
                      title={post.title}
                      frameBorder="0"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="add-learning-btn"
          onClick={() => (window.location.href = '/addLearningPlan')}
        >
          <IoIosCreate />
        </button>
      </div>
    </div>
  );
}

export default MyLearningPlan;
