import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoSend } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { BiSolidLike } from "react-icons/bi";
import Modal from 'react-modal';
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { GrUpdate } from "react-icons/gr";
import { FiSave } from "react-icons/fi";
import { TbPencilCancel } from "react-icons/tb";
import { FaCommentAlt } from "react-icons/fa";
import Quiz from '../../Components/Quiz/Quiz';
import './PostManagement.css';
Modal.setAppElement('#root');

function AllPost() {
  const [posts, setPosts] = useState([]);// Holds all fetched posts from the backend
  const [filteredPosts, setFilteredPosts] = useState([]);// Holds the currently filtered list of posts
  const [postOwners, setPostOwners] = useState({});// Maps user IDs to full names for displaying post owner names
  const [showMyPosts, setShowMyPosts] = useState(false);// Controls whether to show only the logged-in user's posts
  const [isModalOpen, setIsModalOpen] = useState(false);// Controls the visibility of the media preview modal
  const [selectedMedia, setSelectedMedia] = useState(null);// Stores the currently selected media URL to be shown in the modal
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [isQuizOpen, setIsQuizOpen] = useState(false); // State for quiz modal
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Define an async function to fetch posts and their owner names
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data);// Store all posts
        setFilteredPosts(response.data); // Initially show all posts

        // Fetch post owners' names
        const userIDs = [...new Set(response.data.map((post) => post.userID))]; // Get unique userIDs
        
        // Create a promise for each userID to fetch their details
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,// Return fullName on success
            }))
            .catch((error) => {
              if (error.response && error.response.status === 404) {
                // Handle case where user is deleted
                console.warn(`User with ID ${userID} not found. Removing their posts.`);
                setPosts((prevPosts) => prevPosts.filter((post) => post.userID !== userID));
                setFilteredPosts((prevFilteredPosts) => prevFilteredPosts.filter((post) => post.userID !== userID));
              } else {
                // Log any other error types
                console.error(`Error fetching user details for userID ${userID}:`, error);
              }
              // Return placeholder name 
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);// Wait for all user detail fetch requests to complete

        // Convert the array into an object
        const ownerMap = owners.reduce((acc, owner) => {
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);// Store the owner map in state for use in the UI
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();// Call the async function
  }, []);// ensures useEffect runs only once

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      const userID = localStorage.getItem('userID');
      if (userID) {
        try {
          const response = await axios.get(`http://localhost:8080/user/${userID}/followedUsers`);
          setFollowedUsers(response.data);
        } catch (error) {
          console.error('Error fetching followed users:', error);
        }
      }
    };

    fetchFollowedUsers();
  }, []);

  // Handles deleting a post
  const handleDelete = async (postId) => {
    // Ask user for confirmation before deleting
    const confirmDelete = window.confirm('Do you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      // Send DELETE request to backend
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      alert('Post deleted successfully!');

      // Remove the deleted post from both lists to update the UI
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
      // Handle errors
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = (postId) => {
    navigate(`/updatePost/${postId}`); // Navigate to the UpdatePost page with the post ID
  };

  const handleMyPostsToggle = () => {
    if (showMyPosts) {
      // Show all posts
      setFilteredPosts(posts);
    } else {
      // Filter posts by logged-in user ID
      setFilteredPosts(posts.filter((post) => post.userID === loggedInUserID));
    }
    setShowMyPosts(!showMyPosts); // Toggle the state
  };

  const handleLike = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8080/posts/${postId}/like`, null, {
        params: { userID },
      });

      // Update the specific post's likes in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleFollowToggle = async (postOwnerID) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to follow/unfollow users.');
      return;
    }
    try {
      if (followedUsers.includes(postOwnerID)) {
        // Unfollow logic
        await axios.put(`http://localhost:8080/user/${userID}/unfollow`, { unfollowUserID: postOwnerID });
        setFollowedUsers(followedUsers.filter((id) => id !== postOwnerID));
      } else {
        // Follow logic
        await axios.put(`http://localhost:8080/user/${userID}/follow`, { followUserID: postOwnerID });
        setFollowedUsers([...followedUsers, postOwnerID]);
      }
    } catch (error) {
      console.error('Error toggling follow state:', error);
    }
  };

  const handleAddComment = async (postId) => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      alert('Please log in to comment.');
      return;
    }
    const content = newComment[postId] || ''; // Get the comment content for the specific post
    if (!content.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/comment`, {
        userID,
        content,
      });

      // Update the specific post's comments in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId ? { ...post, comments: response.data.comments } : post
        )
      );

      setNewComment({ ...newComment, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const userID = localStorage.getItem('userID');
    try {
      await axios.delete(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        params: { userID },
      });

      // Update state to remove the deleted comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
            : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveComment = async (postId, commentId, content) => {
    try {
      const userID = localStorage.getItem('userID');
      await axios.put(`http://localhost:8080/posts/${postId}/comment/${commentId}`, {
        userID,
        content,
      });

      // Update the comment in state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setFilteredPosts((prevFilteredPosts) =>
        prevFilteredPosts.map((post) =>
          post.id === postId
            ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
              ),
            }
            : post
        )
      );

      setEditingComment({}); // Clear editing state
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const validCategories = ['jewelry making', 'painting', 'woodworking', 'crochet', 'other creative'];
    let filtered = posts;

    if (validCategories.includes(query)) {
      // If the query exactly matches a category (case-insensitive)
      filtered = posts.filter(post => 
        post.category && post.category.toLowerCase() === query
      );
    } else {
      // If no exact category match, search in title and description
      filtered = posts.filter(post => 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.description && post.description.toLowerCase().includes(query)) ||
        (post.category && post.category.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(filtered);
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setIsModalOpen(false);
  };

  return (
    <div className="post-page">
      <NavBar />
      <div className="post-content">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="post-grid">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <h3>No Posts Found</h3>
              <p>Share your thoughts with the community</p>
              <button 
                className="create-button"
                onClick={() => (window.location.href = '/addNewPost')}
              >
                Create Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-owner">
                    <span className="owner-name">{postOwners[post.userID] || 'Anonymous'}</span>
                    {post.userID !== loggedInUserID && (
                      <button
                        className={`follow-button ${followedUsers.includes(post.userID) ? 'following' : ''}`}
                        onClick={() => handleFollowToggle(post.userID)}
                      >
                        {followedUsers.includes(post.userID) ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  {post.userID === loggedInUserID && (
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

                <h3 className="post-title">{post.title}</h3>
                <p className="post-description">{post.description}</p>
                <span className="post-category">{post.category || 'Uncategorized'}</span>

                <div className="media-grid">
                  {post.media.slice(0, 4).map((mediaUrl, index) => (
                    <div
                      key={index}
                      className="media-item"
                      onClick={() => openModal(mediaUrl)}
                    >
                      {mediaUrl.endsWith('.mp4') ? (
                        <video controls>
                          <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                        </video>
                      ) : (
                        <img src={`http://localhost:8080${mediaUrl}`} alt="Post Media" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="interaction-bar">
                  <div className="action-buttons">
                    <BiSolidLike
                      onClick={() => handleLike(post.id)}
                      className={`action-icon ${post.likes?.[loggedInUserID] ? 'liked' : ''}`}
                    />
                    <span>{Object.values(post.likes || {}).filter(liked => liked).length}</span>
                    <FaCommentAlt className="action-icon" />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>

                <div className="comments-section">
                  <div className="comment-input">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                    />
                    <button className="send-button" onClick={() => handleAddComment(post.id)}>
                      <IoSend />
                    </button>
                  </div>
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="comment-card">
                      <div className="comment-content">
                        <span className="comment-owner">{comment.userFullName}</span>
                        {editingComment.id === comment.id ? (
                          <input
                            type="text"
                            className="edit-comment-input"
                            value={editingComment.content}
                            onChange={(e) =>
                              setEditingComment({ ...editingComment, content: e.target.value })
                            }
                            autoFocus
                          />
                        ) : (
                          <p>{comment.content}</p>
                        )}
                      </div>
                      <div className="comment-actions">
                        {comment.userID === loggedInUserID && (
                          <>
                            {editingComment.id === comment.id ? (
                              <>
                                <FiSave
                                  onClick={() =>
                                    handleSaveComment(post.id, comment.id, editingComment.content)
                                  }
                                />
                                <TbPencilCancel
                                  onClick={() => setEditingComment({})}
                                />
                              </>
                            ) : (
                              <>
                                <GrUpdate
                                  onClick={() =>
                                    setEditingComment({ id: comment.id, content: comment.content })
                                  }
                                />
                                <MdDelete
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                />
                              </>
                            )}
                          </>
                        )}
                        {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                          <button
                            onClick={() => handleDeleteComment(post.id, comment.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="add-post-btn"
          onClick={() => (window.location.href = '/addNewPost')}
        >
          <IoIosCreate />
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Media Modal"
        className="media-modal"
        overlayClassName="media-modal-overlay"
      >
        <button className="close-modal-btn" onClick={closeModal}>x</button>
        {selectedMedia && selectedMedia.endsWith('.mp4') ? (
          <video controls className="modal-media">
            <source src={`http://localhost:8080${selectedMedia}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={`http://localhost:8080${selectedMedia}`} alt="Full Media" className="modal-media" />
        )}
      </Modal>
    </div>
  );
}

export default AllPost;
