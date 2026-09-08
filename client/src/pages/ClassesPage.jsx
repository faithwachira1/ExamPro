import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import * as classApi from '../api/classApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const ClassesPage = () => {
  const { classes, fetchClasses, loading } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    academicYear: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        className: cls.className,
        description: cls.description || '',
        academicYear: cls.academicYear || '',
      });
    } else {
      setEditingClass(null);
      setFormData({
        className: '',
        description: '',
        academicYear: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingClass) {
        await classApi.updateClass(editingClass._id, formData);
        toast.success('Class updated successfully');
      } else {
        await classApi.createClass(formData);
        toast.success('Class created successfully');
      }
      setShowModal(false);
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await classApi.deleteClass(deleteTarget._id);
      toast.success('Class deleted successfully');
      setDeleteTarget(null);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const headers = ['Class Name', 'Description', 'Academic Year', 'Students', 'Status', 'Actions'];

  const renderRow = (cls) => (
    <tr key={cls._id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{cls.className}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {cls.description || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {cls.academicYear || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="primary">{cls.studentCount || 0}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={cls.isActive ? 'success' : 'danger'}>
          {cls.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap space-x-2">
        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(cls)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(cls)}>
          Delete
        </Button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Manage your classes</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Class
        </Button>
      </div>

      <Card>
        <Table
          headers={headers}
          data={classes}
          renderRow={renderRow}
          loading={loading}
          emptyMessage="No classes found"
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClass ? 'Edit Class' : 'Add Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            placeholder="Enter class name"
            value={formData.className}
            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Academic Year"
            placeholder="e.g., 2024"
            value={formData.academicYear}
            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingClass ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteTarget?.className}"? This will also remove all students in this class.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ClassesPage;