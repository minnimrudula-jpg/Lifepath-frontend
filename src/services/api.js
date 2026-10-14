import axios from 'axios'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api')
const api = axios.create({ baseURL: apiBaseURL, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('lifepath_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) window.dispatchEvent(new Event('lifepath:unauthorized'))
  return Promise.reject(error)
})
export default api
