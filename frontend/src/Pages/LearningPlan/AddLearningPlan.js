import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css';
import './AddLearningPlan.css';
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categories, setCategories] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate,
        endDate,
        categories
      };

      await axios.post('http://localhost:8080/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  return (
    <div className="add-learning-page">
      <NavBar />
      <div className="learning-container">
        <div className="template-preview">
          <div className="template-container">
            <div className="template-header">Template 1</div>
            <p className='template_title'>{title || "Title Preview"}</p>
            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{categories}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="iframe_preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
          </div>

          <div className="template-container">
            <div className="template-header">Template 2</div>
            <p className='template_title'>{title || "Title Preview"}</p>
            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{categories}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            <div className='preview_part'>
              <div className='preview_part_sub'>
                {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
              </div>
              <div className='preview_part_sub'>
                {contentURL && (
                  <iframe
                    src={getEmbedURL(contentURL)}
                    title="Content Preview"
                    className="iframe_preview_new"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>

          <div className="template-container">
            <div className="template-header">Template 3</div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="iframe_preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <p className='template_title'>{title || "Title Preview"}</p>
            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{categories}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h1>Create Learning Plan</h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tags-container">
                  <input
                    type="text"
                    className="form-input tags-input"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                  />
                  <button type="button" className="add-tag-btn" onClick={handleAddTag}>
                    <IoMdAdd />
                  </button>
                </div>
                <div className="tags-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Select Your Template</label>
                <select
                  className="form-input template-select"
                  value={templateID || ''}
                  onChange={(e) => setTemplateID(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>Select Template</option>
                  <option value="1">Template 1</option>
                  <option value="2">Template 2</option>
                  <option value="3">Template 3</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-input category-select"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="AI and Data Science">AI and Data Science</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Creative Writing for Beginner">Creative Writing for Beginner</option>
                </select>
              </div>

              <div className="form-group newpart-set">
                <FaVideo
                  className='newpart-set-icon'
                  onClick={() => setShowContentURLInput(!showContentURLInput)}
                />
                <FaImage
                  className='newpart-set-icon'
                  onClick={() => setShowImageUploadInput(!showImageUploadInput)}
                />
              </div>

              {showContentURLInput && (
                <div className="form-group">
                  <label>Content URL</label>
                  <input
                    className="form-input"
                    type="url"
                    value={contentURL}
                    onChange={(e) => setContentURL(e.target.value)}
                  />
                </div>
              )}

              {showImageUploadInput && (
                <div className="form-group">
                  <label>Upload Image</label>
                  {imagePreview && (
                    <div className="image-preview-achi">
                      <img src={imagePreview} alt="Preview" className="image-preview-achi" />
                    </div>
                  )}
                  <input
                    className="form-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              )}

              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Learning Plan'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;