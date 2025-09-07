import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { servicesAPI } from '../services/api';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'repair', label: 'Repair' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchServices();
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      
      const response = await servicesAPI.getAll(params);
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    if (newFilters.search) newSearchParams.set('search', newFilters.search);
    if (newFilters.category) newSearchParams.set('category', newFilters.category);
    setSearchParams(newSearchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchServices();
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', location: '' });
    setSearchParams({});
  };

  return (
    <div className="services-page">
      <div className="container">
        <div className="page-header">
          <h1>Find Services</h1>
          <p>Discover professional services in your area</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search services..."
                className="search-input"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
          </form>

          <div className="filter-controls">
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {(filters.search || filters.category) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          <div className="results-header">
            <h2>
              {loading ? 'Loading...' : `${services.length} Services Found`}
            </h2>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No services found</h3>
              <p>Try adjusting your search criteria or browse all categories.</p>
              <button onClick={clearFilters} className="btn btn-primary">
                View All Services
              </button>
            </div>
          ) : (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-header">
                    <h3 className="service-name">{service.name}</h3>
                    <div className="service-price">${service.price}</div>
                  </div>
                  
                  <p className="service-description">{service.description}</p>
                  
                  <div className="service-meta">
                    <span className="service-category">
                      {service.category}
                    </span>
                    <span className="service-duration">
                      {service.duration} min
                    </span>
                  </div>
                  
                  <div className="service-provider">
                    <div className="provider-info">
                      <span className="provider-name">
                        {service.provider?.name}
                      </span>
                      <span className="provider-contact">
                        {service.provider?.phone}
                      </span>
                    </div>
                  </div>
                  
                  <div className="service-rating">
                    <div className="rating-stars">
                      {'★'.repeat(Math.floor(service.rating?.average || 0))}
                      {'☆'.repeat(5 - Math.floor(service.rating?.average || 0))}
                    </div>
                    <span className="rating-text">
                      {service.rating?.average?.toFixed(1) || '0.0'} ({service.rating?.count || 0} reviews)
                    </span>
                  </div>
                  
                  <div className="service-actions">
                    <Link 
                      to={`/services/${service._id}`}
                      className="btn btn-primary btn-full"
                    >
                      View Details & Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;

