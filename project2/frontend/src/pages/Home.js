import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedServices();
  }, []);

  const fetchFeaturedServices = async () => {
    try {
      const response = await servicesAPI.getAll({ limit: 6 });
      setFeaturedServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to fetch featured services:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'Plumbing', icon: '🔧', category: 'plumbing' },
    { name: 'Electrical', icon: '⚡', category: 'electrical' },
    { name: 'Beauty', icon: '💄', category: 'beauty' },
    { name: 'Cleaning', icon: '🧹', category: 'cleaning' },
    { name: 'Repair', icon: '🔨', category: 'repair' },
    { name: 'Other', icon: '🛠️', category: 'other' }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find Local Service Professionals
            </h1>
            <p className="hero-subtitle">
              Book trusted professionals for home services, beauty treatments, and more. 
              Get quality service at your doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/services" className="btn btn-primary btn-large">
                Browse Services
              </Link>
              <Link to="/register" className="btn btn-outline btn-large">
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">Popular Categories</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/services?category=${category.category}`}
                className="category-card"
              >
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="featured-services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Services</h2>
            <Link to="/services" className="view-all-link">
              View All Services →
            </Link>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="services-grid">
              {featuredServices.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>
                    <div className="service-price">${service.price}</div>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-meta">
                    <span className="service-category">{service.category}</span>
                    <span className="service-duration">{service.duration} min</span>
                  </div>
                  <div className="service-provider">
                    <span>By {service.provider?.name}</span>
                  </div>
                  <div className="service-rating">
                    <span className="rating-stars">
                      {'★'.repeat(Math.floor(service.rating?.average || 0))}
                      {'☆'.repeat(5 - Math.floor(service.rating?.average || 0))}
                    </span>
                    <span className="rating-count">
                      ({service.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <Link 
                    to={`/services/${service._id}`}
                    className="btn btn-primary btn-small"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Browse Services</h3>
              <p className="step-description">
                Find the service you need from our wide range of categories
              </p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Book Appointment</h3>
              <p className="step-description">
                Choose your preferred time and provide your address details
              </p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Get Service</h3>
              <p className="step-description">
                Professional arrives at your location and completes the service
              </p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3 className="step-title">Rate & Review</h3>
              <p className="step-description">
                Share your experience to help others make informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

