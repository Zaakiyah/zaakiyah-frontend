import axios from 'axios'
import { deviceService } from '../services/deviceService'

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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

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
        // Clear auth state and redirect to login (use navigate instead of window.location for SPA)
        localStorage.removeItem('accessToken')
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

