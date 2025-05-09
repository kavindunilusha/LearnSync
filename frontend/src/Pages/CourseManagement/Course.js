import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import './Courses.css';
import AddAchievementPopup from '../AchievementsManagement/AddAchievementPopup';
import axios from 'axios';

function Course() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [expandedTopicIds, setExpandedTopicIds] = useState([]);
    const [completedTopicIds, setCompletedTopicIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [completionPercentage, setCompletionPercentage] = useState(0);
    const [showShareDialog, setShowShareDialog] = useState(false);
    const [currentTopicId, setCurrentTopicId] = useState(null);
    const [showAchievementForm, setShowAchievementForm] = useState(false);
    const [currentTopicTitle, setCurrentTopicTitle] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8080/courses/${courseId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setCourse(data);
                // Expand the first topic by default
                if (data.topics && data.topics.length > 0) {
                    setExpandedTopicIds([data.topics[0].id]);
                }
            })
            .catch((error) => {
                console.error('Error fetching course data:', error);
            })
            .finally(() => setIsLoading(false));
    }, [courseId]);

    // Calculate completion percentage whenever completedTopicIds changes
    useEffect(() => {
        if (course && course.topics) {
            const totalTopics = course.topics.length;
            const completedCount = completedTopicIds.length;
            const percentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
            setCompletionPercentage(percentage);
        }
    }, [completedTopicIds, course]);

    const toggleTopic = (topicId) => {
        setExpandedTopicIds(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(id => id !== topicId);
            } else {
                return [...prev, topicId];
            }
        });
    };

    const handleTopicComplete = (topic) => {
        console.log("handleTopicComplete called with topic:", topic);
        
        // Use title as identifier if id is null
        const topicIdentifier = topic.id || topic.title;
        
        // First, mark the current topic as completed
        setCompletedTopicIds(prev => {
            if (!prev.includes(topicIdentifier)) {
                return [...prev, topicIdentifier];
            }
            return prev;
        });

        // Set the current topic details
        setCurrentTopicTitle(topic.title);
        setCurrentTopicId(topicIdentifier);
        setShowShareDialog(true);
        console.log("Setting showShareDialog to true");
    };

    const handleShareDialogResponse = (shouldShare) => {
        console.log("Share dialog response:", shouldShare);
        console.log("Current topic title:", currentTopicTitle);
        setShowShareDialog(false);
        if (shouldShare) {
            setShowAchievementForm(true);
            console.log("Setting showAchievementForm to true");
        } else {
            // Just mark as complete without showing achievement form
            setShowAchievementForm(false);
        }
    };

    const handleAchievementSubmit = async (achievementData) => {
        try {
            // Add the achievement
            const response = await axios.post('http://localhost:5000/api/achievements', achievementData);
            
            // Close the achievement form
            setShowAchievementForm(false);
            
            // Show success message
            alert('Achievement shared successfully!');
        } catch (error) {
            console.error('Error sharing achievement:', error);
            if (error.code === 'ERR_NETWORK') {
                alert('Cannot connect to the server. Please make sure the backend server is running.');
            } else {
                alert('Failed to share achievement. Please try again.');
            }
        }
    };

    const isTopicExpanded = (topicId) => {
        return expandedTopicIds.includes(topicId);
    };

    const isTopicCompleted = (topicId) => {
        return completedTopicIds.includes(topicId);
    };

    const renderContent = (content) => {
        if (!content) return null;
        
        switch (content.type) {
            case 'text':
                return <p className="content-text">{content.data}</p>;
            case 'video':
                return (
                    <div className="content-video">
                        <video controls>
                            <source src={content.data} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );
            case 'image':
                return (
                    <div className="content-image">
                        <img src={content.data} alt="Content" />
                    </div>
                );
            case 'code':
                return (
                    <pre className="content-code">
                        <code>{content.data}</code>
                    </pre>
                );
            case 'quiz':
                return (
                    <div className="content-quiz">
                        <button onClick={() => navigate(`/quiz/${content.data}`)}>
                            Take Quiz
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="course-page">
                <NavBar />
                <div className="loading">Loading course details...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-page">
                <NavBar />
                <div className="error">Course not found</div>
            </div>
        );
    }

    return (
        <div className="course-page">
            <NavBar />
            <div className="course-header">
                <img src={course.imageUrl} alt={course.title} />
                <h1>{course.title}</h1>
                <p>{course.description}</p>
            </div>

            {/* Add Progress Bar Section */}
            <div className="progress-section">
                <div className="progress-label-row">
                    <span className="progress-label">Course Progress</span>
                    <span className="progress-status">
                        {completedTopicIds.length} of {course?.topics?.length || 0} topics completed ({completionPercentage}%)
                    </span>
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="course-content">
                {course.topics.map((topic, index) => (
                    <div key={topic.id || index} className="topic-section">
                        <div 
                            className="topic-header"
                            onClick={() => toggleTopic(topic.id || topic.title)}
                        >
                            <h3>{topic.title}</h3>
                            <span className="toggle-icon">
                                {expandedTopicIds.includes(topic.id || topic.title) ? '▼' : '▶'}
                            </span>
                        </div>
                        
                        {expandedTopicIds.includes(topic.id || topic.title) && (
                            <div className="topic-content">
                                {topic.subTopics.map((subTopic, subIndex) => (
                                    <div key={subTopic.id || subIndex} className="subtopic-section">
                                        <h4>{subTopic.title}</h4>
                                        {subTopic.contents.map((content, contentIndex) => (
                                            <div key={contentIndex} className="content-item">
                                                {renderContent(content)}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <button 
                                    className="mark-complete-btn"
                                    onClick={() => handleTopicComplete(topic)}
                                    disabled={completedTopicIds.includes(topic.id || topic.title)}
                                >
                                    {completedTopicIds.includes(topic.id || topic.title) ? 'Completed' : 'Mark as Complete'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Share Dialog */}
            {showShareDialog && currentTopicId && (
                <div className="share-dialog-overlay">
                    <div className="share-dialog">
                        <h3>Share this with the community?</h3>
                        <div className="share-dialog-buttons">
                            <button 
                                className="share-dialog-btn yes"
                                onClick={() => handleShareDialogResponse(true)}
                            >
                                Yes
                            </button>
                            <button 
                                className="share-dialog-btn no"
                                onClick={() => handleShareDialogResponse(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievement Form Popup */}
            {showAchievementForm && currentTopicId && (
                <AddAchievementPopup 
                    key={`achievement-${currentTopicId}`}
                    onClose={() => setShowAchievementForm(false)}
                    onSubmit={handleAchievementSubmit}
                    topicTitle={currentTopicTitle}
                />
            )}
        </div>
    );
}

export default Course; 