const express = require('express');
const Booking = require('../models/Booking');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Mock payment processing (for demo purposes)
// In production, you would integrate with Stripe, Razorpay, or other payment gateways

// Create payment intent (mock)
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mock payment intent creation
    const paymentIntent = {
      id: `pi_mock_${Date.now()}`,
      amount: booking.totalAmount * 100, // Convert to cents
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    };

    res.json({
      success: true,
      paymentIntent,
      publishableKey: 'pk_test_mock_key_for_demo' // Mock publishable key
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Confirm payment (mock)
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { bookingId, paymentIntentId, paymentMethodId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mock payment confirmation (always succeeds for demo)
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

    if (paymentSuccess) {
      // Update booking payment status
      booking.paymentStatus = 'paid';
      booking.paymentId = paymentIntentId;
      await booking.save();

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        booking
      });
    } else {
      // Mock payment failure
      booking.paymentStatus = 'failed';
      await booking.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        error: 'mock_payment_failure'
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Failed to process payment' });
  }
});

// Get payment status
router.get('/payment-status/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate('service', 'name price')
      .populate('user', 'name email')
      .populate('provider', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    if (booking.user._id.toString() !== req.user._id.toString() && 
        booking.provider._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      booking: {
        id: booking._id,
        service: booking.service,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

// Process refund (mock)
router.post('/refund', auth, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking is eligible for refund
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Booking is not paid or already refunded' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot refund completed bookings' });
    }

    // Mock refund processing (always succeeds for demo)
    booking.paymentStatus = 'refunded';
    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      booking
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
});

// Get payment methods (mock)
router.get('/payment-methods', auth, async (req, res) => {
  try {
    // Mock payment methods for demo
    const paymentMethods = [
      {
        id: 'pm_mock_card_visa',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025
        }
      },
      {
        id: 'pm_mock_card_mastercard',
        type: 'card',
        card: {
          brand: 'mastercard',
          last4: '5555',
          exp_month: 10,
          exp_year: 2024
        }
      }
    ];

    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Failed to get payment methods' });
  }
});

module.exports = router;

