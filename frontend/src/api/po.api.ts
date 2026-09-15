import { api } from './client';

export const poApi = {
  getAll: () => api.get('/po'),
  getById: (id: number) => api.get(`/po/${id}`),
  create: (data: any) => api.post('/po', data),
  updateStatus: (id: number, status: string, approvedBy?: number) => api.patch(`/po/${id}/status`, { status, approvedBy }),
  update: (id: number, data: any) => api.put(`/po/${id}`, data),
  delete: (id: number) => api.delete(`/po/${id}`),
};
