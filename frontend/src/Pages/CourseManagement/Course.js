import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import './Courses.css';

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
        if (course?.topics?.length) {
            const percentage = (completedTopicIds.length / course.topics.length) * 100;
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

    const handleTopicComplete = (currentTopicId) => {
        // First, mark the current topic as completed
        setCompletedTopicIds(prev => {
            if (!prev.includes(currentTopicId)) {
                return [...prev, currentTopicId];
            }
            return prev;
        });

        // Show the share dialog
        setCurrentTopicId(currentTopicId);
        setShowShareDialog(true);
    };

    const handleShareDialogResponse = (shouldShare) => {
        setShowShareDialog(false);
        if (shouldShare) {
            // Navigate to AddAchievements page
            navigate('/addAchievements');
        } else {
            // Just collapse the current topic and expand the next one
            if (course && course.topics) {
                const currentIndex = course.topics.findIndex(topic => topic.id === currentTopicId);
                
                // Find the next incomplete topic
                let nextIncompleteTopicId = null;
                for (let i = currentIndex + 1; i < course.topics.length; i++) {
                    const topicId = course.topics[i].id;
                    if (!completedTopicIds.includes(topicId) && topicId !== currentTopicId) {
                        nextIncompleteTopicId = topicId;
                        break;
                    }
                }

                // Update expanded topics
                setExpandedTopicIds(prev => {
                    // Remove current topic
                    const withoutCurrent = prev.filter(id => id !== currentTopicId);
                    
                    // Add next topic if found
                    if (nextIncompleteTopicId && !withoutCurrent.includes(nextIncompleteTopicId)) {
                        return [...withoutCurrent, nextIncompleteTopicId];
                    }
                    
                    return withoutCurrent;
                });
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
            <div className="courses-content">
                <div className="course-header">
                    {course.courseImageUrl && (
                        <img
                            src={`http://localhost:8080/courses/images/${course.courseImageUrl}`}
                            alt={course.title}
                            className="course-header-image"
                        />
                    )}
                    <h1 className="course-title">{course.title}</h1>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                        <div className="course-tags">
                            {course.tags && course.tags.map((tag, index) => (
                                <span key={index} className="course-tag">{tag}</span>
                            ))}
                        </div>
                        <div className="course-dates">
                            <span>Created: {course.createdDateTime ? new Date(course.createdDateTime).toLocaleDateString() : 'N/A'}</span>
                            <span>Last Updated: {course.lastUpdatedDateTime ? new Date(course.lastUpdatedDateTime).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="course-progress">
                    <div className="course-progress-header">
                        <h3>Course Progress</h3>
                        <span>{completedTopicIds.length} of {course.topics?.length || 0} topics completed ({Math.round(completionPercentage)}%)</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="course-topics">
                    {course.topics && course.topics.length > 0 ? (
                        course.topics.map((topic) => (
                            <div 
                                key={topic.id} 
                                className={`topic-section ${isTopicExpanded(topic.id) ? 'expanded' : ''} ${isTopicCompleted(topic.id) ? 'completed-topic' : ''}`}
                            >
                                <div 
                                    className="topic-header"
                                    onClick={() => toggleTopic(topic.id)}
                                >
                                    <div className="topic-title-container">
                                        <h2>{topic.title}</h2>
                                        {isTopicCompleted(topic.id) && (
                                            <span className="completion-tick">✓</span>
                                        )}
                                    </div>
                                    <span className="expand-icon">
                                        {isTopicExpanded(topic.id) ? '▼' : '▶'}
                                    </span>
                                </div>
                                
                                <div className="subtopics">
                                    {topic.subTopics && topic.subTopics.map((subTopic) => (
                                        <div key={subTopic.id} className="subtopic">
                                            <h3>{subTopic.title}</h3>
                                            <div className="subtopic-contents">
                                                {subTopic.contents && subTopic.contents.map((content) => (
                                                    <div key={content.id} className="content-item">
                                                        {renderContent(content)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="topic-actions">
                                        <button 
                                            className="next-topic-btn"
                                            onClick={() => handleTopicComplete(topic.id)}
                                            disabled={isTopicCompleted(topic.id)}
                                        >
                                            {isTopicCompleted(topic.id) ? 'Completed' : 'Mark as Complete'}
                                        </button>
                                    </div>
                                    
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-topics">
                            <p>No topics available for this course yet.</p>
                        </div>
                    )}
                </div>
                
                {/* Share Dialog */}
                {showShareDialog && (
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
            </div>
        </div>
    );
}

export default Course; 