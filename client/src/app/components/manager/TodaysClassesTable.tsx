import { CheckCircle, FileSpreadsheet } from 'lucide-react';

interface ClassData {
  id: number;
  className: string;
  time: string;
  teacher: string;
}

const mockClasses: ClassData[] = [
  { id: 1, className: 'Mathematics 101', time: '08:00 - 09:30', teacher: 'Dr. Sarah Johnson' },
  { id: 2, className: 'Physics Advanced', time: '09:45 - 11:15', teacher: 'Prof. Michael Chen' },
  { id: 3, className: 'Chemistry Lab', time: '11:30 - 13:00', teacher: 'Dr. Emily Parker' },
  { id: 4, className: 'English Literature', time: '14:00 - 15:30', teacher: 'Ms. Rachel Green' },
  { id: 5, className: 'Computer Science', time: '15:45 - 17:15', teacher: 'Dr. David Kim' },
];

export function TodaysClassesTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockClasses.map((classItem) => (
              <tr key={classItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{classItem.className}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{classItem.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{classItem.teacher}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors">
                      <CheckCircle className="w-4 h-4" />
                      Checklist Quick
                    </button>
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                      <FileSpreadsheet className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
