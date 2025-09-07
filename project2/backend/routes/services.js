const express = require('express');
const Service = require('../models/Service');
const { auth, providerAuth } = require('../middleware/auth');

const router = express.Router();

// Get all services with filtering and search
router.get('/', async (req, res) => {
  try {
    const { category, search, lat, lng, radius = 10 } = req.query;
    let query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let services = await Service.find(query)
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 });

    // Location-based filtering
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      services = services.filter(service => {
        if (!service.serviceArea || !service.serviceArea.center) return true;
        
        const distance = calculateDistance(
          userLat, userLng,
          service.serviceArea.center.lat,
          service.serviceArea.center.lng
        );
        
        return distance <= Math.min(service.serviceArea.radius, maxRadius);
      });
    }

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone profileImage');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({
      success: true,
      service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
});

// Create new service (Provider only)
router.post('/', providerAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      duration,
      availability,
      serviceArea,
      images
    } = req.body;

    const service = new Service({
      name,
      description,
      category,
      price,
      duration,
      provider: req.user._id,
      availability,
      serviceArea,
      images
    });

    await service.save();
    await service.populate('provider', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error while creating service' });
  }
});

// Update service (Provider only)
router.put('/:id', providerAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the provider owns this service
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'name email phone');

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
});

// Delete service (Provider only)
router.delete('/:id', providerAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the provider owns this service
    if (service.provider.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error while deleting service' });
  }
});

// Get services by provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const services = await Service.find({ 
      provider: req.params.providerId,
      isActive: true 
    }).populate('provider', 'name email phone');

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({ message: 'Server error while fetching provider services' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;

