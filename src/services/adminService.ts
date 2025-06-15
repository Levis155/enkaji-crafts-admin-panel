import api from '../utils/axios';
import { 
  Product, 
  Order, 
  User, 
  Review, 
  DashboardStats,
  PaginationParams,
  PaginatedResponse 
} from '../types';

export const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Products
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post('/admin/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  // Orders
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  // Users
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Reviews
  getReviews: async (params?: PaginationParams): Promise<PaginatedResponse<Review>> => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/admin/reviews/${id}`);
  },

  // Analytics
  getSalesData: async (period: string) => {
    const response = await api.get(`/admin/analytics/sales?period=${period}`);
    return response.data;
  },

  getTopProducts: async (limit: number = 10) => {
    const response = await api.get(`/admin/analytics/top-products?limit=${limit}`);
    return response.data;
  },
};