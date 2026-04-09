import { Search, Filter, RotateCcw, Save, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Student {
  id: string; // The UUID required by DB
  studentId: string; // Internal custom identifier
  fullName: string;
  avatar: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
}

export function DirectAttendanceChecklist({ classId: courseId }: { classId?: string }) {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [learningDate, setLearningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeader = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.token || localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (courseId) {
      fetch(`/api/courses/${courseId}/members`, {
        headers: { Authorization: `Bearer ${getAuthHeader()}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setStudents((data || []).map((s: any) => ({ ...s, status: null })));
        })
        .catch(() => setStudents([]));
    } else {
      setStudents([]);
    }
  }, [courseId]);

  const handleStatusChange = (studentId: string, status: Student['status']) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status } : student
    ));
  };

  const handleReset = () => {
    setStudents(students.map(student => ({ ...student, status: null })));
  };

  const handleSave = async () => {
    if (!courseId) return alert('Select a course first');
    const records = students
      .filter(s => s.status !== null)
      .map(s => ({
        studentId: s.id,
        status: s.status as string
      }));

    if (records.length === 0) {
      return alert('Please mark attendance for at least one student');
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/attendance/take', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthHeader()}`
        },
        body: JSON.stringify({
          classId: courseId,
          date: learningDate,
          records: records
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save attendance');
      }

      alert(t('attendance.success_save'));
    } catch (error: any) {
      alert(t('attendance.error') + ' / ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter?.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('attendance.direct_title')}</h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('attendance.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          
          <input
            type="date"
            value={learningDate}
            onChange={(e) => setLearningDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('attendance.status_all')}</option>
            <option value="present">{t('attendance.status_present')}</option>
            <option value="absent">{t('attendance.status_absent')}</option>
            <option value="late">{t('attendance.status_late')}</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('attendance.col_avatar')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('attendance.col_id')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('attendance.col_name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('attendance.col_status')}
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
                        checked={student.status === 'PRESENT'}
                        onChange={() => handleStatusChange(student.id, 'PRESENT')}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-green-600">{t('attendance.status_present')}</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'ABSENT'}
                        onChange={() => handleStatusChange(student.id, 'ABSENT')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-red-600">{t('attendance.status_absent')}</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        checked={student.status === 'LATE'}
                        onChange={() => handleStatusChange(student.id, 'LATE')}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm font-medium text-orange-600">{t('attendance.status_late')}</span>
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
          {t('attendance.reset')}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('attendance.save')}
        </button>
      </div>
    </div>
  );
}
