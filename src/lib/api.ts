import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear storage and redirect if it's not the /auth/me endpoint
      if (!error.config?.url?.includes('/auth/me')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Delay redirect to avoid immediate redirect during login
        setTimeout(() => {
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string, password_confirmation: string) => {
    const response = await apiClient.post('/auth/register', { 
      name, 
      email, 
      password, 
      password_confirmation 
    });
    return response.data;
  },

  verifyToken: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Medicine API
export const medicineAPI = {
  getAll: async () => {
    const response = await apiClient.get('/medicines');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/medicines/${id}`);
    return response.data;
  },
  
  create: async (medicine: {
    name: string;
    morning_dose?: number;
    evening_dose?: number;
    night_dose?: number;
    unit: string;
  }) => {
    const response = await apiClient.post('/medicines', medicine);
    return response.data;
  },
  
  update: async (id: number, medicine: {
    name?: string;
    morning_dose?: number;
    evening_dose?: number;
    night_dose?: number;
    unit?: string;
  }) => {
    const response = await apiClient.put(`/medicines/${id}`, medicine);
    return response.data;
  },
  
  delete: async (id: number) => {
    await apiClient.delete(`/medicines/${id}`);
  },
};

// Dose Record API
export const doseRecordAPI = {
  getAll: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/dose_records', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/dose_records/${id}`);
    return response.data;
  },
  
  create: async (record: {
    medicine_id: number;
    dose_date: string;
    morning_taken?: boolean;
    evening_taken?: boolean;
    night_taken?: boolean;
  }) => {
    const response = await apiClient.post('/dose_records', record);
    return response.data;
  },
  
  update: async (id: number, record: {
    morning_taken?: boolean;
    evening_taken?: boolean;
    night_taken?: boolean;
  }) => {
    const response = await apiClient.put(`/dose_records/${id}`, record);
    return response.data;
  },
  
  delete: async (id: number) => {
    await apiClient.delete(`/dose_records/${id}`);
  },
  
  getCalendar: async (year: number, month: number) => {
    const response = await apiClient.get('/dose_records/calendar', {
      params: { year, month }
    });
    return response.data;
  },
};

// Health Record API
export const healthRecordAPI = {
  getAll: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/health_records', { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await apiClient.get(`/health_records/${id}`);
    return response.data;
  },
  
  create: async (record: {
    date: string;
    condition?: number;
    appetite?: number;
    notes?: string;
    importance: number;
    is_hospital_day: boolean;
  }) => {
    const response = await apiClient.post('/health_records', record);
    return response.data;
  },
  
  update: async (id: number, record: {
    condition?: number;
    appetite?: number;
    notes?: string;
    importance?: number;
    is_hospital_day?: boolean;
  }) => {
    const response = await apiClient.put(`/health_records/${id}`, record);
    return response.data;
  },
  
  delete: async (id: number) => {
    await apiClient.delete(`/health_records/${id}`);
  },
  
  getImportantBetweenHospitalVisits: async () => {
    const response = await apiClient.get('/health_records/important_between_hospital_visits');
    return response.data;
  },
  
  getCalendar: async (year: number, month: number) => {
    const response = await apiClient.get('/health_records/calendar', {
      params: { year, month }
    });
    return response.data;
  },
};

export default apiClient;