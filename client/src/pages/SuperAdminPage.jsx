import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as adminApi from '../api/adminApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const SuperAdminPage = () => {
  const { isHiddenAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    identifier: '',
    password: '',
    fullName: '',
    isHiddenAdmin: false,
    accessHash: '',
  });
  const [editForm, setEditForm] = useState({
    identifier: '',
    fullName: '',
  });
  const [resetForm, setResetForm] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isHiddenAdmin) {
      window.location.href = '/';
      return;
    }
    fetchAdmins();
  }, [isHiddenAdmin]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch (error) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const adminData = {
        fullName: createForm.fullName,
        password: createForm.password,
        isHiddenAdmin: createForm.isHiddenAdmin,
      };

      if (createForm.identifier.includes('@')) {
        adminData.email = createForm.identifier;
      } else {
        adminData.username = createForm.identifier;
      }

      if (createForm.isHiddenAdmin) {
        adminData.accessHash = createForm.accessHash;
      }

      await adminApi.createAdmin(adminData);
      toast.success('Admin created successfully');
      setShowCreateModal(false);
      setCreateForm({ identifier: '', password: '', fullName: '', isHiddenAdmin: false, accessHash: '' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const adminData = {
        fullName: editForm.fullName,
      };

      if (editForm.identifier.includes('@')) {
        adminData.email = editForm.identifier;
      } else {
        adminData.username = editForm.identifier;
      }

      await adminApi.updateAdmin(editingAdmin._id, adminData);
      toast.success('Admin updated successfully');
      setShowEditModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update admin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await adminApi.toggleAdminStatus(admin._id);
      toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to toggle admin status');
    }
  };

  const handleResetAttempts = async (admin) => {
    try {
      await adminApi.resetAdminAttempts(admin._id);
      toast.success('Failed attempts reset successfully');
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to reset attempts');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      setSaving(false);
      return;
    }

    try {
      await adminApi.resetAdminPassword(editingAdmin._id, resetForm.password);
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setEditingAdmin(null);
      setResetForm({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await adminApi.deleteAdmin(deleteTarget._id);
      toast.success('Admin deleted successfully');
      setDeleteTarget(null);
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to delete admin');
    }
  };

  if (!isHiddenAdmin) {
    return null;
  }

  if (loading) {
    return <Spinner size="lg" className="py-20" />;
  }

  const headers = ['Identifier', 'Full Name', 'Type', 'Status', 'Last Login', 'Login Count', 'Failed Attempts', 'Actions'];

  const renderRow = (admin) => (
    <tr key={admin._id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{admin.username || admin.email}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
        {admin.fullName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={admin.isHiddenAdmin ? 'danger' : 'primary'}>
          {admin.isHiddenAdmin ? 'Hidden Admin' : 'Admin'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={admin.isActive ? 'success' : 'danger'}>
          {admin.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {admin.loginCount || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={admin.failedAttempts > 0 ? 'warning' : 'success'}>
          {admin.failedAttempts || 0}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap space-x-2">
        <Button variant="secondary" size="sm" onClick={() => {
          setEditingAdmin(admin);
          setEditForm({ identifier: admin.username || admin.email, fullName: admin.fullName });
          setShowEditModal(true);
        }}>
          Edit
        </Button>
        <Button variant="warning" size="sm" onClick={() => {
          setEditingAdmin(admin);
          setShowResetPasswordModal(true);
        }}>
          Reset Password
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleResetAttempts(admin)}>
          Reset Attempts
        </Button>
        <Button 
          variant={admin.isActive ? 'warning' : 'success'} 
          size="sm" 
          onClick={() => handleToggleStatus(admin)}
        >
          {admin.isActive ? 'Deactivate' : 'Activate'}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(admin)}>
          Delete
        </Button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-600 mt-1">Manage admin users</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Admin
        </Button>
      </div>

      <Card>
        <Table
          headers={headers}
          data={admins}
          renderRow={renderRow}
          emptyMessage="No admins found"
        />
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Admin"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <Input
            label="Username or Email"
            placeholder="Enter username or email"
            value={createForm.identifier}
            onChange={(e) => setCreateForm({ ...createForm, identifier: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={createForm.fullName}
            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            required
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isHiddenAdmin"
              checked={createForm.isHiddenAdmin}
              onChange={(e) => setCreateForm({ ...createForm, isHiddenAdmin: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isHiddenAdmin" className="text-sm font-medium text-gray-700">
              Hidden Admin
            </label>
          </div>
          {createForm.isHiddenAdmin && (
            <Input
              label="Access Hash"
              type="password"
              placeholder="Enter access hash"
              value={createForm.accessHash}
              onChange={(e) => setCreateForm({ ...createForm, accessHash: e.target.value })}
              required
            />
          )}
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Admin"
      >
        <form onSubmit={handleEditAdmin} className="space-y-4">
          <Input
            label="Username or Email"
            placeholder="Enter username or email"
            value={editForm.identifier}
            onChange={(e) => setEditForm({ ...editForm, identifier: e.target.value })}
            required
          />
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Update
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={resetForm.password}
            onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm new password"
            value={resetForm.confirmPassword}
            onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowResetPasswordModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" isLoading={saving}>
              Reset Password
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete "${deleteTarget?.username || deleteTarget?.email}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default SuperAdminPage;