import { Search, Filter, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';

interface Student {
  id: string;
  studentId: string;
  fullName: string;
  avatar: string;
  status: 'present' | 'absent' | 'late' | null;
}

const mockStudents: Student[] = [
  { id: '1', studentId: 'STU001', fullName: 'Emma Johnson', avatar: 'EJ', status: null },
  { id: '2', studentId: 'STU002', fullName: 'Michael Chen', avatar: 'MC', status: null },
  { id: '3', studentId: 'STU003', fullName: 'Sarah Williams', avatar: 'SW', status: null },
  { id: '4', studentId: 'STU004', fullName: 'David Martinez', avatar: 'DM', status: null },
  { id: '5', studentId: 'STU005', fullName: 'Lisa Anderson', avatar: 'LA', status: null },
  { id: '6', studentId: 'STU006', fullName: 'James Taylor', avatar: 'JT', status: null },
  { id: '7', studentId: 'STU007', fullName: 'Emily Brown', avatar: 'EB', status: null },
  { id: '8', studentId: 'STU008', fullName: 'Robert Garcia', avatar: 'RG', status: null },
  { id: '9', studentId: 'STU009', fullName: 'Jennifer Lee', avatar: 'JL', status: null },
  { id: '10', studentId: 'STU010', fullName: 'Christopher Kim', avatar: 'CK', status: null },
];

export function DirectAttendanceChecklist() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleReset = () => {
    setStudents(students.map(student => ({ ...student, status: null })));
  };

  const handleSave = () => {
    console.log('Saving attendance:', students);
    alert('Attendance saved successfully!');
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Direct Attendance Checklist</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avatar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {student.avatar}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.studentId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'present'}
                        onChange={() => handleStatusChange(student.id, 'present')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-green-600">Present</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'absent'}
                        onChange={() => handleStatusChange(student.id, 'absent')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-red-600">Absent</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'late'}
                        onChange={() => handleStatusChange(student.id, 'late')}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-orange-600">Late</span>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Attendance
        </button>
      </div>
    </div>
  );
}
