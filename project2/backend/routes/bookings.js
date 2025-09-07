const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create new booking
router.post('/', auth, async (req, res) => {
  try {
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      address,
      notes
    } = req.body;

    // Find the service
    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      service: serviceId,
      provider: service.provider._id,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      address,
      totalAmount: service.price,
      notes
    });

    await booking.save();
    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'service', select: 'name description price duration' },
      { path: 'provider', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service', 'name description price duration')
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching bookings' });
  }
});

// Get provider's bookings
router.get('/provider-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Provider role required.' });
    }

    const bookings = await Booking.find({ provider: req.user._id })
      .populate('user', 'name email phone')
      .populate('service', 'name description price duration')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ message: 'Server error while fetching provider bookings' });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('service', 'name description price duration')
      .populate('provider', 'name email phone');

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
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error while fetching booking' });
  }
});

// Update booking status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to update status
    if (booking.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only provider can update booking status' });
    }

    booking.status = status;
    await booking.save();

    await booking.populate([
      { path: 'user', select: 'name email phone' },
      { path: 'service', select: 'name description price duration' },
      { path: 'provider', select: 'name email phone' }
    ]);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error while updating booking status' });
  }
});

// Add rating and review
router.post('/:id/rating', auth, async (req, res) => {
  try {
    const { score, review } = req.body;

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the customer can rate this booking' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    // Check if already rated
    if (booking.rating && booking.rating.score) {
      return res.status(400).json({ message: 'Booking already rated' });
    }

    // Add rating
    booking.rating = {
      score,
      review,
      createdAt: new Date()
    };

    await booking.save();

    // Update service rating
    const service = await Service.findById(booking.service);
    if (service) {
      const allRatings = await Booking.find({
        service: booking.service,
        'rating.score': { $exists: true }
      });

      const totalRatings = allRatings.length;
      const averageRating = allRatings.reduce((sum, b) => sum + b.rating.score, 0) / totalRatings;

      service.rating = {
        average: Math.round(averageRating * 10) / 10,
        count: totalRatings
      };

      await service.save();
    }

    res.json({
      success: true,
      message: 'Rating added successfully',
      booking
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error while adding rating' });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error while cancelling booking' });
  }
});

module.exports = router;

