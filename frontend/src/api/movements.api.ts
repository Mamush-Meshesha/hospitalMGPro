import { api } from './client';

export const movementsApi = {
  getAll: () => api.get('/movements'),
  getById: (id: number) => api.get(`/movements/${id}`),
  create: (data: any) => api.post('/movements', data),
  update: (id: number, data: any) => api.put(`/movements/${id}`, data),
  delete: (id: number) => api.delete(`/movements/${id}`),
};
