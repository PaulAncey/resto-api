import axios from 'axios';

// Configuration de base d'Axios
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  }
};

// Services de réservation
export const reservationService = {
  getMyReservations: async () => {
    const response = await api.get('/my-reservations');
    return response.data;
  },

  getAllReservations: async () => {
    const response = await api.get('/reservations');
    return response.data;
  },

  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  updateReservation: async (id, reservationData) => {
    const response = await api.put(`/reservations/${id}`, reservationData);
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },

  validateReservation: async (id) => {
    const response = await api.patch(`/reservations/${id}/validate`);
    return response.data;
  }
};

// Services de menu
export const menuService = {
  getMenu: async () => {
    const response = await api.get('/menu');
    return response.data;
  },

  getMenuItem: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  addMenuItem: async (itemData) => {
    const response = await api.post('/menu', itemData);
    return response.data;
  },

  updateMenuItem: async (id, itemData) => {
    const response = await api.put(`/menu/${id}`, itemData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  }
};

// Services de tables
export const tableService = {
  getTables: async () => {
    const response = await api.get('/tables');
    return response.data;
  },

  addTable: async (tableData) => {
    const response = await api.post('/tables', tableData);
    return response.data;
  },

  updateTable: async (id, tableData) => {
    const response = await api.put(`/tables/${id}`, tableData);
    return response.data;
  },

  deleteTable: async (id) => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  }
};

export default api;