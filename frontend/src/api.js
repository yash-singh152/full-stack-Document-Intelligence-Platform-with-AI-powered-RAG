import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getBooks = () => api.get('/books/');
export const getBookDetail = (id) => api.get(`/books/${id}/`);
export const uploadBooks = (limit = 10) => api.post('/upload-book/', { limit });
export const askQuestion = (question) => api.post('/ask/', { question });
export const getRecommendations = (id) => api.get(`/books/recommend/${id}/`);

export default api;
