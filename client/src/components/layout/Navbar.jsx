import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Navbar = ({ onToggleSidebar }) => {
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center">
          {settings?.logo ? (
            <img src={settings.logo} alt="Logo" className="h-8 w-8 rounded-lg mr-2 object-cover" />
          ) : (
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <span className="text-lg font-bold text-blue-600 hidden sm:block">
            {settings?.schoolName || 'ExamPro'}
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {admin?.fullName?.charAt(0) || 'A'}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {admin?.fullName || 'Admin'}
          </span>
          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{admin?.fullName}</p>
              <p className="text-xs text-gray-500">{admin?.username || admin?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate('/');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate('/settings');
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;