import { Calendar, CheckCircle, XCircle, Users } from "lucide-react";

export function Attendance() {
  const attendanceData = [
    { date: "2026-03-23", class: "Class 5A", present: 28, absent: 2, total: 30 },
    { date: "2026-03-22", class: "Class 5A", present: 29, absent: 1, total: 30 },
    { date: "2026-03-21", class: "Class 5A", present: 27, absent: 3, total: 30 },
    { date: "2026-03-20", class: "Class 5A", present: 30, absent: 0, total: 30 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">Track student attendance and patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Today's Attendance</p>
              <p className="text-3xl font-semibold text-gray-900">93%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Present Students</p>
              <p className="text-3xl font-semibold text-gray-900">28</p>
            </div>
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1A73E8]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Absent Students</p>
              <p className="text-3xl font-semibold text-gray-900">2</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {record.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.class}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-green-700 font-medium">{record.present}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="text-red-700 font-medium">{record.absent}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.total}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {Math.round((record.present / record.total) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
