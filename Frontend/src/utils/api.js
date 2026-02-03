import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080", 
});

api.interceptors.request.use((config) => {
  const url = config.url || '';


  if (url.includes('/admin') || url.includes("/audit")) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } 
  else if (url.includes('/voter')) {
    const token = localStorage.getItem('voter_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAdminRequest = url.includes('/admin');
    const isVoterRequest = url.includes('/voter');

    if (error.response && error.response.status === 401) {
      
      if (isAdminRequest) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login'; 
      } 
      
      else if (isVoterRequest) {
        if (!url.includes('/login')) {
           localStorage.removeItem('voter_token');
           window.location.href = '/voter/login'; 
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;