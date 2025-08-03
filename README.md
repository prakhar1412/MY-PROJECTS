# 🚀 Modern Todo App

A beautiful, feature-rich, and highly functional task management application built with modern web technologies. This application offers both essential and advanced features to help users efficiently manage their tasks with an intuitive and responsive design.

![Modern Todo App](https://img.shields.io/badge/Status-Completed-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## ✨ Features

### Core Functionality
- **🎯 Task Management**: Complete CRUD operations for tasks with titles and descriptions
- **📂 Task Organization**: Categorize tasks (Home, Work, Personal) with due dates and optional time specifications
- **⭐ Task Prioritization**: Assign priority levels (High, Medium, Low) with visual indicators
- **🔐 User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

### Advanced Features
- **✅ Subtasks/Checklists**: Create complex task hierarchies with subtasks
- **🔔 Task Reminders**: Email notifications for upcoming tasks with customizable preferences
- **🔍 Sorting & Filtering**: Powerful tools to sort by due date, priority, or creation date
- **🔎 Search Functionality**: Robust search across task titles, descriptions, and tags
- **📊 Productivity Metrics**: Comprehensive analytics dashboard with insights and recommendations

### User Interface & Experience
- **🌊 Animated Background**: Subtle particle effects and floating geometric shapes using Three.js
- **🎨 Intuitive Layout**: Clean, minimalist design with drag-and-drop task reordering
- **🌙 Theme Support**: Light and dark mode with user preferences
- **🎭 Consistent Aesthetics**: Modern design system with smooth animations

### Technical Features
- **🔧 RESTful API**: Well-documented and scalable backend architecture
- **⚡ Real-time Updates**: Optimistic UI updates for instant feedback
- **🛡️ Security**: Rate limiting, input validation, and secure headers
- **🎭 Error Handling**: Comprehensive error handling with user-friendly messages
- **📈 Performance**: Optimized queries, caching, and lazy loading

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern UI library with hooks and concurrent features
- **React Router v6** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Three.js & React Three Fiber** - 3D animated backgrounds
- **Axios** - HTTP client for API communication
- **React Hot Toast** - Beautiful notification system
- **React Beautiful DnD** - Drag and drop functionality
- **React DatePicker** - Date and time selection
- **Recharts** - Data visualization and analytics charts

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB & Mongoose** - Database and ODM
- **JSON Web Tokens (JWT)** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **Node-cron** - Task scheduling
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple scripts
- **Nodemon** - Development server auto-restart

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/modern-todo-app.git
   cd modern-todo-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create server environment file:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/modern-todo-app
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

## 📁 Project Structure

```
modern-todo-app/
├── client/                          # React frontend
│   ├── public/                      # Static files
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── common/              # Common UI components
│   │   │   ├── layout/              # Layout components
│   │   │   └── tasks/               # Task-specific components
│   │   ├── contexts/                # React contexts
│   │   ├── hooks/                   # Custom hooks
│   │   ├── pages/                   # Page components
│   │   ├── utils/                   # Utility functions
│   │   ├── App.js                   # Main app component
│   │   ├── index.js                 # Entry point
│   │   └── index.css                # Global styles
│   └── package.json
├── server/                          # Node.js backend
│   ├── config/                      # Configuration files
│   ├── middleware/                  # Custom middleware
│   ├── models/                      # MongoDB models
│   ├── routes/                      # API routes
│   ├── services/                    # Business logic services
│   ├── index.js                     # Server entry point
│   └── package.json
├── package.json                     # Root package.json
└── README.md
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Task Endpoints
- `GET /api/tasks` - Get all tasks (with filtering and pagination)
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PUT /api/tasks/reorder` - Reorder tasks

### Subtask Endpoints
- `POST /api/tasks/:id/subtasks` - Add subtask
- `PUT /api/tasks/:id/subtasks/:subtaskId` - Update subtask
- `DELETE /api/tasks/:id/subtasks/:subtaskId` - Delete subtask

### Category Endpoints
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics Endpoints
- `GET /api/analytics/overview` - Overview statistics
- `GET /api/analytics/productivity` - Productivity metrics
- `GET /api/analytics/insights` - AI-powered insights
- `GET /api/analytics/time-tracking` - Time tracking data

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  preferences: {
    theme: String ('light' | 'dark'),
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    defaultCategory: String
  },
  avatar: String,
  lastLogin: Date
}
```

### Task Schema
```javascript
{
  title: String,
  description: String,
  completed: Boolean,
  priority: String ('low' | 'medium' | 'high'),
  category: String,
  dueDate: Date,
  dueTime: String,
  reminderDate: Date,
  subtasks: [SubtaskSchema],
  tags: [String],
  userId: ObjectId,
  order: Number,
  estimatedDuration: Number,
  actualDuration: Number,
  notes: String
}
```

### Category Schema
```javascript
{
  name: String,
  color: String (hex color),
  icon: String,
  description: String,
  userId: ObjectId,
  isDefault: Boolean,
  order: Number
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Rate Limiting** - Prevents brute force attacks
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Controlled cross-origin requests
- **Security Headers** - Helmet.js for security headers
- **Environment Variables** - Sensitive data protection

## 🎨 Design System

The application uses a comprehensive design system with:
- **CSS Custom Properties** - Consistent theming
- **Typography Scale** - Harmonious text sizing
- **Color Palette** - Accessible color combinations
- **Spacing System** - Consistent spacing units
- **Component Library** - Reusable UI components
- **Animation Library** - Smooth micro-interactions

## 📈 Performance Optimizations

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Responsive images and lazy loading
- **API Optimization** - Efficient database queries and pagination
- **Caching Strategy** - Local storage for user preferences
- **Bundle Optimization** - Webpack optimizations for production

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests (if implemented)
cd server && npm test

# Run all tests
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

### Deployment Options
- **Vercel/Netlify** - Frontend deployment
- **Heroku/Railway** - Full-stack deployment
- **AWS/DigitalOcean** - VPS deployment
- **Docker** - Containerized deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **MongoDB** - For the flexible database solution
- **Three.js** - For beautiful 3D graphics
- **Framer Motion** - For smooth animations
- **Open Source Community** - For the countless libraries that made this possible

## 📞 Support

If you have any questions or need help with setup, please:
- Create an issue on GitHub
- Email: support@moderntodoapp.com
- Documentation: [docs.moderntodoapp.com](https://docs.moderntodoapp.com)

---

**Built with ❤️ by the Modern Todo Team**

*Making task management beautiful, efficient, and enjoyable.*
