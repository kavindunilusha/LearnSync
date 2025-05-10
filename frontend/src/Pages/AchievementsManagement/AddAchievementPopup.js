import React, { useState, useEffect } from 'react';
import './AchievementsPopup.css';

function AddAchievementPopup({ onClose, onSubmit, topicTitle }) {
    console.log("AddAchievementPopup rendered with topicTitle:", topicTitle);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        postOwnerID: '',
        category: '',
        postOwnerName: '',
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        console.log("AddAchievementPopup useEffect triggered with topicTitle:", topicTitle);
        // Set default values when component mounts
        const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
        setFormData(prev => ({
            ...prev,
            title: topicTitle,
            description: "I am happy to share that I have completed this section",
            date: today
        }));

        // Get user data
        const userId = localStorage.getItem('userID');
        if (userId) {
            setFormData(prev => ({ ...prev, postOwnerID: userId }));
            fetch(`http://localhost:8080/user/${userId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.fullname) {
                        setFormData(prev => ({ ...prev, postOwnerName: data.fullname }));
                    }
                })
                .catch((error) => console.error('Error fetching user data:', error));
        }
    }, [topicTitle]); // Add topicTitle as a dependency

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let imageUrl = '';
        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            const uploadResponse = await fetch('http://localhost:8080/achievements/upload', {
                method: 'POST',
                body: formData,
            });
            imageUrl = await uploadResponse.text();
        }

        const response = await fetch('http://localhost:8080/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, imageUrl }),
        });
        if (response.ok) {
            alert('Achievement added successfully!');
            onSubmit();
            onClose();
        } else {
            alert('Failed to add Achievement.');
        }
    };

    return (
        <div className="achievement-popup-overlay">
            <div className="achievement-popup">
                <button className="close-button" onClick={onClose}>×</button>
                <div className="achievement-header">
                    <h1>Share Your Achievement</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Upload Image</label>
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                            </div>
                        )}
                        <div className="file-input-container">
                            <input
                                type="file"
                                className="custom-file-input"
                                accept="image/*"
                                onChange={handleImageChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            placeholder="Enter achievement title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            placeholder="Describe your achievement"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            className="form-input category-select"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Category</option>
                  <option value="AI and Data Science">AI and Data Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Photograpya and Video Editing">Photograpy and Video Editing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Creative Writing for Beginner">Creative Writing for Beginners</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            className="form-input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Share Achievement
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddAchievementPopup; 