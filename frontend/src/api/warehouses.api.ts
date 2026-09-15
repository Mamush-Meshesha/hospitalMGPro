import { api } from './client';

export const warehousesApi = {
  getAll: () => api.get('/warehouses'),
  getById: (id: number) => api.get(`/warehouses/${id}`),
  create: (data: any) => api.post('/warehouses', data),
  update: (id: number, data: any) => api.put(`/warehouses/${id}`, data),
  delete: (id: number) => api.delete(`/warehouses/${id}`),
  
  getBranches: () => api.get('/warehouses/branches/all'),
  createBranch: (data: any) => api.post('/warehouses/branches', data),
};
