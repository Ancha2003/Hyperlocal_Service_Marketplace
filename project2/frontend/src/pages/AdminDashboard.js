import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const dashboardRes = await adminAPI.getDashboard();
      setStats(dashboardRes.data.stats);
      setBookings(dashboardRes.data.recentBookings || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await adminAPI.getServices();
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await adminAPI.getBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) {
      fetchUsers();
    } else if (tab === 'services' && services.length === 0) {
      fetchServices();
    } else if (tab === 'bookings' && activeTab !== 'overview') {
      fetchAllBookings();
    }
  };

  const handleUserStatusUpdate = async (userId, isVerified) => {
    try {
      await adminAPI.updateUserStatus(userId, { isVerified });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleServiceStatusUpdate = async (serviceId, isActive) => {
    try {
      await adminAPI.updateServiceStatus(serviceId, { isActive });
      fetchServices();
    } catch (error) {
      console.error('Failed to update service status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await adminAPI.deleteService(serviceId);
        fetchServices();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      'in-progress': 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return `status-badge ${statusClasses[status] || 'status-pending'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage your platform</p>
        </div>

        <div className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          <button
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            Users
          </button>
          <button
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleTabChange('services')}
          >
            Services
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            Bookings
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalProviders || 0}</div>
                <div className="stat-label">Service Providers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalServices || 0}</div>
                <div className="stat-label">Total Services</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.totalBookings || 0}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.completedBookings || 0}</div>
                <div className="stat-label">Completed Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.pendingBookings || 0}</div>
                <div className="stat-label">Pending Bookings</div>
              </div>
            </div>

            <div className="recent-bookings">
              <h3>Recent Bookings</h3>
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking._id} className="booking-item">
                  <div className="booking-info">
                    <div className="booking-service">{booking.service?.name}</div>
                    <div className="booking-customer">
                      {booking.user?.name} → {booking.provider?.name}
                    </div>
                    <div className="booking-date">
                      {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                    </div>
                  </div>
                  <div className="booking-status">
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <h3>User Management</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`status-badge ${user.isVerified ? 'status-completed' : 'status-pending'}`}>
                          {user.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleUserStatusUpdate(user._id, !user.isVerified)}
                            className={`btn btn-sm ${user.isVerified ? 'btn-secondary' : 'btn-success'}`}
                          >
                            {user.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <h3>Service Management</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Provider</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td>{service.name}</td>
                      <td>{service.provider?.name}</td>
                      <td>
                        <span className="category-badge">
                          {service.category}
                        </span>
                      </td>
                      <td>${service.price}</td>
                      <td>
                        <div className="rating-display">
                          <span className="rating-stars">
                            {'★'.repeat(Math.floor(service.rating?.average || 0))}
                            {'☆'.repeat(5 - Math.floor(service.rating?.average || 0))}
                          </span>
                          <span>({service.rating?.count || 0})</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${service.isActive ? 'status-completed' : 'status-cancelled'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleServiceStatusUpdate(service._id, !service.isActive)}
                            className={`btn btn-sm ${service.isActive ? 'btn-secondary' : 'btn-success'}`}
                          >
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <h3>Booking Management</h3>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-service">
                      <h4>{booking.service?.name}</h4>
                      <p>{booking.user?.name} → {booking.provider?.name}</p>
                    </div>
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <div className="booking-date">
                      {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                    </div>
                    <div className="booking-address">
                      {booking.address.street}, {booking.address.city}
                    </div>
                    <div className="booking-amount">${booking.totalAmount}</div>
                  </div>
                  {booking.rating && booking.rating.score && (
                    <div className="booking-rating">
                      <span className="rating-stars">
                        {'★'.repeat(booking.rating.score)}
                        {'☆'.repeat(5 - booking.rating.score)}
                      </span>
                      {booking.rating.review && (
                        <span className="rating-review">"{booking.rating.review}"</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

