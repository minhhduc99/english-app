import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { StatCard } from '../components/StatCard';
import { TodaysClassesTable } from '../components/TodaysClassesTable';
import { WeeklyAttendanceChart } from '../components/WeeklyAttendanceChart';
import { Users, CheckCircle, FileText, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />
      
      {/* Main Content */}
      <div className="ml-64 pt-16">
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
              value={342}
              change="+12 this week"
              changeType="positive"
            />
            <StatCard
              icon={CheckCircle}
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
              title="Today's Attendance Rate"
              value="94%"
              change="+2% from yesterday"
              changeType="positive"
            />
            <StatCard
              icon={FileText}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100"
              title="Pending AI Materials"
              value={8}
              change="3 high priority"
              changeType="neutral"
            />
            <StatCard
              icon={AlertTriangle}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
              title="Absence Alerts"
              value={5}
              change="Need attention"
              changeType="negative"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Classes Table - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TodaysClassesTable />
            </div>

            {/* Weekly Attendance Chart - Takes 1 column */}
            <div className="lg:col-span-1">
              <WeeklyAttendanceChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
