import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import './Courses.css';

function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/courses')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched courses data:', data);
                setCourses(data);
                setFilteredCourses(data);
            })
            .catch((error) => console.error('Error fetching courses data:', error))
            .finally(() => setIsLoading(false));
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = courses.filter(
            (course) =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                (course.tags && course.tags.some(tag => tag.toLowerCase().includes(query)))
        );
        setFilteredCourses(filtered);
    };

    const handleCourseClick = (courseId) => {
        navigate(`/course/${courseId}`);
    };

    return (
        <div className="courses-page">
            <NavBar />
            <div className="courses-content">
                <div className="page-header">
                    <h1>Explore Learning Resources</h1>
                    <p>Discover courses and tutorials shared by our community</p>
                </div>
                
                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search courses by title, description or tags..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                {isLoading ? (
                    <div className="loading">Loading courses...</div>
                ) : (
                    <>
                        <div className="courses-grid">
                            {filteredCourses.length === 0 ? (
                                <div className="no-courses">
                                    <h3>No courses found</h3>
                                    <p>Try adjusting your search or check back later for new content</p>
                                </div>
                            ) : (
                                filteredCourses.map((course) => (
                                    <div 
                                        key={course.id || course.courseID} 
                                        className="course-card"
                                        onClick={() => handleCourseClick(course.id || course.courseID)}
                                    >
                                        {course.courseImageUrl ? (
                                            <img
                                                src={course.courseImageUrl}
                                                alt={course.title}
                                                className="course-image"
                                            />
                                        ) : (
                                            <div className="course-image-placeholder">
                                                <span>{course.title.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="course-content">
                                            <h3 className="course-title">{course.title}</h3>
                                            <p className="course-description">
                                                {course.description.length > 120
                                                    ? `${course.description.substring(0, 120)}...`
                                                    : course.description}
                                            </p>
                                            <div className="course-meta">
                                                <div className="course-tags-container">
                                                    {course.tags && course.tags.length > 0
                                                        ? course.tags.slice(0, 3).join(', ')
                                                        : 'No tags'}
                                                </div>
                                                <span className="course-date">
                                                    {course.createdDateTime
                                                        ? new Date(course.createdDateTime).toLocaleDateString()
                                                        : 'Date unavailable'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <button className="add-course-btn" onClick={() => navigate('/create-course')}>
                            +
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default AllCourses;