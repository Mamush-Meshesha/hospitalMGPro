import { api } from './client';

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  
  createUom: (data: any) => api.post('/categories/uom', data),
  updateUom: (id: number, data: any) => api.put(`/categories/uom/${id}`, data),
  deleteUom: (id: number) => api.delete(`/categories/uom/${id}`),
};
