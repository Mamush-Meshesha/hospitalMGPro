import { api } from './client';

export const uomApi = {
  // Categories
  getCategories: () => api.get('/uom/categories'),
  createCategory: (data: any) => api.post('/uom/categories', data),

  // UOMs
  getAll: () => api.get('/uom'),
  create: (data: any) => api.post('/uom', data),
  delete: (id: number) => api.delete(`/uom/${id}`),
};
