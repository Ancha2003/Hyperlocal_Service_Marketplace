import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/paymentAPI';
import './PaymentForm.css';

const PaymentForm = ({ booking, onPaymentSuccess, onPaymentError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initializePayment();
    fetchPaymentMethods();
  }, []);

  const initializePayment = async () => {
    try {
      const response = await paymentAPI.createPaymentIntent(booking._id);
      setPaymentIntent(response.data.paymentIntent);
    } catch (error) {
      setError('Failed to initialize payment');
      console.error('Payment initialization error:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.data.paymentMethods || []);
      if (response.data.paymentMethods?.length > 0) {
        setSelectedPaymentMethod(response.data.paymentMethods[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await paymentAPI.confirmPayment({
        bookingId: booking._id,
        paymentIntentId: paymentIntent.id,
        paymentMethodId: selectedPaymentMethod
      });

      if (response.data.success) {
        onPaymentSuccess(response.data.booking);
      } else {
        setError(response.data.message || 'Payment failed');
        onPaymentError(response.data.message || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment processing failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!paymentIntent) {
    return (
      <div className="payment-form">
        <div className="loading">
          <div className="spinner"></div>
          <p>Initializing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <div className="payment-header">
        <h3>Complete Your Payment</h3>
        <p>Secure payment processing</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="payment-summary">
        <div className="summary-item">
          <span>Service:</span>
          <span>{booking.service?.name}</span>
        </div>
        <div className="summary-item">
          <span>Provider:</span>
          <span>{booking.provider?.name}</span>
        </div>
        <div className="summary-item">
          <span>Date & Time:</span>
          <span>
            {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
          </span>
        </div>
        <div className="summary-item total">
          <span>Total Amount:</span>
          <span>${booking.totalAmount}</span>
        </div>
      </div>

      <form onSubmit={handlePaymentSubmit} className="payment-form-content">
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div className="payment-methods">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method-option">
                <input
                  type="radio"
                  id={method.id}
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedPaymentMethod === method.id}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <label htmlFor={method.id} className="payment-method-label">
                  <div className="payment-method-info">
                    <span className="card-brand">{method.card.brand.toUpperCase()}</span>
                    <span className="card-number">**** **** **** {method.card.last4}</span>
                    <span className="card-expiry">
                      {method.card.exp_month}/{method.card.exp_year}
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-notice">
          <div className="demo-icon">ℹ️</div>
          <div className="demo-text">
            <strong>Demo Mode:</strong> This is a simulated payment system for demonstration purposes. 
            No real payment will be processed.
          </div>
        </div>

        <div className="payment-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !selectedPaymentMethod}
          >
            {loading ? (
              <>
                <div className="btn-spinner"></div>
                Processing...
              </>
            ) : (
              `Pay $${booking.totalAmount}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;

