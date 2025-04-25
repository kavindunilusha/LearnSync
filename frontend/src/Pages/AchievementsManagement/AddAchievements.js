import React, { useState, useEffect } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import './AddAchievements.css';

function AddAchievements() {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (userId) {
      setFormData((prevData) => ({ ...prevData, postOwnerID: userId }));
      fetch(`http://localhost:8080/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.fullname) {
            setFormData((prevData) => ({ ...prevData, postOwnerName: data.fullname }));
          }
        })
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, []);

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
      alert('Achievements added successfully!');
      window.location.href = '/myAchievements';
    } else {
      alert('Failed to add Achievements.');
    }
  };

  return (
    <div className="add-achievement-page">
      <NavBar />
      <div className="achievement-container">
        <div className="achievement-card">
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
                <option value="Graphic Design">Graphic Design</option>
                <option value="Web Development">Web Development</option>
                <option value="Social Media">Social Media</option>
                <option value="Mastering Time Management">Mastering Time Management</option>
                <option value="Creative Writing for Beginners">Creative Writing for Beginners</option>
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
    </div>
  );
}

export default AddAchievements;
