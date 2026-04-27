import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { ManagerDashboard } from "./manager/Dashboard";
import { Dashboard as TeacherDashboard } from "./teacher/Dashboard";
import { Dashboard as StudentDashboard } from "./student/Dashboard";

function AdminDashboard() {
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
        console.error('Error fetching admin dashboard stats:', error);
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

  const iconMap: any = {
    Users,
    BookOpen,
    TrendingUp,
    Award
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.stats?.map((stat: any, index: number) => {
          const Icon = iconMap[stat.icon] || Users;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {(data?.recentActivity || []).map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            {(!data?.recentActivity || data.recentActivity.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-[#E8F0FE] text-[#1A73E8] rounded-lg hover:bg-[#D2E3FC] transition-colors">
              Add New Student
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              Create New Course
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [role, setRole] = useState<string>("ADMIN");
  
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role) {
        setRole(user.role);
      }
    } catch (e) {
      // default to ADMIN
    }
  }, []);

  if (role === "MANAGER") {
    return <ManagerDashboard />;
  }

  if (role === "TEACHER") {
    return <TeacherDashboard />;
  }

  if (role === "STUDENT") {
    return <StudentDashboard />;
  }

  return <AdminDashboard />;
}