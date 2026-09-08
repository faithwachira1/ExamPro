import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import * as studentApi from '../api/studentApi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

const StudentsPage = () => {
  const { students, classes, fetchStudents, fetchClasses, loading } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    admissionNumber: '',
    fullName: '',
    classId: '',
    email: '',
    phone: '',
  });
  const [bulkData, setBulkData] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const classOptions = classes.map((cls) => ({
    value: cls._id,
    label: cls.className,
  }));

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.admissionNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.classId?._id === selectedClass || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        admissionNumber: student.admissionNumber || '',
        fullName: student.fullName,
        classId: student.classId?._id || student.classId || '',
        email: student.email || '',
        phone: student.phone || '',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        admissionNumber: '',
        fullName: '',
        classId: '',
        email: '',
        phone: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingStudent) {
        await studentApi.updateStudent(editingStudent._id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentApi.createStudent(formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      const students = lines.map(line => {
        const [admissionNumber, fullName] = line.split(',').map(item => item.trim());
        return { admissionNumber, fullName };
      });

      const result = await studentApi.createBulkStudents({
        classId: formData.classId,
        students,
      });

      toast.success(`${result.totalCreated} students created successfully`);
      if (result.totalErrors > 0) {
        toast.error(`${result.totalErrors} students failed to create`);
      }
      setShowBulkModal(false);
      setBulkData('');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to create students');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await studentApi.deleteStudent(deleteTarget._id);
      toast.success('Student deleted successfully');
      setDeleteTarget(null);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const headers = ['Admission No.', 'Full Name', 'Class', 'Email', 'Phone', 'Status', 'Actions'];

  const renderRow = (student) => (
    <tr key={student._id}>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {student.admissionNumber || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{student.fullName}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="info">{student.classId?.className || 'No Class'}</Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {student.email || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
        {student.phone || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={student.isActive ? 'success' : 'danger'}>
          {student.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap space-x-2">
        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(student)}>
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(student)}>
          Delete
        </Button>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage your students</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
            Bulk Add
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or admission number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Filter by class"
            options={classOptions}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table
          headers={headers}
          data={filteredStudents}
          renderRow={renderRow}
          loading={loading}
          emptyMessage="No students found"
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admission Number"
            placeholder="Enter admission number"
            value={formData.admissionNumber}
            onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
          />
          <Input
            label="Full Name"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Select
            label="Class"
            placeholder="Select class"
            options={classOptions}
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Add Students"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <Select
            label="Class"
            placeholder="Select class"
            options={classOptions}
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Students List (one per line)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="6"
              placeholder={'ADM001, John Doe\nADM002, Jane Smith\nADM003, Bob Johnson'}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: AdmissionNumber, FullName (one per line)
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Add Students
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default StudentsPage;