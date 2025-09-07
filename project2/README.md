# ServiceHub - Hyperlocal Service Marketplace

A comprehensive full-stack web application for connecting customers with local service providers. Built with React.js frontend and Node.js/Express backend with MongoDB database.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: Secure registration/login for customers, service providers, and admins
- **Service Management**: Providers can create, edit, and manage their services
- **Booking System**: Customers can book services with date/time selection
- **Payment Integration**: Mock payment system with Stripe-like interface (demo mode)
- **Rating & Reviews**: Customers can rate and review completed services
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Real-time Notifications**: Status updates for bookings and services

### User Roles
1. **Customers**: Browse services, make bookings, manage appointments, rate services
2. **Service Providers**: Manage services, handle bookings, track earnings
3. **Administrators**: Oversee platform operations, manage users and services

### Service Categories
- 🔧 Plumbing
- ⚡ Electrical
- 💄 Beauty
- 🧹 Cleaning
- 🔨 Repair
- 🛠️ Other

## 🛠 Technology Stack

### Frontend
- **React.js** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Custom responsive styling
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **nodemon** - Development server auto-restart
- **dotenv** - Environment variable management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project1
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with the following variables:
# MONGODB_URI=mongodb://localhost:27017/servicehub
# JWT_SECRET=your_jwt_secret_key_here
# PORT=5000
# NODE_ENV=development

# Start MongoDB service
sudo systemctl start mongod

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the React development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
project1/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   └── Booking.js
│   ├── routes/          # API endpoints
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── bookings.js
│   │   ├── admin.js
│   │   └── payment.js
│   ├── middleware/      # Custom middleware
│   │   └── auth.js
│   ├── server.js        # Main server file
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── PaymentForm.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/       # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Services.js
│   │   │   ├── ServiceDetail.js
│   │   │   ├── BookingHistory.js
│   │   │   ├── Payment.js
│   │   │   ├── ProviderDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── contexts/    # React contexts
│   │   │   └── AuthContext.js
│   │   ├── services/    # API service functions
│   │   │   ├── api.js
│   │   │   └── paymentAPI.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service (providers only)
- `PUT /api/services/:id` - Update service (providers only)
- `DELETE /api/services/:id` - Delete service (providers only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/rating` - Add rating to booking

### Payment
- `POST /api/payment/create-payment-intent` - Create payment intent
- `POST /api/payment/confirm-payment` - Confirm payment
- `GET /api/payment/payment-status/:bookingId` - Get payment status

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/services` - Get all services
- `GET /api/admin/bookings` - Get all bookings

## 👥 User Accounts

### Test Accounts
After running the application, you can create test accounts:

1. **Service Provider Account**:
   - Register with "Service Provider" account type
   - Access provider dashboard to manage services
   - Create and manage service offerings

2. **Customer Account**:
   - Register with "Customer" account type
   - Browse and book services
   - Manage bookings and payments

3. **Admin Account**:
   - Create admin account through database or registration
   - Access comprehensive admin dashboard
   - Manage users, services, and bookings

## 💳 Payment System

The application includes a **mock payment system** for demonstration purposes:
- Simulates real payment processing flow
- No actual payment processing occurs
- 90% success rate for demo purposes
- Includes payment methods, confirmation, and refund simulation

## 🎨 Features Highlights

### Responsive Design
- Mobile-first approach
- Optimized for all screen sizes
- Touch-friendly interface

### User Experience
- Intuitive navigation
- Real-time form validation
- Loading states and error handling
- Success/failure feedback

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Input validation and sanitization

## 🚀 Deployment

### Production Deployment
1. Set up production MongoDB database
2. Configure environment variables for production
3. Build the React application: `npm run build`
4. Deploy backend to cloud service (Heroku, AWS, etc.)
5. Deploy frontend to static hosting (Netlify, Vercel, etc.)

### Environment Variables
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/servicehub
JWT_SECRET=your_production_jwt_secret
PORT=5000
NODE_ENV=production

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Manual Testing Checklist
- [x] User registration and login
- [x] Service browsing and filtering
- [x] Booking creation and management
- [x] Payment flow simulation
- [x] Provider dashboard functionality
- [x] Admin panel operations
- [x] Responsive design on mobile devices

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with full marketplace functionality
- User authentication and authorization
- Service management and booking system
- Payment integration (mock)
- Admin dashboard
- Responsive design

---

**Built with ❤️ for connecting communities with local service providers**

