import { api } from './client';

export const inventoryApi = {
  getAll: () => api.get('/inventory/batches'),
  getById: (id: number) => api.get(`/inventory/batches/${id}`),
  create: (data: any) => api.post('/inventory/batches', data),
  update: (id: number, data: any) => api.put(`/inventory/batches/${id}`, data),
  delete: (id: number) => api.delete(`/inventory/batches/${id}`),
};
