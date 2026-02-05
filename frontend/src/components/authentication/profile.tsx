import React from 'react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
import './assets/css/profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const userStr = localStorage.getItem("user")
  const user = userStr ? JSON.parse(userStr) : null

  const isProfileOpen = location.pathname.includes('changepassword')

  return (
    <div className="profile-wrapper">
      <div className="profile-container">

        {/* Close button */}
        <button className="profile-close" onClick={() => navigate('/home')}>✕</button>

        {/* Header */}
        <div className="profile-header">
          <span className="profile-icon">🩺</span>
          <h1>User Profile</h1>
        </div>

        {user ? (
          <div className="profile-info">
            <div><span>User ID</span><p>{user.user_id}</p></div>
            <div><span>Username</span><p>{user.username}</p></div>
            <div><span>Email</span><p>{user.email}</p></div>
            <div><span>Status</span><p>{user.is_active ? "Active" : "Inactive"}</p></div>
            <div><span>Verified</span><p>{user.is_verified ? "Yes" : "No"}</p></div>
            <div><span>Created</span><p>{new Date(user.created_at).toLocaleString()}</p></div>
            <div><span>Updated</span><p>{new Date(user.updated_at).toLocaleString()}</p></div>
          </div>
        ) : (
          <p>No user data found</p>
        )}

        <button className="change-btn" onClick={() => navigate('changepassword')}>
          Change Password
        </button>
      </div>

      {isProfileOpen && (
        <div className="modal-overlay">
          <Outlet />
        </div>
      )}
    </div>
  )
}

export default Profile
