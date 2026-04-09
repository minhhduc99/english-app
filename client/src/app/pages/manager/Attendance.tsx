import { AttendanceStatCard } from '../../components/manager/AttendanceStatCard';
import { ImportAttendanceSection } from '../../components/manager/ImportAttendanceSection';
import { DirectAttendanceChecklist } from '../../components/manager/DirectAttendanceChecklist';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ManagerAttendance() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<{ id: string; name: string; courseCode: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    fetch('/api/courses', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setCourses(data || []);
      if (data && data.length > 0) {
        setSelectedCourse(data[0].id);
      }
    })
    .catch(() => {});
  }, []);

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
              <h1 className="text-2xl font-semibold text-gray-900">{t('attendance.manage_title')}</h1>
              <p className="text-gray-600 mt-1">{t('attendance.manage_subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">{t('attendance.course_label')}</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              >
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.courseCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AttendanceStatCard
              title={t('attendance.total_students')}
              value={stats.totalStudents}
            />
            <AttendanceStatCard
              title={t('attendance.present')}
              value={stats.present}
              valueColor="text-green-600"
            />
            <AttendanceStatCard
              title={t('attendance.absent')}
              value={stats.absent}
              valueColor="text-red-600"
            />
            <AttendanceStatCard
              title={t('attendance.late')}
              value={stats.late}
              valueColor="text-orange-600"
            />
          </div>

          {/* Import Section */}
          <div className="mb-8">
            <ImportAttendanceSection classId={selectedCourse} />
          </div>

          {/* Direct Attendance Checklist */}
          <div>
            <DirectAttendanceChecklist classId={selectedCourse} />
        </div>
    </div>
  );
}
