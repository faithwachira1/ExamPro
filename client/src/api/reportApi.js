import api from './axios';

export const getClassReport = async (classId) => {
  const response = await api.get(`/reports/class/${classId}`);
  return response.data;
};

export const getStudentReport = async (studentId) => {
  const response = await api.get(`/reports/student/${studentId}`);
  return response.data;
};

export const getCourseReport = async (courseId) => {
  const response = await api.get(`/reports/course/${courseId}`);
  return response.data;
};