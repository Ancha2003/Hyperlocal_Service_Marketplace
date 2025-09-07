import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';
import PaymentForm from '../components/PaymentForm';
import { useAuth } from '../contexts/AuthContext';
import './Payment.css';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBooking();
  }, [bookingId, user, navigate]);

  const fetchBooking = async () => {
    try {
      const response = await bookingsAPI.getById(bookingId);
      const bookingData = response.data.booking;
      
      // Check if booking belongs to current user
      if (bookingData.user._id !== user.id) {
        setError('Access denied');
        return;
      }

      // Check if payment is already completed
      if (bookingData.paymentStatus === 'paid') {
        setPaymentSuccess(true);
        setBooking(bookingData);
        return;
      }

      // Check if booking is still valid for payment
      if (bookingData.status === 'cancelled') {
        setError('This booking has been cancelled');
        return;
      }

      setBooking(bookingData);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      setError('Booking not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedBooking) => {
    setBooking(updatedBooking);
    setPaymentSuccess(true);
    
    // Redirect to booking history after 3 seconds
    setTimeout(() => {
      navigate('/bookings');
    }, 3000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleCancel = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/bookings')} className="btn btn-primary">
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your booking has been confirmed and payment processed.</p>
            
            <div className="booking-details">
              <h3>Booking Details</h3>
              <div className="detail-item">
                <span>Service:</span>
                <span>{booking.service?.name}</span>
              </div>
              <div className="detail-item">
                <span>Provider:</span>
                <span>{booking.provider?.name}</span>
              </div>
              <div className="detail-item">
                <span>Date & Time:</span>
                <span>
                  {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                </span>
              </div>
              <div className="detail-item">
                <span>Amount Paid:</span>
                <span className="amount">${booking.totalAmount}</span>
              </div>
              <div className="detail-item">
                <span>Payment Status:</span>
                <span className="status-paid">Paid</span>
              </div>
            </div>

            <div className="next-steps">
              <h4>What's Next?</h4>
              <ul>
                <li>You will receive a confirmation email shortly</li>
                <li>The service provider will contact you to confirm the appointment</li>
                <li>You can track your booking status in your dashboard</li>
              </ul>
            </div>

            <div className="success-actions">
              <button onClick={() => navigate('/bookings')} className="btn btn-primary">
                View My Bookings
              </button>
              <button onClick={() => navigate('/')} className="btn btn-outline">
                Back to Home
              </button>
            </div>

            <p className="redirect-notice">
              You will be redirected to your bookings in a few seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          <div className="payment-header">
            <h1>Complete Your Payment</h1>
            <p>Secure and easy payment processing</p>
          </div>

          <PaymentForm
            booking={booking}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default Payment;

