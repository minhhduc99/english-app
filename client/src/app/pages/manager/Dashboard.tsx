import { useEffect, useState } from 'react';
import { StatCard } from '../../components/manager/StatCard';
import { TodaysClassesTable } from '../../components/manager/TodaysClassesTable';
import { WeeklyAttendanceChart } from '../../components/manager/WeeklyAttendanceChart';
import { Users, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

export function ManagerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/dashboard/overview', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = data?.cards || {};

  return (
    <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100"
              title="Current Students"
              value={cards.students?.value || 0}
              change={cards.students?.trend || "0 this week"}
              changeType="positive"
            />
            <StatCard
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              title="Today's Attendance Rate"
              value={`${cards.attendanceRate?.value || 0}%`}
              change={cards.attendanceRate?.trend || "0% from yesterday"}
              changeType="positive"
            />
            <StatCard
              icon={FileText}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              title="Pending AI Materials"
              value={cards.pendingMaterials?.value || 0}
              change={cards.pendingMaterials?.note || "0 high priority"}
              changeType="neutral"
            />
            <StatCard
              icon={AlertTriangle}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              title="Absence Alerts"
              value={cards.absenceAlerts?.value || 0}
              change={cards.absenceAlerts?.note || "0 Need attention"}
              changeType="negative"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Classes Table - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TodaysClassesTable classes={data?.todayClasses} />
            </div>

            {/* Weekly Attendance Chart - Takes 1 column */}
            <div className="lg:col-span-1">
              <WeeklyAttendanceChart data={data?.weeklyAttendance} />
            </div>
        </div>
    </div>
  );
}
