import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { servicesAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || ''
    },
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const response = await servicesAPI.getById(id);
      setService(response.data.service);
    } catch (error) {
      console.error('Failed to fetch service:', error);
      setError('Service not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setBookingData({
        ...bookingData,
        address: {
          ...bookingData.address,
          [addressField]: value
        }
      });
    } else {
      setBookingData({
        ...bookingData,
        [name]: value
      });
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await bookingsAPI.create({
        serviceId: service._id,
        ...bookingData
      });

      setSuccess('Booking created successfully!');
      setShowBookingForm(false);
      
      // Redirect to payment page
      setTimeout(() => {
        navigate(`/payment/${response.data.booking._id}`);
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowBookingForm(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="container" style={{ paddingTop: '40px' }}>
        <div className="card text-center">
          <h2>Service Not Found</h2>
          <p>The service you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/services')} className="btn btn-primary">
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail">
      <div className="container">
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <div className="service-detail-content">
          <div className="service-main">
            <div className="service-header">
              <div className="service-title-section">
                <h1 className="service-title">{service.name}</h1>
                <div className="service-category-badge">
                  {service.category}
                </div>
              </div>
              <div className="service-price-section">
                <div className="service-price">${service.price}</div>
                <div className="service-duration">{service.duration} minutes</div>
              </div>
            </div>

            <div className="service-description">
              <h3>Description</h3>
              <p>{service.description}</p>
            </div>

            <div className="service-rating-section">
              <h3>Rating & Reviews</h3>
              <div className="rating-display">
                <div className="rating-stars">
                  {'★'.repeat(Math.floor(service.rating?.average || 0))}
                  {'☆'.repeat(5 - Math.floor(service.rating?.average || 0))}
                </div>
                <div className="rating-info">
                  <span className="rating-average">
                    {service.rating?.average?.toFixed(1) || '0.0'}
                  </span>
                  <span className="rating-count">
                    ({service.rating?.count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            {service.availability && service.availability.length > 0 && (
              <div className="availability-section">
                <h3>Availability</h3>
                <div className="availability-grid">
                  {service.availability.map((slot, index) => (
                    <div key={index} className="availability-slot">
                      <span className="day">{slot.day}</span>
                      <span className="time">{slot.startTime} - {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="service-sidebar">
            <div className="provider-card">
              <h3>Service Provider</h3>
              <div className="provider-info">
                <div className="provider-name">{service.provider?.name}</div>
                <div className="provider-contact">
                  <div>📧 {service.provider?.email}</div>
                  <div>📞 {service.provider?.phone}</div>
                </div>
              </div>
            </div>

            <div className="booking-card">
              <div className="booking-summary">
                <div className="summary-item">
                  <span>Service</span>
                  <span>{service.name}</span>
                </div>
                <div className="summary-item">
                  <span>Duration</span>
                  <span>{service.duration} min</span>
                </div>
                <div className="summary-item total">
                  <span>Total</span>
                  <span>${service.price}</span>
                </div>
              </div>

              {!showBookingForm ? (
                <button 
                  onClick={handleBookNow}
                  className="btn btn-primary btn-large btn-full"
                >
                  {user ? 'Book Now' : 'Login to Book'}
                </button>
              ) : (
                <div className="booking-form">
                  <h4>Book This Service</h4>
                  
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit}>
                    <div className="form-group">
                      <label className="form-label">Preferred Date</label>
                      <input
                        type="date"
                        name="scheduledDate"
                        className="form-input"
                        value={bookingData.scheduledDate}
                        onChange={handleBookingChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Time</label>
                      <input
                        type="time"
                        name="scheduledTime"
                        className="form-input"
                        value={bookingData.scheduledTime}
                        onChange={handleBookingChange}
                        required
                      />
                    </div>

                    <div className="form-section">
                      <h5>Service Address</h5>
                      
                      <div className="form-group">
                        <label className="form-label">Street Address</label>
                        <input
                          type="text"
                          name="address.street"
                          className="form-input"
                          value={bookingData.address.street}
                          onChange={handleBookingChange}
                          required
                          placeholder="Enter street address"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            name="address.city"
                            className="form-input"
                            value={bookingData.address.city}
                            onChange={handleBookingChange}
                            required
                            placeholder="City"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">State</label>
                          <input
                            type="text"
                            name="address.state"
                            className="form-input"
                            value={bookingData.address.state}
                            onChange={handleBookingChange}
                            required
                            placeholder="State"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">ZIP</label>
                          <input
                            type="text"
                            name="address.zipCode"
                            className="form-input"
                            value={bookingData.address.zipCode}
                            onChange={handleBookingChange}
                            required
                            placeholder="ZIP"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Additional Notes (Optional)</label>
                      <textarea
                        name="notes"
                        className="form-textarea"
                        value={bookingData.notes}
                        onChange={handleBookingChange}
                        placeholder="Any special instructions or requirements..."
                        rows="3"
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;

