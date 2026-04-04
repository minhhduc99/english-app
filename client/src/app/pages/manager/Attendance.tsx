import { AttendanceStatCard } from '../../components/manager/AttendanceStatCard';
import { ImportAttendanceSection } from '../../components/manager/ImportAttendanceSection';
import { DirectAttendanceChecklist } from '../../components/manager/DirectAttendanceChecklist';
import { useState } from 'react';

export function ManagerAttendance() {
  const [selectedClass, setSelectedClass] = useState('Computer Science 101');

  // Mock stats
  const stats = {
    totalStudents: 10,
    present: 0,
    absent: 0,
    late: 0
  };

  return (
    <div className="p-8">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
              <p className="text-gray-600 mt-1">Manage and track student attendance records</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                <option value="Computer Science 101">Computer Science 101</option>
                <option value="Mathematics 101">Mathematics 101</option>
                <option value="Physics Advanced">Physics Advanced</option>
                <option value="Chemistry Lab">Chemistry Lab</option>
                <option value="English Literature">English Literature</option>
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AttendanceStatCard
              title="Total Students"
              value={stats.totalStudents}
            />
            <AttendanceStatCard
              title="Present"
              value={stats.present}
              valueColor="text-green-600"
            />
            <AttendanceStatCard
              title="Absent"
              value={stats.absent}
              valueColor="text-red-600"
            />
            <AttendanceStatCard
              title="Late"
              value={stats.late}
              valueColor="text-orange-600"
            />
          </div>

          {/* Import Section */}
          <div className="mb-8">
            <ImportAttendanceSection />
          </div>

          {/* Direct Attendance Checklist */}
          <div>
            <DirectAttendanceChecklist />
        </div>
    </div>
  );
}
