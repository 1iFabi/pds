// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login/`,
  REGISTER: `${API_BASE_URL}/register/`,
};

// Función helper para hacer peticiones a la API
export const apiRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(endpoint, config);
    const data = await response.json();
    
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