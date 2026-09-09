import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';

const Login = () => {
  const { login, hiddenLogin, isAuthenticated, isAdminMode, setIsAdminMode } = useAuth();
  const { settings, fetchSettings } = useSettings();
  const navigate = useNavigate();
  const [showHiddenModal, setShowHiddenModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: '',
  });
  const [hiddenCredentials, setHiddenCredentials] = useState({
    username: '',
    password: '',
    accessHash: '',
  });
  const [adminError, setAdminError] = useState('');
  const [hiddenError, setHiddenError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [hiddenLoading, setHiddenLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        setShowHiddenModal(true);
      }
      if (event.key === 'Escape') {
        setShowHiddenModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isAdminMode) {
      setShowHiddenModal(true);
      setIsAdminMode(false);
    }
  }, [isAdminMode, setIsAdminMode]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    const result = await login(adminCredentials);

    if (result.success) {
      try {
        await fetchSettings();
      } catch (error) {
        console.error('Failed to fetch settings');
      }
      navigate('/');
    } else {
      setAdminError(result.error || 'Login failed');
    }

    setAdminLoading(false);
  };

  const handleHiddenSubmit = async (e) => {
    e.preventDefault();
    setHiddenError('');
    setHiddenLoading(true);

    const result = await hiddenLogin(hiddenCredentials);

    if (result.success) {
      try {
        await fetchSettings();
      } catch (error) {
        console.error('Failed to fetch settings');
      }
      setShowHiddenModal(false);
      navigate('/');
    } else {
      setHiddenError(result.error || 'Hidden admin login failed');
    }

    setHiddenLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className="h-20 w-20 mx-auto rounded-xl object-cover mb-4" />
          ) : (
            <div className="h-20 w-20 mx-auto bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <h1 className="text-4xl font-bold text-blue-600">
            {settings?.schoolName || 'ExamPro'}
          </h1>
          <p className="text-gray-600 mt-2">
            {settings?.motto || 'Exam Entry and Management System'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Admin Login
          </h2>

          {adminError && (
            <div className="mb-4">
              <Alert type="error" message={adminError} onClose={() => setAdminError('')} />
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              placeholder="Enter username or email"
              value={adminCredentials.username}
              onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={adminCredentials.password}
              onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
              required
            />
            <Button type="submit" isLoading={adminLoading} className="w-full" size="lg">
              Login
            </Button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          {settings?.reportFooter || '© 2026 ExamPro by HDM'}
        </p>
      </div>

      <Modal
        isOpen={showHiddenModal}
        onClose={() => setShowHiddenModal(false)}
        title="Hidden Admin Access"
        size="sm"
      >
        <div className="space-y-4">
          {hiddenError && (
            <Alert type="error" message={hiddenError} onClose={() => setHiddenError('')} />
          )}

          <form onSubmit={handleHiddenSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              placeholder="Enter hidden admin username"
              value={hiddenCredentials.username}
              onChange={(e) => setHiddenCredentials({ ...hiddenCredentials, username: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter hidden admin password"
              value={hiddenCredentials.password}
              onChange={(e) => setHiddenCredentials({ ...hiddenCredentials, password: e.target.value })}
              required
            />
            <Input
              label="Access Hash"
              type="password"
              placeholder="Enter access hash"
              value={hiddenCredentials.accessHash}
              onChange={(e) => setHiddenCredentials({ ...hiddenCredentials, accessHash: e.target.value })}
              required
            />
            <Button type="submit" isLoading={hiddenLoading} className="w-full" variant="danger">
              Hidden Admin Login
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Login;