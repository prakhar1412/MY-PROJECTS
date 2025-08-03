import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import AnimatedBackground from './components/AnimatedBackground';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LandingPage from './pages/LandingPage';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Custom hook for theme management
const useTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get theme from user preferences or localStorage
    const savedTheme = user?.preferences?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return { theme, toggleTheme };
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = ({ children }) => {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary text-primary transition-colors duration-300">
      {/* Animated Background */}
      <AnimatedBackground theme={theme} />
      
      {/* Navigation */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main 
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        } pt-16`}
      >
        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};

// Auth Layout for login/register pages
const AuthLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-primary text-primary transition-colors duration-300">
      <AnimatedBackground theme={theme} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Landing Layout for public pages
const LandingLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-primary text-primary transition-colors duration-300">
      <AnimatedBackground theme={theme} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Page Transition Wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-danger)',
                  secondary: 'white',
                },
              },
            }}
          />

          {/* Route Configuration */}
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Landing Page */}
              <Route 
                path="/" 
                element={
                  <LandingLayout>
                    <PageTransition>
                      <LandingPage />
                    </PageTransition>
                  </LandingLayout>
                } 
              />

              {/* Authentication Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <AuthLayout>
                      <PageTransition>
                        <LoginPage />
                      </PageTransition>
                    </AuthLayout>
                  </PublicRoute>
                } 
              />
              
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <AuthLayout>
                      <PageTransition>
                        <RegisterPage />
                      </PageTransition>
                    </AuthLayout>
                  </PublicRoute>
                } 
              />

              {/* Protected Application Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PageTransition>
                        <DashboardPage />
                      </PageTransition>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PageTransition>
                        <TasksPage />
                      </PageTransition>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PageTransition>
                        <AnalyticsPage />
                      </PageTransition>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PageTransition>
                        <SettingsPage />
                      </PageTransition>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;