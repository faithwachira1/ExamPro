import { createContext, useContext, useState, useCallback } from 'react';
import * as classApi from '../api/classApi';
import * as studentApi from '../api/studentApi';
import * as courseApi from '../api/courseApi';
import * as scoreApi from '../api/scoreApi';
import * as reportApi from '../api/reportApi';
import toast from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [scores, setScores] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await classApi.getClasses();
      setClasses(data);
      return data;
    } catch (error) {
      toast.error('Failed to load classes');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await studentApi.getStudents(params);
      setStudents(data);
      return data;
    } catch (error) {
      toast.error('Failed to load students');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentsByClass = useCallback(async (classId) => {
    setLoading(true);
    try {
      const data = await studentApi.getStudentsByClass(classId);
      setStudents(data);
      return data;
    } catch (error) {
      toast.error('Failed to load students');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await courseApi.getCourses(params);
      setCourses(data);
      return data;
    } catch (error) {
      toast.error('Failed to load courses');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseById = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const data = await courseApi.getCourseById(courseId);
      setCurrentCourse(data);
      return data;
    } catch (error) {
      toast.error('Failed to load course');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseSummary = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const data = await courseApi.getCourseSummary(courseId);
      return data;
    } catch (error) {
      toast.error('Failed to load course summary');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScoresByCourse = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const data = await scoreApi.getScoresByCourse(courseId);
      setScores(data);
      return data;
    } catch (error) {
      toast.error('Failed to load scores');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScoresByStudent = useCallback(async (studentId) => {
    setLoading(true);
    try {
      const data = await scoreApi.getScoresByStudent(studentId);
      setScores(data);
      return data;
    } catch (error) {
      toast.error('Failed to load scores');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClassReport = useCallback(async (classId) => {
    setLoading(true);
    try {
      const data = await reportApi.getClassReport(classId);
      setReports(data);
      return data;
    } catch (error) {
      toast.error('Failed to load class report');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudentReport = useCallback(async (studentId) => {
    setLoading(true);
    try {
      const data = await reportApi.getStudentReport(studentId);
      setReports(data);
      return data;
    } catch (error) {
      toast.error('Failed to load student report');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourseReport = useCallback(async (courseId) => {
    setLoading(true);
    try {
      const data = await reportApi.getCourseReport(courseId);
      setReports(data);
      return data;
    } catch (error) {
      toast.error('Failed to load course report');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCurrentCourse = useCallback(() => {
    setCurrentCourse(null);
  }, []);

  const clearReports = useCallback(() => {
    setReports(null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        classes,
        students,
        courses,
        currentCourse,
        currentStudent,
        scores,
        reports,
        loading,
        setCurrentStudent,
        fetchClasses,
        fetchStudents,
        fetchStudentsByClass,
        fetchCourses,
        fetchCourseById,
        fetchCourseSummary,
        fetchScoresByCourse,
        fetchScoresByStudent,
        fetchClassReport,
        fetchStudentReport,
        fetchCourseReport,
        clearCurrentCourse,
        clearReports,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};