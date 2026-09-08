import api from './axios';

export const getStudents = async (params) => {
  const response = await api.get('/students', { params });
  return response.data;
};

export const getStudentById = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const getStudentsByClass = async (classId) => {
  const response = await api.get(`/students/class/${classId}`);
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

export const createBulkStudents = async (bulkData) => {
  const response = await api.post('/students/bulk', bulkData);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};