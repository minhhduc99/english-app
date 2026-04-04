import { BookOpen, LayoutDashboard, FileText, Settings, Users, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

export function Sidebar() {
  const [studentsOpen, setStudentsOpen] = useState(true);
  const location = useLocation();
  const isAttendancePage = location.pathname === '/attendance';

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">EduLMS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              !isAttendancePage 
                ? 'text-blue-600 bg-blue-50 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          {/* Courses */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <BookOpen className="w-5 h-5" />
            <span>Courses</span>
          </a>

          {/* Students */}
          <div>
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Students</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${studentsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {studentsOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <a
                  href="#"
                  className="block px-8 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Student Management
                </a>
                <Link
                  to="/attendance"
                  className={`block px-8 py-2 text-sm rounded ${
                    isAttendancePage
                      ? 'text-blue-600 bg-blue-50 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Attendance
                </Link>
              </div>
            )}
          </div>

          {/* Reports */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <FileText className="w-5 h-5" />
            <span>Reports</span>
          </a>

          {/* Settings */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
}