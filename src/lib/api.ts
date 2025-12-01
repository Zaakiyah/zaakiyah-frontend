import axios from 'axios'
import { deviceService } from '../services/deviceService'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies (refresh token)
})

// Request interceptor to add access token and device info
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add device info to headers for auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/')
    if (isAuthEndpoint) {
      try {
        const deviceInfo = await deviceService.getDeviceInfo()
        if (deviceInfo.deviceToken) {
          config.headers['x-device-token'] = deviceInfo.deviceToken
        }
        if (deviceInfo.deviceType) {
          config.headers['x-device-type'] = deviceInfo.deviceType
        }
        if (deviceInfo.deviceId) {
          config.headers['x-device-id'] = deviceInfo.deviceId
        }
      } catch (error) {
        // Silently fail - device info is optional
        console.warn('Failed to get device info:', error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh and deleted accounts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const errorMessage = error.response?.data?.message || ''

    // Check if account has been deleted
    const isAccountDeleted = 
      error.response?.status === 401 &&
      (errorMessage.toLowerCase().includes('account has been deleted') ||
       errorMessage.toLowerCase().includes('deleted'))

    // If account is deleted, immediately clear auth and redirect (before token refresh logic)
    if (isAccountDeleted) {
      // Clear auth store and localStorage synchronously
      const store = useAuthStore.getState()
      store.clearAuth()
      
      // Manually clear all auth-related storage to ensure it's gone
      localStorage.removeItem('auth-storage')
      localStorage.removeItem('accessToken')
      
      // Clear device info
      try {
        deviceService.clearDeviceInfo()
      } catch (e) {
        // Ignore errors clearing device info
      }
      
      // Use window.location.replace to avoid back button issues and ensure fresh load
      // This will cause a full page reload, so the Zustand store will reload from cleared localStorage
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login')
      }
      return Promise.reject(error)
    }

    // Don't try to refresh token on auth endpoints (login, signup, etc.)
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    const shouldRefreshToken =
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint

    if (shouldRefreshToken) {
      originalRequest._retry = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        )

        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        // Clear auth state and redirect to login
        const store = useAuthStore.getState()
        store.clearAuth()
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('accessToken')
        try {
          deviceService.clearDeviceInfo()
        } catch (e) {
          // Ignore errors
        }
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login')
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

