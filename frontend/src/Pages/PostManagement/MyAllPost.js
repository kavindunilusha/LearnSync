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

//set root element for accessibility
Modal.setAppElement('#root');

function MyAllPost() {
  const [posts, setPosts] = useState([]);// Stores all fetched posts from the backend
  const [filteredPosts, setFilteredPosts] = useState([]);// Stores posts after applying filters
  const [postOwners, setPostOwners] = useState({});// mapp post IDs to user details
  const [showMyPosts, setShowMyPosts] = useState(false);// Controls whether to show only the current user's posts
  const [isModalOpen, setIsModalOpen] = useState(false);// Controls visibility of the media modal
  const [selectedMedia, setSelectedMedia] = useState(null);// Stores the media item currently selected
  const [followedUsers, setFollowedUsers] = useState([]); // State to track followed users
  const [newComment, setNewComment] = useState({}); // State for new comments
  const [editingComment, setEditingComment] = useState({}); // State for editing comments
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();
  const loggedInUserID = localStorage.getItem('userID'); // Get the logged-in user's ID

  useEffect(() => {
    // Fetch all posts from the backend
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/posts');
        const userID = localStorage.getItem('userID'); // Get the logged-in user's ID

        // Filter posts to include only those with the logged-in user's ID
        const userPosts = response.data.filter((post) => post.userID === userID);

        setPosts(userPosts);
        setFilteredPosts(userPosts); // Initially show filtered posts

        // Fetch post owners' names
        const userIDs = [...new Set(userPosts.map((post) => post.userID))]; // Get unique userIDs
        const ownerPromises = userIDs.map((userID) =>
          axios.get(`http://localhost:8080/user/${userID}`)
            .then((res) => ({
              userID,
              fullName: res.data.fullname,
            }))
            // If fetching user details fails, log the error
            .catch((error) => {
              console.error(`Error fetching user details for userID ${userID}:`, error);
              return { userID, fullName: 'Anonymous' };
            })
        );
        const owners = await Promise.all(ownerPromises);// Wait for all user detail fetch promises to resolve
        const ownerMap = owners.reduce((acc, owner) => {// Convert the list of owners into a map of userID to fullName
          acc[owner.userID] = owner.fullName;
          return acc;
        }, {});
        console.log('Post Owners Map:', ownerMap); // Debug log to verify postOwners map
        setPostOwners(ownerMap);// Update the state so the UI can use this mapping
      } catch (error) {
        console.error('Error fetching posts:', error); // Log error for fetching posts
      }
    };

    fetchPosts();
  }, []);

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

  const handleDelete = async (postId) => {
    // Show a confirmation dialog to the user
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the confirmation
    }

    try {
      // Send a DELETE request to the backend to remove the post
      await axios.delete(`http://localhost:8080/posts/${postId}`);
      // Notify the user of successful deletion
      alert('Post deleted successfully!');
      // Update the local state to remove the deleted post from the list
      setPosts(posts.filter((post) => post.id !== postId)); // Remove the deleted post from the UI
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId)); // Update filtered posts
    } catch (error) {
       // Handle any errors that occur during the delete operation
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
    const query = e.target.value.toLowerCase();// Get the search query and convert to lowercase
    setSearchQuery(query); // Update the search query state

    // Filter posts based on title, description, or category
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        (post.category && post.category.toLowerCase().includes(query))
    );
    setFilteredPosts(filtered);// Update the filtered posts to show in the UI
  };

  const openModal = (mediaUrl) => {
    setSelectedMedia(mediaUrl);// Set the selected media (image/video) to preview
    setIsModalOpen(true);// Open the media modal
  };

  const closeModal = () => {
    setSelectedMedia(null);// Clear selected media
    setIsModalOpen(false);// Close the media modal
  };

  return (
    <div>
      <div className='continer'>
        {/* Navigation Bar */}
        <NavBar />
        <div className='continSection'>
          {/* Search Input for Filtering Posts */}
          <div className='searchinput'>
            <input
              type="text"
              className="Auth_input "
              placeholder="Search posts..."
              value={searchQuery} // Binds the search query to the input field
              onChange={handleSearch} // Triggers the handleSearch function on input change
            />
          </div>
          {/* Button to Create New Post */}
          <div className='add_new_btn' onClick={() => (window.location.href = '/addNewPost')}>
            <IoIosCreate className='add_new_btn_icon' />{/* Icon for creating new post */}
          </div>

          {/* Displaying Posts */}
          <div className='post_card_continer'>
            {/* If no filtered posts, show a "No posts found" message */}
            {filteredPosts.length === 0 ? (
              <div className='not_found_box'>
                <div className='not_found_img'></div>
                <p className='not_found_msg'>No posts found. Please create a new post.</p>
                <button className='not_found_btn' onClick={() => (window.location.href = '/addNewPost')}>Create New Post</button>{/* Button to navigate to create post */}
              </div>
            ) : (
              // Map through filtered posts and display each one
              filteredPosts.map((post) => (
                <div key={post.id} className='post_card'>
                  <div className='user_details_card'>
                    <div className='name_section_post'>
                      {/* Display the post owner's name */}
                      <p className='name_section_post_owner_name'>{postOwners[post.userID] || 'Anonymous'}</p>
                      {post.userID !== loggedInUserID && (
                        <button
                          className={followedUsers.includes(post.userID) ? 'flow_btn_unfalow' : 'flow_btn'}
                          onClick={() => handleFollowToggle(post.userID)}
                        >
                          {followedUsers.includes(post.userID) ? 'Unfollow' : 'Follow'}
                        </button>
                      )}
                    </div>

                    {/* Action buttons for posts created by the logged-in user */}
                    {post.userID === loggedInUserID && (
                      <div>
                        <div className='action_btn_icon_post'>
                          <FaEdit
                            onClick={() => handleUpdate(post.id)} className='action_btn_icon' />{/* Edit the post*/}
                          <RiDeleteBin6Fill
                            onClick={() => handleDelete(post.id)}
                            className='action_btn_icon' />{/*Delete the post*/}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className='user_details_card_di'>
                    <p className='card_post_title'>{post.title}</p>
                    <p className='card_post_description' style={{ whiteSpace: "pre-line" }}>{post.description}</p>
                    <p className='card_post_category'>Category: {post.category || 'Uncategorized'}</p>
                  </div>
                  <div className="media-collage">
                    {post.media.slice(0, 4).map((mediaUrl, index) => (
                      <div
                        key={index}
                        className={`media-item ${post.media.length > 4 && index === 3 ? 'media-overlay' : ''}`}
                        onClick={() => openModal(mediaUrl)}
                      >
                        {mediaUrl.endsWith('.mp4') ? (
                          <video controls>
                            <source src={`http://localhost:8080${mediaUrl}`} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img src={`http://localhost:8080${mediaUrl}`} alt="Post Media" />
                        )}
                        {post.media.length > 4 && index === 3 && (
                          <div className="overlay-text">+{post.media.length - 4}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className='like_coment_lne'>
                    <div className='like_btn_con'>
                      <BiSolidLike
                        className={post.likes?.[localStorage.getItem('userID')] ? 'unlikebtn' : 'likebtn'}
                        onClick={() => handleLike(post.id)}
                      >
                        {post.likes?.[localStorage.getItem('userID')] ? 'Unlike' : 'Like'}
                      </BiSolidLike>
                      <p className='like_num'>
                        {Object.values(post.likes || {}).filter((liked) => liked).length}
                      </p>
                    </div>
                    <div className=''>
                      <div className='like_btn_con'>
                        <FaCommentAlt
                          className='combtn'
                        />
                        <p className='like_num'>
                          {post.comments?.length || 0}
                        </p>
                      </div>

                    </div>
                  </div>
                  <div className='withsett'>
                    <div className='add_comennt_con'>
                      <input
                        type="text"
                        className='add_coment_input'
                        placeholder="Add a comment"
                        value={newComment[post.id] || ''}
                        onChange={(e) =>
                          setNewComment({ ...newComment, [post.id]: e.target.value })
                        }
                      />
                      <IoSend
                        onClick={() => handleAddComment(post.id)}
                        className='add_coment_btn'
                      />
                    </div>
                    <br/>
                    {post.comments?.map((comment) => (
                      <div key={comment.id} className='coment_full_card'>
                        <div className='comnt_card'>
                          <p className='comnt_card_username'>{comment.userFullName}</p>
                          {editingComment.id === comment.id ? (
                            <input
                              type="text"
                              className='edit_comment_input'
                              value={editingComment.content}
                              onChange={(e) =>
                                setEditingComment({ ...editingComment, content: e.target.value })
                              }
                              autoFocus
                            />
                          ) : (
                            <p className='comnt_card_coment'>{comment.content}</p>
                          )}
                        </div>

                        <div className='coment_action_btn'>
                          {comment.userID === loggedInUserID && (
                            <>
                              {editingComment.id === comment.id ? (
                                <>
                                  <FiSave className='coment_btn'
                                    onClick={() =>
                                      handleSaveComment(post.id, comment.id, editingComment.content)
                                    } />
                                  <TbPencilCancel className='coment_btn'
                                    onClick={() => setEditingComment({})} />

                                </>
                              ) : (
                                <>
                                  <GrUpdate className='coment_btn' onClick={() =>
                                    setEditingComment({ id: comment.id, content: comment.content })
                                  } />
                                  <MdDelete className='coment_btn' onClick={() => handleDeleteComment(post.id, comment.id)} />
                                </>
                              )}
                            </>
                          )}
                          {post.userID === loggedInUserID && comment.userID !== loggedInUserID && (
                            <button
                              className='coment_btn'
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
        </div>
      </div>

      {/* Modal for displaying full media */}
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
    </div >
  );
}

export default MyAllPost;
