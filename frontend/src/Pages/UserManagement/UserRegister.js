import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import GoogalLogo from './img/glogo.png';
import { IoMdAdd } from "react-icons/io";

function UserRegister() {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        skills: [],
        bio: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [userEnteredCode, setUserEnteredCode] = useState('');
    const [skillInput, setSkillInput] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData({ ...formData, skills: [...formData.skills, skillInput] });
            setSkillInput('');
        }
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('profilePictureInput').click();
    };

    const sendVerificationCode = async (email) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        localStorage.setItem('verificationCode', code);
        try {
            await fetch('http://localhost:8080/sendVerificationCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
        } catch (error) {
            console.error('Error sending verification code:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isValid = true;

        if (!formData.email) {
            alert("Email is required");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            alert("Email is invalid");
            isValid = false;
        }

        if (!profilePicture) {
            alert("Profile picture is required");
            isValid = false;
        }
        if (formData.skills.length < 2) {
            alert("Please add at least two skills.");
            isValid = false;
        }
        if (!isValid) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullname: formData.fullname,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    skills: formData.skills,
                    bio: formData.bio,
                }),
            });

            if (response.ok) {
                const userId = (await response.json()).id;

                if (profilePicture) {
                    const profileFormData = new FormData();
                    profileFormData.append('file', profilePicture);
                    await fetch(`http://localhost:8080/user/${userId}/uploadProfilePicture`, {
                        method: 'PUT',
                        body: profileFormData,
                    });
                }

                sendVerificationCode(formData.email);
                setIsVerificationModalOpen(true);
            } else if (response.status === 409) {
                alert('Email already exists!');
            } else {
                alert('Failed to register user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleVerifyCode = () => {
        const savedCode = localStorage.getItem('verificationCode');
        if (userEnteredCode === savedCode) {
            alert('Verification successful!');
            localStorage.removeItem('verificationCode');
            window.location.href = '/';
        } else {
            alert('Invalid verification code. Please try again.');
        }
    };

    return (
        <div className="register-container">
            <div className="register-background">
                <div className="animated-shape"></div>
                <div className="animated-shape"></div>
                <div className="animated-shape"></div>
            </div>
            
            <div className="register-card">
                <div className="register-header">
                    <h1>Create Your Account</h1>
                    <p>Join our community of learners</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form-new">
                    <div className="profile-upload" onClick={triggerFileInput}>
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <FaUserCircle size={80} color="rgba(255,255,255,0.5)" />
                        )}
                    </div>
                    <input
                        id="profilePictureInput"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        style={{ display: 'none' }}
                    />

                    <div className="form-columns">
                        <div className="input-group">
                            <input
                                type="text"
                                name="fullname"
                                placeholder="Full Name"
                                value={formData.fullname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={(e) => {
                                    const re = /^[0-9\b]{0,10}$/;
                                    if (re.test(e.target.value)) handleInputChange(e);
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="skills-container">
                        <div className="skills-input-group">
                            <input
                                type="text"
                                placeholder="Add your skills"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                            />
                            <button type="button" className="add-skill-button" onClick={handleAddSkill}>
                                <IoMdAdd />
                            </button>
                        </div>
                        <div className="skills-list">
                            {formData.skills.map((skill, index) => (
                                <span key={index} className="skill-badge">{skill}</span>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <textarea
                            name="bio"
                            placeholder="Tell us about yourself"
                            value={formData.bio}
                            onChange={handleInputChange}
                            required
                            rows="4"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="register-button">
                            Create Account
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                            className="google-button"
                        >
                            <img src={GoogalLogo} alt='Google' className='glogo' />
                            Sign up with Google
                        </button>
                        <p className="login-link">
                            Already have an account? <span onClick={() => (window.location.href = '/')}>Sign in</span>
                        </p>
                    </div>
                </form>
            </div>

            {isVerificationModalOpen && (
                <div className="verification-modal-new">
                    <div className="modal-card">
                        <h2>Verify Your Email</h2>
                        <p>Please enter the verification code sent to your email</p>
                        <input
                            type="text"
                            value={userEnteredCode}
                            onChange={(e) => setUserEnteredCode(e.target.value)}
                            placeholder="Enter code"
                            className="verification-input"
                        />
                        <button onClick={handleVerifyCode} className="verify-button">
                            Verify Email
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRegister;
