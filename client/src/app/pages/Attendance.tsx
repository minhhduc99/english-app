import { Calendar, CheckCircle, XCircle, Users } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { ManagerAttendance } from "./manager/Attendance";
import { Attendance as TeacherAttendance } from "./teacher/Attendance";
import { useLanguage } from "../contexts/LanguageContext";

function AttendanceHistory() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState<{ id: string; name: string; courseCode: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [history, setHistory] = useState<{ dates: string[], students: any[] }>({ dates: [], students: [] });

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
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    fetch(`/api/attendance/history/${selectedCourse}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setHistory(data);
      })
      .catch(() => { });
  }, [selectedCourse]);

  const courseName = courses.find(c => c.id === selectedCourse)?.name || "";

  // Transform data
  const attendanceData = useMemo(() => {
    if (!history.dates || !history.students) return [];
    const arr = history.dates.map(date => {
      let present = 0, absent = 0, late = 0, excused = 0;
      const absentStudents: string[] = [];
      history.students.forEach((s: any) => {
        const st = s.attendance[date];
        if (st === 'PRESENT') present++;
        else if (st === 'ABSENT') {
          absent++;
          absentStudents.push(s.fullName || s.studentId || "Unknown");
        }
        else if (st === 'LATE') late++;
        else if (st === 'EXCUSED') excused++;
      });
      return { date, class: courseName, present, absent, late, excused, total: history.students.length, absentStudents };
    });
    // Sort descending
    return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, courseName]);

  const latest = attendanceData[0] || { present: 0, absent: 0, total: 0 };
  const percent = latest.total > 0 ? Math.round((latest.present / latest.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('attendance.history_title')}</h1>
          <p className="text-gray-500 mt-1">{t('attendance.history_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{t('attendance.select_course')}</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            {courses.length === 0 && <option value="">No courses</option>}
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.courseCode})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('attendance.todays_attendance')}</p>
              <p className="text-3xl font-semibold text-gray-900">{percent}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('attendance.present_students')}</p>
              <p className="text-3xl font-semibold text-gray-900">{latest.present}</p>
            </div>
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1A73E8]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('attendance.absent_students')}</p>
              <p className="text-3xl font-semibold text-gray-900">{latest.absent}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_class')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_present')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_absent')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_total')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('attendance.col_percentage')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.class}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-700 font-medium">{record.present}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-red-700 font-medium">{record.absent}</span>
                      {record.absentStudents && record.absentStudents.length > 0 && (
                        <span
                          className="text-xs text-gray-500 mt-1 max-w-[200px] truncate"
                          title={record.absentStudents.join(', ')}
                        >
                          {record.absentStudents.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.total}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {record.total > 0 ? Math.round((record.present / record.total) * 100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
              {attendanceData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function Attendance() {
  const [role, setRole] = useState<string>("ADMIN");
  const [activeTab, setActiveTab] = useState<'take' | 'history'>('take');
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role) {
        setRole(user.role);
      }
    } catch (e) {
      // default
    }
  }, []);

  const renderTakeAttendance = () => {
    return <ManagerAttendance />;
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('take')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'take'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
        >
          {t('menu.attendance')}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
        >
          {t('attendance.history_title') || 'Attendance History'}
        </button>
      </div>

      <div className="mt-4">
        {activeTab === 'take' ? renderTakeAttendance() : <AttendanceHistory />}
      </div>
    </div>
  );
}
