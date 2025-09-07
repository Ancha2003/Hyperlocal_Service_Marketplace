import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            ServiceHub
          </Link>

          <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
            <div className="navbar-nav">
              <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/services" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              
              {user ? (
                <>
                  <Link to="/bookings" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                    My Bookings
                  </Link>
                  
                  {user.role === 'provider' && (
                    <Link to="/provider-dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                      Admin
                    </Link>
                  )}
                  
                  <div className="nav-user">
                    <span className="user-name">Hi, {user.name}</span>
                    <button onClick={handleLogout} className="btn btn-outline">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="nav-auth">
                  <Link to="/login" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button className="navbar-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

