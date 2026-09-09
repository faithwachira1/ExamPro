import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClassesPage from './pages/ClassesPage';
import StudentsPage from './pages/StudentsPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ReportsPage from './pages/ReportsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import Spinner from './components/ui/Spinner';

const App = () => {
  const { isAuthenticated, isHiddenAdmin, loading } = useAuth();
  const location = useLocation();

  const hasAccessHash = new URLSearchParams(location.search).has('access');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        {isHiddenAdmin && (
          <Route path="super-admin" element={<SuperAdminPage />} />
        )}
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;