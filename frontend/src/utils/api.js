import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export const getStudents = (params) => API.get('/students', { params });
export const getStudent = (id) => API.get(`/students/${id}`);
export const createStudent = (formData) =>
  API.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateStudent = (id, formData) =>
  API.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteStudent = (id) => API.delete(`/students/${id}`);

export default API;
