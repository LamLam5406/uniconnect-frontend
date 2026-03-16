import axiosClient from './axiosClient';

export const adminApi = {
  createUser: (userData) => {
    // Gọi đến route POST /api/admin/users
    return axiosClient.post('/admin/users', userData);
  }
};