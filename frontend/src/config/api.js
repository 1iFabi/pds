// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/auth';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL.replace('/api/auth', ''),
  LOGIN: `${API_BASE_URL}/login/`,
  REGISTER: `${API_BASE_URL}/register/`,
  PASSWORD_RESET: `${API_BASE_URL}/password-reset/`,
  PASSWORD_RESET_CONFIRM: `${API_BASE_URL}/password-reset-confirm/`,
  ME: `${API_BASE_URL}/me/`,
  DELETE_ACCOUNT: `${API_BASE_URL}/me/delete-account/`,
  LOGOUT: `${API_BASE_URL}/logout/`,
  DASHBOARD: `${API_BASE_URL}/dashboard/`,
  CONTACT: `${API_BASE_URL}/contact/`,
  GET_USERS: `${API_BASE_URL}/users/`,
  UPLOAD_GENETIC_FILE: `${API_BASE_URL}/upload-genetic-file/`,
  DELETE_GENETIC_FILE: `${API_BASE_URL}/delete-genetic-file/`,
  UPDATE_SERVICE_STATUS: `${API_BASE_URL}/service/status/`,
  DISEASES: `${API_BASE_URL}/diseases/`,
  PATIENT_VARIANTS: (userId) => `${API_BASE_URL}/patient-variants/${userId}/`,
  VARIANTS: `${API_BASE_URL}/variantes/`,
  ANCESTRY: `${API_BASE_URL}/ancestry/`,
  INDIGENOUS: `${API_BASE_URL}/indigenous/`,
  TRAITS: `${API_BASE_URL}/traits/`,
};

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const clearToken = () => localStorage.removeItem('token');

// Función helper para hacer peticiones a la API
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  const defaultOptions = {
    headers: defaultHeaders,
    mode: 'cors',
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  try {
    const response = await fetch(endpoint, config);
    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : {};
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      ok: false,
      status: 0,
      data: { error: 'Error de conexión con el servidor' },
    };
  }
};
