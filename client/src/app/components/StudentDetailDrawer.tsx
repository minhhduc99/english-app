import { X, Mail, Phone, MapPin, Calendar, User, BookOpen, ClipboardList } from "lucide-react";
import { Student } from "../types/student";

interface StudentDetailDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailDrawer({ student, isOpen, onClose }: StudentDetailDrawerProps) {
  if (!isOpen || !student) return null;

  const attendanceData = [
    { month: "January", present: 20, absent: 2, percentage: 91 },
    { month: "February", present: 18, absent: 1, percentage: 95 },
    { month: "March", present: 22, absent: 0, percentage: 100 },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#1557B0] rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-1">{student.name}</h3>
                <div className="flex items-center gap-2 text-white/90 mb-2">
                  <User className="w-4 h-4" />
                  <span>{student.studentId}</span>
                </div>
                <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {student.class}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                student.status === "Active" ? "bg-green-400/30 text-white" : "bg-red-400/30 text-white"
              }`}>
                {student.status}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1A73E8]" />
              Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                <div className="text-gray-900 font-medium">{student.name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Gender</label>
                <div className="text-gray-900 font-medium">{student.gender}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Date of Birth</label>
                <div className="text-gray-900 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {student.dateOfBirth}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Student ID</label>
                <div className="text-gray-900 font-medium">{student.studentId}</div>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500 block mb-1">Email</label>
                <div className="text-gray-900 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {student.email}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500 block mb-1">Phone</label>
                <div className="text-gray-900 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {student.phone}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500 block mb-1">Address</label>
                <div className="text-gray-900 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  123 Education Street, City, State 12345
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1A73E8]" />
              Academic Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Class</label>
                <div className="text-gray-900 font-medium">{student.class}</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Roll Number</label>
                <div className="text-gray-900 font-medium">15</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Academic Year</label>
                <div className="text-gray-900 font-medium">2025-2026</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Section</label>
                <div className="text-gray-900 font-medium">A</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Admission Date</label>
                <div className="text-gray-900 font-medium">Sep 1, 2024</div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Guardian Name</label>
                <div className="text-gray-900 font-medium">John Doe Sr.</div>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#1A73E8]" />
              Attendance Summary
            </h4>
            <div className="space-y-3">
              {attendanceData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{data.month}</span>
                      <span className="text-sm text-gray-500">
                        {data.present}P / {data.absent}A
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A73E8] rounded-full"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#1A73E8]">
                    {data.percentage}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Attendance</span>
                <span className="text-lg font-semibold text-[#1A73E8]">95%</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
            <div className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Academic Performance</span>
                  <span className="text-xs text-gray-500">Mar 15, 2026</span>
                </div>
                <p className="text-sm text-gray-600">
                  Excellent performance in mathematics and science subjects. Shows great potential.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">Behavior</span>
                  <span className="text-xs text-gray-500">Mar 10, 2026</span>
                </div>
                <p className="text-sm text-gray-600">
                  Very cooperative student, actively participates in class discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
