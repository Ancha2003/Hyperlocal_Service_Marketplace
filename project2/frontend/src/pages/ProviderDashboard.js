import React, { useState, useEffect } from 'react';
import { servicesAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    category: 'plumbing',
    price: '',
    duration: '',
    availability: [],
    serviceArea: {
      radius: '',
      center: { lat: '', lng: '' }
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        servicesAPI.getByProvider(user.id),
        bookingsAPI.getProviderBookings()
      ]);
      
      setServices(servicesRes.data.services || []);
      setBookings(bookingsRes.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('serviceArea.')) {
      const field = name.split('.')[1];
      if (field === 'center') {
        const centerField = name.split('.')[2];
        setServiceFormData({
          ...serviceFormData,
          serviceArea: {
            ...serviceFormData.serviceArea,
            center: {
              ...serviceFormData.serviceArea.center,
              [centerField]: value
            }
          }
        });
      } else {
        setServiceFormData({
          ...serviceFormData,
          serviceArea: {
            ...serviceFormData.serviceArea,
            [field]: value
          }
        });
      }
    } else {
      setServiceFormData({
        ...serviceFormData,
        [name]: value
      });
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const serviceData = {
        ...serviceFormData,
        price: parseFloat(serviceFormData.price),
        duration: parseInt(serviceFormData.duration),
        serviceArea: {
          radius: parseFloat(serviceFormData.serviceArea.radius),
          center: {
            lat: parseFloat(serviceFormData.serviceArea.center.lat),
            lng: parseFloat(serviceFormData.serviceArea.center.lng)
          }
        }
      };

      if (editingService) {
        await servicesAPI.update(editingService._id, serviceData);
      } else {
        await servicesAPI.create(serviceData);
      }

      setShowServiceForm(false);
      setEditingService(null);
      resetServiceForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save service:', error);
    }
  };

  const resetServiceForm = () => {
    setServiceFormData({
      name: '',
      description: '',
      category: 'plumbing',
      price: '',
      duration: '',
      availability: [],
      serviceArea: {
        radius: '',
        center: { lat: '', lng: '' }
      }
    });
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price.toString(),
      duration: service.duration.toString(),
      availability: service.availability || [],
      serviceArea: {
        radius: service.serviceArea?.radius?.toString() || '',
        center: {
          lat: service.serviceArea?.center?.lat?.toString() || '',
          lng: service.serviceArea?.center?.lng?.toString() || ''
        }
      }
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(serviceId);
        fetchData();
      } catch (error) {
        console.error('Failed to delete service:', error);
      }
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
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

  // Calculate stats
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

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
          <h1>Provider Dashboard</h1>
          <p>Welcome back, {user.name}!</p>
        </div>

        <div className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            My Services
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{services.length}</div>
                <div className="stat-label">Active Services</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{pendingBookings}</div>
                <div className="stat-label">Pending Bookings</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">${totalRevenue}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
            </div>

            <div className="recent-bookings">
              <h3>Recent Bookings</h3>
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="booking-item">
                  <div className="booking-info">
                    <div className="booking-service">{booking.service?.name}</div>
                    <div className="booking-customer">{booking.user?.name}</div>
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

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="tab-header">
              <h3>My Services</h3>
              <button
                onClick={() => {
                  resetServiceForm();
                  setEditingService(null);
                  setShowServiceForm(true);
                }}
                className="btn btn-primary"
              >
                Add New Service
              </button>
            </div>

            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <h4>{service.name}</h4>
                    <div className="service-price">${service.price}</div>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-meta">
                    <span className="service-category">{service.category}</span>
                    <span className="service-duration">{service.duration} min</span>
                  </div>
                  <div className="service-rating">
                    <span className="rating-stars">
                      {'★'.repeat(Math.floor(service.rating?.average || 0))}
                      {'☆'.repeat(5 - Math.floor(service.rating?.average || 0))}
                    </span>
                    <span>({service.rating?.count || 0} reviews)</span>
                  </div>
                  <div className="service-actions">
                    <button
                      onClick={() => handleEditService(service)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-tab">
            <h3>All Bookings</h3>
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div className="booking-service">
                      <h4>{booking.service?.name}</h4>
                      <p>Customer: {booking.user?.name}</p>
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
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="btn btn-success btn-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          className="btn btn-danger btn-sm"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'in-progress')}
                        className="btn btn-primary btn-sm"
                      >
                        Start Service
                      </button>
                    )}
                    {booking.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="btn btn-success btn-sm"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                <button
                  onClick={() => {
                    setShowServiceForm(false);
                    setEditingService(null);
                    resetServiceForm();
                  }}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleServiceSubmit} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={serviceFormData.name}
                    onChange={handleServiceFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    value={serviceFormData.description}
                    onChange={handleServiceFormChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      name="category"
                      className="form-select"
                      value={serviceFormData.category}
                      onChange={handleServiceFormChange}
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="beauty">Beauty</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="repair">Repair</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      value={serviceFormData.price}
                      onChange={handleServiceFormChange}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      name="duration"
                      className="form-input"
                      value={serviceFormData.duration}
                      onChange={handleServiceFormChange}
                      required
                      min="15"
                      step="15"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                      resetServiceForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;

