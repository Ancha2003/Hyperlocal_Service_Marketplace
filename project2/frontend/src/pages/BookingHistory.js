import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './BookingHistory.css';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    score: 5,
    review: ''
  });
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = user.role === 'provider' 
        ? await bookingsAPI.getProviderBookings()
        : await bookingsAPI.getUserBookings();
      
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancel(bookingId);
        fetchBookings(); // Refresh the list
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingLoading(true);

    try {
      await bookingsAPI.addRating(selectedBooking._id, ratingData);
      setShowRatingModal(false);
      setSelectedBooking(null);
      setRatingData({ score: 5, review: '' });
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setRatingLoading(false);
    }
  };

  const openRatingModal = (booking) => {
    setSelectedBooking(booking);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedBooking(null);
    setRatingData({ score: 5, review: '' });
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <div className="booking-history">
      <div className="container">
        <div className="page-header">
          <h1>
            {user.role === 'provider' ? 'My Service Bookings' : 'My Bookings'}
          </h1>
          <p>
            {user.role === 'provider' 
              ? 'Manage your service appointments' 
              : 'Track your service appointments'
            }
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📅</div>
            <h3>No bookings found</h3>
            <p>
              {user.role === 'provider' 
                ? 'You haven\'t received any bookings yet.' 
                : 'You haven\'t made any bookings yet.'
              }
            </p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-service">
                    <h3>{booking.service?.name}</h3>
                    <p>{booking.service?.description}</p>
                  </div>
                  <div className="booking-status">
                    <span className={getStatusBadgeClass(booking.status)}>
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="booking-info">
                    <div className="info-item">
                      <span className="info-label">Date & Time:</span>
                      <span className="info-value">
                        {formatDate(booking.scheduledDate)} at {booking.scheduledTime}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">
                        {user.role === 'provider' ? 'Customer:' : 'Provider:'}
                      </span>
                      <span className="info-value">
                        {user.role === 'provider' 
                          ? booking.user?.name 
                          : booking.provider?.name
                        }
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Address:</span>
                      <span className="info-value">
                        {booking.address.street}, {booking.address.city}, {booking.address.state} {booking.address.zipCode}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value price">${booking.totalAmount}</span>
                    </div>

                    {booking.notes && (
                      <div className="info-item">
                        <span className="info-label">Notes:</span>
                        <span className="info-value">{booking.notes}</span>
                      </div>
                    )}

                    {booking.rating && booking.rating.score && (
                      <div className="info-item">
                        <span className="info-label">Rating:</span>
                        <span className="info-value">
                          <div className="rating-display">
                            <span className="rating-stars">
                              {'★'.repeat(booking.rating.score)}
                              {'☆'.repeat(5 - booking.rating.score)}
                            </span>
                            {booking.rating.review && (
                              <span className="rating-review">"{booking.rating.review}"</span>
                            )}
                          </div>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="booking-actions">
                  {user.role === 'provider' ? (
                    // Provider actions
                    <>
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
                          Complete Service
                        </button>
                      )}
                    </>
                  ) : (
                    // Customer actions
                    <>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel Booking
                        </button>
                      )}
                      {booking.status === 'completed' && !booking.rating?.score && (
                        <button
                          onClick={() => openRatingModal(booking)}
                          className="btn btn-primary btn-sm"
                        >
                          Rate Service
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Rate Your Service</h3>
                <button onClick={closeRatingModal} className="modal-close">×</button>
              </div>
              
              <form onSubmit={handleRatingSubmit} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= ratingData.score ? 'active' : ''}`}
                        onClick={() => setRatingData({ ...ratingData, score: star })}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={ratingData.review}
                    onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                    placeholder="Share your experience..."
                    rows="4"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={closeRatingModal}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={ratingLoading}
                  >
                    {ratingLoading ? 'Submitting...' : 'Submit Rating'}
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

export default BookingHistory;

