import api from './axios';

export const hiddenAdminLogin = async (credentials) => {
  const response = await api.post('/auth/hidden-admin-login', credentials);
  return response.data;
};

export const hiddenAdminRegister = async (adminData) => {
  const response = await api.post('/auth/hidden-admin-register', adminData);
  return response.data;
};

export const verifyAdminHash = async (accessHash) => {
  const response = await api.post('/auth/verify-admin-hash', { accessHash });
  return response.data;
};

export const getAdminInfo = async () => {
  const response = await api.get('/auth/admin-info');
  return response.data;
};

export const registerTeacher = async (teacherData) => {
  const response = await api.post('/auth/register-teacher', teacherData);
  return response.data;
};

export const loginTeacher = async (credentials) => {
  const response = await api.post('/auth/teacher-login', credentials);
  return response.data;
};