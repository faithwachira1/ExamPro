import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';

const Login = () => {
  const { login, hiddenLogin, isAuthenticated, isAdminMode } = useAuth();
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
    }
  }, [isAdminMode]);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    const result = await login(adminCredentials);

    if (result.success) {
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
          <h1 className="text-4xl font-bold text-blue-600">ExamPro</h1>
          <p className="text-gray-600 mt-2">Exam Entry and Management System</p>
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
          © 2026 ExamPro From HDM
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