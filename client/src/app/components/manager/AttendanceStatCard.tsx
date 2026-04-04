interface AttendanceStatCardProps {
  title: string;
  value: string | number;
  valueColor?: string;
}

export function AttendanceStatCard({ title, value, valueColor = 'text-gray-900' }: AttendanceStatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <div className={`text-3xl font-semibold ${valueColor}`}>{value}</div>
    </div>
  );
}
