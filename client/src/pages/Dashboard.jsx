import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const Dashboard = () => {
  const { classes, students, courses, fetchClasses, fetchStudents, fetchCourses, loading } = useData();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [classesData, studentsData, coursesData] = await Promise.all([
        fetchClasses(),
        fetchStudents(),
        fetchCourses(),
      ]);
      setStats({
        totalClasses: classesData.length,
        totalStudents: studentsData.length,
        totalCourses: coursesData.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data');
    }
  };

  if (loading && !stats) {
    return <Spinner size="lg" className="py-20" />;
  }

  const statCards = [
    {
      title: 'Total Classes',
      value: stats?.totalClasses || 0,
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/classes',
      color: 'bg-blue-50',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/students',
      color: 'bg-green-50',
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: '/courses',
      color: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {settings?.schoolName || 'Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1">
          {settings?.academicYear || ''} {settings?.term || ''} - Overview
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <button
            key={stat.title}
            onClick={() => navigate(stat.path)}
            className="text-left"
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {settings?.motto && (
        <div className="mt-8 text-center">
          <p className="text-lg italic text-gray-500">"{settings.motto}"</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Classes" subtitle="Latest classes added">
          {classes.slice(0, 5).map((cls) => (
            <div key={cls._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{cls.className}</p>
                <p className="text-sm text-gray-500">{cls.description || 'No description'}</p>
              </div>
              <span className="text-sm text-gray-400">{cls.studentCount || 0} students</span>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-gray-400 text-center py-4">No classes yet</p>
          )}
        </Card>

        <Card title="Recent Courses" subtitle="Latest courses added">
          {courses.slice(0, 5).map((course) => (
            <div key={course._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{course.courseName}</p>
                <p className="text-sm text-gray-500">{course.courseCode}</p>
              </div>
              <span className="text-sm text-gray-400">{course.classId?.className || ''}</span>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-gray-400 text-center py-4">No courses yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;