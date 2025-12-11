import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProfileComp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        return toast.error('Please fill in all required fields');
      }

      const res = await axios.put(`${API_BASE_URL}/UpdateProfile/${user.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        const updatedUser = { ...user, ...res.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditMode(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        return toast.error('Please fill in all password fields');
      }

      if (formData.newPassword !== formData.confirmPassword) {
        return toast.error('New passwords do not match');
      }

      if (formData.newPassword.length < 6) {
        return toast.error('Password must be at least 6 characters long');
      }

      const res = await axios.put(`${API_BASE_URL}/ChangePassword/${user.id}`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <ScaleLoader color="#081213" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <h2>Please log in to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="ProfileComp">
      <Toaster />
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information and settings</p>
        </div>

        <div className="profile-content">
          <div className="profile-picture-section">
            {/* <div className="profile-picture">
              <User size={80} />
              <div className="camera-icon">
                <Camera size={20} />
              </div>
            </div> */}
            <h3>{user.firstName} {user.lastName}</h3>
            <p className="user-role">{user.role}</p>
          </div>

          <div className="profile-info-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!editMode ? (
                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  <Edit2 size={16} />
                  Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="cancel-btn" onClick={() => {
                    setEditMode(false);
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      phoneNumber: user.phoneNumber || '',
                      address: user.address || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                ) : (
                  <p>{user.firstName || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Last Name</label>
                {editMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                ) : (
                  <p>{user.lastName || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item">
                <label>Email</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>

              <div className="info-item">
                <label>Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p>{user.phoneNumber || 'Not provided'}</p>
                )}
              </div>

              <div className="info-item full-width">
                <label>Address</label>
                {editMode ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    rows="3"
                  />
                ) : (
                  <p>{user.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="password-section">
            <div className="section-header">
              <h2>Change Password</h2>
              <Lock size={20} />
            </div>

            <div className="password-form">
              <div className="password-input-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="password-input-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="password-input-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="change-password-btn" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComp; 