import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AuthActionTypes = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_UPDATE_PROFILE: 'AUTH_UPDATE_PROFILE',
  AUTH_CLEAR_ERROR: 'AUTH_CLEAR_ERROR',
  AUTH_SET_LOADING: 'AUTH_SET_LOADING',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case AuthActionTypes.AUTH_LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.AUTH_UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case AuthActionTypes.AUTH_CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.AUTH_SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AuthActionTypes.AUTH_SET_LOADING, payload: true });

      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          // Verify token with server
          const response = await authAPI.getProfile();
          
          dispatch({
            type: AuthActionTypes.AUTH_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          });
        } else {
          dispatch({ type: AuthActionTypes.AUTH_SET_LOADING, payload: false });
        }
      } catch (error) {
        // Token is invalid, clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: AuthActionTypes.AUTH_SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AuthActionTypes.AUTH_START });

    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AuthActionTypes.AUTH_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.name}!`);
      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      dispatch({
        type: AuthActionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AuthActionTypes.AUTH_START });

    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({
        type: AuthActionTypes.AUTH_SUCCESS,
        payload: { user, token },
      });

      toast.success(`Welcome to Modern Todo, ${user.name}!`);
      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({
        type: AuthActionTypes.AUTH_FAILURE,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage, errors: error.errors };
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    dispatch({ type: AuthActionTypes.AUTH_LOGOUT });
    toast.success('Logged out successfully');
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.user;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      dispatch({
        type: AuthActionTypes.AUTH_UPDATE_PROFILE,
        payload: updatedUser,
      });

      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AuthActionTypes.AUTH_CLEAR_ERROR });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;

      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: AuthActionTypes.AUTH_UPDATE_PROFILE,
        payload: user,
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh user data';
      return { success: false, error: errorMessage };
    }
  };

  // Check if user has specific permission (for future use)
  const hasPermission = (permission) => {
    if (!state.user) return false;
    // Add permission logic here if needed
    return true;
  };

  // Get user's preferred theme
  const getUserTheme = () => {
    return state.user?.preferences?.theme || 'light';
  };

  // Context value
  const value = {
    // State
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshUser,
    hasPermission,
    getUserTheme,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login will be handled by routing
      return null;
    }

    return <Component {...props} />;
  };
};

export default AuthContext;