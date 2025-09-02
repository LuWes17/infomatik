// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  OTP_START: 'OTP_START',
  OTP_SUCCESS: 'OTP_SUCCESS',
  OTP_FAILURE: 'OTP_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.OTP_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.OTP_SUCCESS:
      // Store tokens in localStorage
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
      
      console.log('Auth success - setting user:', action.payload.user);
      console.log('Auth success - setting authenticated to true');
      
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.OTP_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      // Clear tokens from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return {
        ...initialState,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Refresh token function (defined early to avoid hoisting issues)
  const refreshAuthToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }

    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      // Update token in localStorage
      localStorage.setItem('token', response.data.token);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
          refreshToken: refreshToken // Keep existing refresh token
        }
      });

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
  };

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          console.log('Loading user with existing token...');
          const response = await api.get('/auth/me');
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: response.data.data
          });
          
          console.log('User loaded successfully:', response.data.data);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Token might be expired, try to refresh
          const refreshed = await refreshAuthToken();
          if (!refreshed) {
            console.log('Token refresh failed, user needs to login again');
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          }
        }
      } else {
        console.log('No token found, setting loading to false');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await api.post('/auth/login', credentials);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  };

  // Enhanced register function with detailed error logging (kept for fallback)
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    console.log('AuthContext: Sending registration data:', userData);
    
    try {
      const response = await api.post('/auth/register', userData);
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.log('=== BACKEND ERROR DETAILS ===');
      console.log('Status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      
      // Log detailed validation errors if available
      if (error.response?.data?.errors) {
        console.log('Specific validation errors:');
        error.response.data.errors.forEach((err, index) => {
          console.log(`${index + 1}. Field: "${err.field}", Message: "${err.message}", Value: "${err.value}"`);
        });
      }
      
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });

      return { 
        success: false, 
        error: errorMessage,
        validationErrors: error.response?.data?.errors || []
      };
    }
  };

  // Send OTP function
  const sendOTP = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.OTP_START });
    
    try {
      const response = await api.post('/auth/send-otp', userData);
      
      // Don't dispatch success here as user isn't registered yet
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP';
      
      dispatch({
        type: AUTH_ACTIONS.OTP_FAILURE,
        payload: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  };

  // Verify OTP function - CRITICAL FOR AUTO-LOGIN
  const verifyOTP = async (contactNumber, otp) => {
    dispatch({ type: AUTH_ACTIONS.OTP_START });
    
    try {
      console.log('AuthContext: Verifying OTP for:', contactNumber);
      
      const response = await api.post('/auth/verify-otp', {
        contactNumber,
        otp
      });
      
      console.log('AuthContext: OTP verification response:', response.data);
      
      // This is the KEY part - dispatch OTP_SUCCESS with user data
      dispatch({
        type: AUTH_ACTIONS.OTP_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        }
      });

      console.log('AuthContext: OTP_SUCCESS dispatched, user should be authenticated now');

      return { success: true, data: response.data };
    } catch (error) {
      console.error('AuthContext: OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      
      dispatch({
        type: AUTH_ACTIONS.OTP_FAILURE,
        payload: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  };

  // Resend OTP function
  const resendOTP = async (contactNumber) => {
    try {
      const response = await api.post('/auth/resend-otp', { contactNumber });
      
      return { 
        success: true, 
        data: response.data.data,
        message: response.data.message 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      // Force navigation to login after logout
      window.location.href = '/login';
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.data
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

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
    sendOTP,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    changePassword,
    refreshAuthToken,
    clearError,
    hasRole,
    isAdmin
  };

  // Debug logging for authentication state changes
  useEffect(() => {
    console.log('AuthContext State Update:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      hasUser: !!state.user,
      userName: state.user ? `${state.user.firstName} ${state.user.lastName}` : 'None'
    });
  }, [state.isAuthenticated, state.isLoading, state.user]);

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

export default AuthContext;