import React, { useEffect, useState } from 'react';
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import NavBar from '../../Components/NavBar/NavBar';
import { IoIosCreate } from "react-icons/io";
import './Achievements.css';

function AllAchievements() {
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userId = localStorage.getItem('userID');

  useEffect(() => {
    fetch('http://localhost:8080/achievements')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching Achievements data:', error));
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = progressData.filter(
      (achievement) =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Achievements?')) {
      try {
        const response = await fetch(`http://localhost:8080/achievements/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Achievements deleted successfully!');
          setFilteredData(filteredData.filter((progress) => progress.id !== id));
        } else {
          alert('Failed to delete Achievements.');
        }
      } catch (error) {
        console.error('Error deleting Achievements:', error);
      }
    }
  };

  return (
    <div className="achievements-page">
      <NavBar />
      <div className="achievements-content">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="achievements-grid">
          {filteredData.length === 0 ? (
            <div className="no-achievements">
              <h3>No Achievements Found</h3>
              <p>Share your accomplishments with the community</p>
              <button
                className="create-button"
                onClick={() => (window.location.href = '/addAchievements')}
              >
                Create Achievement
              </button>
            </div>
          ) : (
            filteredData.map((achievement) => (
              <div key={achievement.id} className="achievement-card">
                {achievement.imageUrl && (
                  <img
                    src={`http://localhost:8080/achievements/images/${achievement.imageUrl}`}
                    alt="Achievement"
                    className="achievement-image"
                  />
                )}
                <div className="achievement-content">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  <div className="achievement-meta">
                    <span className="achievement-owner">{achievement.postOwnerName}</span>
                    <span className="achievement-date">{achievement.date}</span>
                  </div>
                  {achievement.postOwnerID === userId && (
                    <div className="achievement-actions">
                      <FaEdit
                        onClick={() => (window.location.href = `/updateAchievements/${achievement.id}`)}
                        className="action-icon edit"
                      />
                      <RiDeleteBin6Fill
                        onClick={() => handleDelete(achievement.id)}
                        className="action-icon delete"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button
          className="add-achievement-btn"
          onClick={() => (window.location.href = '/addAchievements')}
        >
          <IoIosCreate />
        </button>
      </div>
    </div>
  );
}

export default AllAchievements;
