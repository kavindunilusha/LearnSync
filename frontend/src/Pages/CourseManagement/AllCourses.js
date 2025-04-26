import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar/NavBar'
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import './Courses.css'

function AllCourses() {
    const [progressData, setProgressData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const userId = localStorage.getItem('userID');

    useEffect(() => {
        fetch('http://localhost:8080/courses')
            .then((response) => response.json())
            .then((data) => {
                setProgressData(data);
                setFilteredData(data);
            })
            .catch((error) => console.error('Error fetching courses data:', error));
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = progressData.filter(
            (course) =>
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query)
        );
        setFilteredData(filtered);
    };

    return (
        <div className="courses-page">
            <NavBar />
            <div className="courses-content">
                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="courses-grid">
                    {filteredData.length === 0 ? (
                        <div className="no-courses">
                            <h3>No courses Found</h3>
                        </div>
                    ) : (
                        filteredData.map((course) => (
                            <div key={course.id} className="course-card">
                                {course.imageUrl && (
                                    <img
                                        src={`http://localhost:8080/courses/images/${course.imageUrl}`}
                                        alt="course"
                                        className="course-image"
                                    />
                                )}
                                <div className="course-content">
                                    <h3 className="course-title">{course.title}</h3>
                                    <p className="course-description">{course.description}</p>
                                    <div className="course-meta">
                                        <span className="course-owner">{course.postOwnerName}</span>
                                        <span className="course-date">{course.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>


            </div>
        </div>
    )
}

export default AllCourses;