import { createContext, useContext, useState, useEffect } from 'react';
import { hiddenAdminLogin, verifyAdminHash, getAdminInfo, loginTeacher } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isHiddenAdmin, setIsHiddenAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
    checkHashAccess();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (token && adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        setAdmin(parsedData);
        setIsAuthenticated(true);
        setIsHiddenAdmin(parsedData.isHiddenAdmin || false);
      } catch (error) {
        console.error('Invalid stored admin data');
        logout();
      }
    }
    setLoading(false);
  };

  const checkHashAccess = async () => {
    const params = new URLSearchParams(window.location.search);
    const accessHash = params.get('access');

    if (accessHash) {
      try {
        const response = await verifyAdminHash(accessHash);
        if (response.valid) {
          setIsAdminMode(true);
          localStorage.setItem('tempAdminToken', response.tempToken);
          toast.success('Hidden admin access verified');
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          toast.error('Invalid access hash');
        }
      } catch (error) {
        toast.error('Hash verification failed');
      }
    }
  };

  const login = async (credentials) => {
    try {
      const response = await loginTeacher(credentials);
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminData', JSON.stringify(response.teacher));
      setAdmin(response.teacher);
      setIsAuthenticated(true);
      setIsHiddenAdmin(false);
      toast.success('Welcome back, ' + response.teacher.fullName);
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const hiddenLogin = async (credentials) => {
    try {
      const response = await hiddenAdminLogin(credentials);
      localStorage.setItem('adminToken', response.token);
      localStorage.setItem('adminData', JSON.stringify(response.admin));
      setAdmin(response.admin);
      setIsAuthenticated(true);
      setIsHiddenAdmin(true);
      toast.success('Hidden admin logged in');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hidden admin login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('tempAdminToken');
    setAdmin(null);
    setIsAuthenticated(false);
    setIsAdminMode(false);
    setIsHiddenAdmin(false);
    toast.success('Logged out successfully');
  };

  const refreshAdminInfo = async () => {
    try {
      const adminInfo = await getAdminInfo();
      setAdmin(adminInfo);
      localStorage.setItem('adminData', JSON.stringify(adminInfo));
    } catch (error) {
      console.error('Failed to refresh admin info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        isAdminMode,
        isHiddenAdmin,
        login,
        hiddenLogin,
        logout,
        refreshAdminInfo,
        setIsAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};