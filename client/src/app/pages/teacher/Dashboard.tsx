import { useState } from "react";
import {
  Clock,
  Calendar,
  FileText,
  Users,
  UserX,
  AlertCircle,
  BookOpen,
  Video,
  MapPin,
  ChevronRight,
  FolderOpen,
  FileCheck,
  Image,
  FileSpreadsheet,
} from "lucide-react";

export function Dashboard() {
  const [selectedDate] = useState(new Date());

  // Today's Classes
  const todayClasses = [
    {
      id: 1,
      time: "08:00 - 09:30",
      subject: "English Grammar - Unit 5",
      class: "Class 10A",
      room: "Room 203",
      type: "in-person",
      status: "ongoing",
    },
    {
      id: 2,
      time: "10:00 - 11:30",
      subject: "Vocabulary Building",
      class: "Class 10B",
      room: "Room 105",
      type: "in-person",
      status: "upcoming",
    },
    {
      id: 3,
      time: "13:00 - 14:30",
      subject: "Speaking Practice",
      class: "Class 11A",
      room: "Online",
      type: "online",
      status: "upcoming",
    },
  ];

  // Upcoming Classes (Next 3 days)
  const upcomingClasses = [
    {
      id: 1,
      date: "Mar 25, 2026",
      time: "09:00 - 10:30",
      subject: "Reading Comprehension",
      class: "Class 10A",
      room: "Room 203",
    },
    {
      id: 2,
      date: "Mar 25, 2026",
      time: "14:00 - 15:30",
      subject: "Writing Workshop",
      class: "Class 10B",
      room: "Room 105",
    },
    {
      id: 3,
      date: "Mar 26, 2026",
      time: "08:00 - 09:30",
      subject: "Grammar Advanced",
      class: "Class 11A",
      room: "Room 301",
    },
    {
      id: 4,
      date: "Mar 26, 2026",
      time: "11:00 - 12:30",
      subject: "Pronunciation Practice",
      class: "Class 10A",
      room: "Language Lab",
    },
  ];

  // Learning Materials Statistics
  const materialStats = {
    total: 342,
    thisMonth: 28,
    byType: [
      { type: "PDFs", count: 156, icon: FileText, color: "bg-red-50 text-red-600" },
      { type: "Videos", count: 89, icon: Video, color: "bg-purple-50 text-purple-600" },
      { type: "Images", count: 67, icon: Image, color: "bg-green-50 text-green-600" },
      { type: "Worksheets", count: 30, icon: FileSpreadsheet, color: "bg-blue-50 text-blue-600" },
    ],
  };

  // Today's Absent Students
  const absentStudents = [
    {
      id: 1,
      name: "Emma Wilson",
      class: "Class 10A",
      avatar: "EW",
      reason: "Sick leave (notified)",
      contactAttempt: true,
    },
    {
      id: 2,
      name: "Michael Brown",
      class: "Class 11A",
      avatar: "MB",
      reason: "No notification",
      contactAttempt: false,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      class: "Class 10B",
      avatar: "SJ",
      reason: "Family emergency",
      contactAttempt: true,
    },
  ];

  // Today's Late Students
  const lateStudents = [
    {
      id: 1,
      name: "James Chen",
      class: "Class 10A",
      avatar: "JC",
      arrivalTime: "08:15 AM",
      minutesLate: 15,
    },
    {
      id: 2,
      name: "Olivia Davis",
      class: "Class 10A",
      avatar: "OD",
      arrivalTime: "08:20 AM",
      minutesLate: 20,
    },
    {
      id: 3,
      name: "Daniel Martinez",
      class: "Class 10B",
      avatar: "DM",
      arrivalTime: "10:12 AM",
      minutesLate: 12,
    },
    {
      id: 4,
      name: "Sophia Anderson",
      class: "Class 11A",
      avatar: "SA",
      arrivalTime: "13:08 AM",
      minutesLate: 8,
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === "ongoing") return "bg-green-100 text-green-700 border-green-200";
    if (status === "upcoming") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    if (status === "ongoing") return "In Progress";
    if (status === "upcoming") return "Upcoming";
    return status;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Today is {selectedDate.toLocaleDateString("en-US", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Today's Classes</p>
              <p className="text-3xl font-semibold text-gray-900">{todayClasses.length}</p>
              <p className="text-xs text-gray-500 mt-1">1 ongoing, 2 upcoming</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Upcoming Classes</p>
              <p className="text-3xl font-semibold text-gray-900">{upcomingClasses.length}</p>
              <p className="text-xs text-gray-500 mt-1">Next 3 days</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Learning Materials</p>
              <p className="text-3xl font-semibold text-gray-900">{materialStats.total}</p>
              <p className="text-xs text-green-600 mt-1">+{materialStats.thisMonth} this month</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">Student Attendance</p>
              <p className="text-3xl font-semibold text-gray-900">{absentStudents.length}</p>
              <p className="text-xs text-orange-600 mt-1">{lateStudents.length} late arrivals</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
            <p className="text-sm text-gray-500 mt-1">Your schedule for today</p>
          </div>
          <button className="text-sm text-[#1A73E8] hover:underline font-medium flex items-center gap-1">
            View Full Schedule
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {todayClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#1A73E8]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{classItem.subject}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          classItem.status
                        )}`}
                      >
                        {getStatusLabel(classItem.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {classItem.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {classItem.class}
                      </div>
                      <div className="flex items-center gap-1">
                        {classItem.type === "online" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        {classItem.room}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm whitespace-nowrap">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Classes & Learning Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
                <p className="text-sm text-gray-500">Next 3 days</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">{classItem.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span>{classItem.date}</span>
                    <span>•</span>
                    <span>{classItem.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{classItem.class}</span>
                    <span>•</span>
                    <span>{classItem.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Materials */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Learning Materials</h2>
                <p className="text-sm text-gray-500">Total uploaded content</p>
              </div>
            </div>
            <button className="text-sm text-[#1A73E8] hover:underline font-medium">
              Upload New
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-[#1A73E8] to-[#1557B0] rounded-xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <FileCheck className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Materials</p>
                <p className="text-3xl font-bold">{materialStats.total}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">+{materialStats.thisMonth} added this month</p>
          </div>

          <div className="space-y-3">
            {materialStats.byType.map((type, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                    <type.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-900">{type.type}</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{type.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Attendance Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Absent Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Absent Today</h2>
                <p className="text-sm text-gray-500">{absentStudents.length} students</p>
              </div>
            </div>
            <button className="text-sm text-[#1A73E8] hover:underline font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {absentStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium flex-shrink-0">
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <span className="text-sm text-gray-500">•</span>
                    <p className="text-sm text-gray-500">{student.class}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{student.reason}</p>
                  {student.contactAttempt ? (
                    <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                      Parent Contacted
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 flex items-center gap-1 w-fit">
                      <AlertCircle className="w-3 h-3" />
                      Contact Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Late Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Late Arrivals Today</h2>
                <p className="text-sm text-gray-500">{lateStudents.length} students</p>
              </div>
            </div>
            <button className="text-sm text-[#1A73E8] hover:underline font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {lateStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-sm font-medium flex-shrink-0">
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <span className="text-sm text-gray-500">•</span>
                    <p className="text-sm text-gray-500">{student.class}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Arrived: {student.arrivalTime}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.minutesLate > 15
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}
                    >
                      {student.minutesLate} min late
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
