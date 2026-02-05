import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import './assets/css/homepage.css'

const Homepage = () => {
  return (
    <div className="home-page">
      <div className="home-layout">
        <div className="home-card">
          <h1>Welcome 👋</h1>
          <p>Please choose an option</p>

          <div className="home-links">
            <Link to="/register" className="home-btn register-btn">Register</Link>
            <Link to="/login" className="home-btn login-btn">Login</Link>
          </div>
        </div>

        <div className="home-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Homepage
