import { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import { formatScore, formatGrade, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const { classes, courses, fetchClasses, fetchCourses, fetchClassReport, fetchCourseReport, fetchStudentReport, reports, loading } = useData();
  const [reportType, setReportType] = useState('class');
  const [selectedItem, setSelectedItem] = useState('');
  const [generated, setGenerated] = useState(false);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const reportContentRef = useRef(null);
  const studentReportRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    fetchCourses();
  }, []);

  const classOptions = classes.map((cls) => ({
    value: cls._id,
    label: cls.className,
  }));

  const courseOptions = courses.map((course) => ({
    value: course._id,
    label: `${course.courseName} (${course.courseCode})`,
  }));

  const handleGenerate = async () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    try {
      if (reportType === 'class') {
        await fetchClassReport(selectedItem);
      } else {
        await fetchCourseReport(selectedItem);
      }
      setGenerated(true);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handlePrintIndividual = async (studentId, studentName) => {
    try {
      const report = await fetchStudentReport(studentId);
      setSelectedStudentReport(report);
      setShowStudentModal(true);
    } catch (error) {
      toast.error('Failed to load student report');
    }
  };

  const handlePrintReport = () => {
    const content = reportContentRef.current?.innerHTML;
    
    if (!content) {
      toast.error('Nothing to print');
      return;
    }
    
    printHTML(content, 'ExamPro Report');
  };

  const handlePrintStudentReport = () => {
    const content = studentReportRef.current?.innerHTML;
    
    if (!content) {
      toast.error('Nothing to print');
      return;
    }
    
    printHTML(content, `Student Report - ${selectedStudentReport?.student?.fullName || ''}`);
  };

  const printHTML = (content, title) => {
    const printWindow = window.open('', '_blank', 'width=900,height=650');
    
    if (!printWindow) {
      toast.error('Popup blocked. Please allow popups.');
      return;
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"><\/script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              background: white;
              color: black;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px 12px; 
              text-align: left; 
              font-size: 13px;
            }
            th { 
              background-color: #f3f4f6; 
              font-weight: bold;
            }
            .text-green-600 { color: #16a34a !important; }
            .text-blue-600 { color: #2563eb !important; }
            .text-yellow-600 { color: #ca8a04 !important; }
            .text-orange-600 { color: #ea580c !important; }
            .text-red-600 { color: #dc2626 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-gray-900 { color: #111827 !important; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-white { background-color: #ffffff; }
            .border-t { border-top: 1px solid #ddd; }
            .pt-4 { padding-top: 16px; }
            .mt-6 { margin-top: 24px; }
            .mb-6 { margin-bottom: 24px; }
            .text-center { text-align: center; }
            .text-2xl { font-size: 24px; }
            .text-lg { font-size: 18px; }
            .text-sm { font-size: 13px; }
            .text-xs { font-size: 11px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: 1fr 1fr; }
            .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
            .gap-4 { gap: 16px; }
            .whitespace-nowrap { white-space: nowrap; }
            .divide-y > tr + tr { border-top: 1px solid #ddd; }
            .divide-gray-200 > tr + tr { border-top-color: #ddd; }
            .rounded-lg { border-radius: 8px; }
            .shadow { box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .p-4 { padding: 16px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .py-3 { padding-top: 12px; padding-bottom: 12px; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 0.05em; }
            @media print {
              body { padding: 10px; }
              .no-print, .print-hidden, button { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${content}
          <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #6b7280; border-top: 1px solid #ddd; padding-top: 16px;">
            © 2026 ExamPro by HDM
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 1000);
            };
          <\/script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const renderClassReport = () => {
    if (!reports?.report) return null;

    const allCourses = reports.report[0]?.courses?.map(c => c.course) || [];

    return (
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Class Report - {reports.class?.className || ''}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                {allCourses.map((course, index) => (
                  <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {course.courseCode}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-hidden">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.report.map((studentReport) => {
                const courseScores = studentReport.courses.map(c => c.finalScore);
                const average = courseScores.length > 0 
                  ? courseScores.reduce((a, b) => a + b, 0) / courseScores.length 
                  : 0;
                const grade = average >= 70 ? 'A' : average >= 60 ? 'B' : average >= 50 ? 'C' : average >= 40 ? 'D' : 'F';

                return (
                  <tr key={studentReport.student._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium text-gray-900">{studentReport.student.fullName}</p>
                      <p className="text-xs text-gray-500">{studentReport.student.admissionNumber || ''}</p>
                    </td>
                    {studentReport.courses.map((courseReport, index) => (
                      <td key={index} className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{formatScore(courseReport.finalScore)}</span>
                        <span className={`ml-2 text-xs font-semibold ${formatGrade(courseReport.grade)}`}>
                          {courseReport.grade}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{formatScore(average)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-semibold ${formatGrade(grade)}`}>{grade}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap print-hidden">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handlePrintIndividual(studentReport.student._id, studentReport.student.fullName)}
                      >
                        Print
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCourseReport = () => {
    if (!reports?.studentSummaries) return null;

    return (
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Course Report - {reports.course?.courseName || ''}</h2>
        
        {reports.summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{reports.summary.totalStudents}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Class Average</p>
              <p className="text-2xl font-bold text-gray-900">{formatScore(reports.summary.classAverage)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">{reports.summary.passRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Score Range</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatScore(reports.summary.lowestScore)} - {formatScore(reports.summary.highestScore)}
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAT Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Score</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider print-hidden">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.studentSummaries.map((summary) => (
                <tr key={summary.student._id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{summary.student.fullName}</p>
                    <p className="text-xs text-gray-500">{summary.student.admissionNumber || ''}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatScore(summary.assignmentAvg)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatScore(summary.catAvg)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatScore(summary.examAvg)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{formatScore(summary.finalScore)}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`font-semibold ${formatGrade(summary.grade)}`}>{summary.grade}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap print-hidden">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handlePrintIndividual(summary.student._id, summary.student.fullName)}
                    >
                      Print
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and view reports</p>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Report Type"
            options={[
              { value: 'class', label: 'Class Report' },
              { value: 'course', label: 'Course Report' },
            ]}
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setSelectedItem('');
              setGenerated(false);
            }}
          />
          <Select
            label={reportType === 'class' ? 'Select Class' : 'Select Course'}
            placeholder={`Select ${reportType}`}
            options={reportType === 'class' ? classOptions : courseOptions}
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={handleGenerate} className="w-full">
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {loading && <Spinner size="lg" className="py-12" />}

      {generated && !loading && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Report Results</h2>
            <Button variant="secondary" size="sm" onClick={handlePrintReport}>
              Print Report
            </Button>
          </div>
          <div ref={reportContentRef}>
            {reportType === 'class' ? renderClassReport() : renderCourseReport()}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        title={selectedStudentReport ? `Student Report - ${selectedStudentReport.student.fullName}` : 'Student Report'}
        size="lg"
      >
        {selectedStudentReport && (
          <>
            <div ref={studentReportRef}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-600">ExamPro</h2>
                <p className="text-gray-600">Student Performance Report</p>
                <p className="text-sm text-gray-500 mt-2">Generated: {formatDate(new Date())}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Student Name</p>
                  <p className="font-semibold text-gray-900">{selectedStudentReport.student.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admission Number</p>
                  <p className="font-semibold text-gray-900">{selectedStudentReport.student.admissionNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Class</p>
                  <p className="font-semibold text-gray-900">{selectedStudentReport.student.classId?.className || 'N/A'}</p>
                </div>
              </div>

              <table className="min-w-full divide-y divide-gray-200 mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment Avg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAT Avg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Avg</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudentReport.courseReports.map((courseReport, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{courseReport.course.courseName}</p>
                        <p className="text-xs text-gray-500">{courseReport.course.courseCode}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatScore(courseReport.assignmentAvg)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatScore(courseReport.catAvg)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatScore(courseReport.examAvg)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{formatScore(courseReport.finalScore)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${formatGrade(courseReport.grade)}`}>{courseReport.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={() => setShowStudentModal(false)}>
                Close
              </Button>
              <Button onClick={handlePrintStudentReport}>
                Print Report
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ReportsPage;