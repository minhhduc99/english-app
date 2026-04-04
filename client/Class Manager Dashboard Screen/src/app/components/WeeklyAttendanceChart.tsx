import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const attendanceData = [
  { name: 'Present', value: 85, color: '#10b981' },
  { name: 'Late', value: 10, color: '#f59e0b' },
  { name: 'Absent', value: 5, color: '#ef4444' },
];

export function WeeklyAttendanceChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Attendance</h2>
      <div style={{ width: '100%', height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-sm text-gray-700">
                  {value}: <span className="font-semibold">{entry.payload.value}%</span>
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {attendanceData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}