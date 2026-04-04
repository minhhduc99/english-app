import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { ManagerDashboard } from "./manager/Dashboard";

function AdminDashboard() {
  const stats = [
    { label: "Total Students", value: "1,234", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Courses", value: "48", icon: BookOpen, color: "bg-green-50 text-green-600" },
    { label: "Attendance Rate", value: "94%", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
    { label: "Course Finished", value: "12", icon: Award, color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
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

  return <AdminDashboard />;
}