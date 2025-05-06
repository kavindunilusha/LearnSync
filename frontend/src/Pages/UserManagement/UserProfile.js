import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaEdit, FaTrashAlt, FaBook, FaFileAlt, FaTrophy } from 'react-icons/fa';
import './UserProfile.css';
import NavBar from '../../Components/NavBar/NavBar';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            setLoading(true);
            fetchUserDetails(userId)
                .then((data) => {
                    setUserData(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        } else {
            navigate('/login'); // Redirect to login if no user ID
        }
    }, [navigate]);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
            const userId = localStorage.getItem('userID');
            setLoading(true);
            fetch(`http://localhost:8080/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile. Please try again.");
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert("An error occurred. Please try again later.");
                    setLoading(false);
                });
        }
    };

    // Function to render skill tags
    const renderSkillTags = (skills) => {
        if (!skills || !skills.length) return null;
        
        return (
            <div className="skills-tags">
                {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="profile-page">
                <NavBar />
                <div className="profile-content loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <NavBar />
            <div className="profile-content">
                {userData && userData.id === localStorage.getItem('userID') && (
                    <div className="profile-card">
                        {userData.profilePicturePath ? (
                            <img
                                src={`http://localhost:8080/uploads/profile/${userData.profilePicturePath}`}
                                alt="Profile"
                                className="profile-image"
                            />
                        ) : (
                            <div className="profile-image-placeholder">
                                {userData.fullname ? userData.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className='pro_left_card'>
                            <div className='user_data_card'>
                                <div className='user_data_card_new'>
                                    <p className='username_card'>{userData.fullname || 'User'}</p>
                                    <p className='user_data_card_item_bio'>{userData.bio || 'No bio available'}</p>
                                </div>
                                <p className='user_data_card_item'>
                                    <FaEnvelope className='user_data_card_icon' /> {userData.email || 'No email available'}
                                </p>
                                <p className='user_data_card_item'>
                                    <FaPhone className='user_data_card_icon' /> {userData.phone || 'No phone available'}
                                </p>
                                <div className='user_data_card_item'>
                                    <FaTools className='user_data_card_icon' /> 
                                    <div>
                                        <span>Skills</span>
                                        {renderSkillTags(userData.skills)}
                                    </div>
                                </div>
                            </div>
                            <div className="profile-actions">
                                <button 
                                    onClick={() => navigate(`/updateUserProfile/${userData.id}`)} 
                                    className="update-button"
                                >
                                    <FaEdit style={{ marginRight: '8px' }} /> Update Profile
                                </button>
                                <button onClick={handleDelete} className="delete-button">
                                    <FaTrashAlt style={{ marginRight: '8px' }} /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className='my_post_link'>
                    <div 
                        className='my_post_link_card' 
                        onClick={() => (window.location.href = '/myLearningPlan')}
                    >
                        <div className='my_post_name_img1'></div>
                        <p className='my_post_link_card_name'>
                            <FaBook style={{ marginRight: '10px' }} /> My Learning Plan
                        </p>
                    </div>
                    <div 
                        className='my_post_link_card' 
                        onClick={() => (window.location.href = '/myAllPost')}
                    >
                        <div className='my_post_name_img2'></div>
                        <p className='my_post_link_card_name'>
                            <FaFileAlt style={{ marginRight: '10px' }} /> My SkillPost
                        </p>
                    </div>
                    <div 
                        className='my_post_link_card' 
                        onClick={() => (window.location.href = '/myAchievements')}
                    >
                        <div className='my_post_name_img3'></div>
                        <p className='my_post_link_card_name'>
                            <FaTrophy style={{ marginRight: '10px' }} /> My Achievements
                        </p>
                    </div>
                </div>
                <br/><br/>
            </div>
        </div>
    );
}

export default UserProfile;