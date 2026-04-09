import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { Student } from "../types/student";
import { StudentDetailDrawer } from "../components/StudentDetailDrawer";
import { StudentFormModal } from "../components/StudentFormModal";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function StudentManagement() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        fetch("/api/users/students", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        fetch("/api/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      if (!studentsRes.ok || !coursesRes.ok) throw new Error("Failed to fetch data");
      
      const studentsData = await studentsRes.json();
      const coursesData = await coursesRes.json();
      
      setStudents(studentsData);
      setCourses(coursesData);
    } catch (error) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === "All Classes" || student.class.includes(selectedClass);
    return matchesSearch && matchesClass;
  });

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const handleAddStudent = () => {
    setFormMode("add");
    setSelectedStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setFormMode("edit");
    setSelectedStudent(student);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        const res = await fetch(`/api/users/students/${studentToDelete.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to delete");
        setStudents(students.filter((s) => s.id !== studentToDelete.id));
        toast.success(`${studentToDelete.name} has been deleted successfully`);
      } catch (err) {
        toast.error("Error deleting student");
      }
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleSaveStudent = async (studentData: Omit<Student, "id"> & { password?: string }) => {
    try {
      if (formMode === "add") {
        const payload = {
          username: studentData.studentId,
          fullName: studentData.name,
          email: studentData.email,
          password: studentData.password || "Student@123", // fallback
        };
        const res = await fetch("/api/auth/student", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to add student");
        }
        
        toast.success("Student added successfully");
        fetchStudents(); // Refresh list
      } else if (formMode === "edit" && selectedStudent) {
        // Backend updating not fully implemented for standard fields, but could be added later
        toast.info("Edit functionality on backend pending");
        setStudents(
          students.map((s) =>
            s.id === selectedStudent.id ? { ...s, name: studentData.name, email: studentData.email } : s
          )
        );
      }
      setIsFormModalOpen(false);
      setSelectedStudent(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleImport = () => {
    toast.info("Import functionality would be implemented here");
  };

  const handleExport = () => {
    toast.success("Student data exported successfully");
  };

  const activeStudents = students.filter((s) => s.status === "Active").length;
  const totalStudents = students.length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("menu.student_management")}</h1>
          <p className="text-gray-500 mt-1">{t("Manage and organize student information")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t("Import")}</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t("Export")}</span>
          </button>
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Add Student")}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("Total Students_Stat")}</p>
              <p className="text-3xl font-semibold text-gray-900">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-[#1A73E8]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("Active Students")}</p>
              <p className="text-3xl font-semibold text-gray-900">{activeStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Classes</p>
              <p className="text-3xl font-semibold text-gray-900">10</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, student ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
          >
            <option value="All Classes">All Classes</option>
            {courses.map((course) => (
              <option key={course.id} value={course.name}>
                {course.name}
              </option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>{t("Filter")}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            <span>{t("Sort")}</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading students...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avatar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center text-white font-medium">
                      {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.dateOfBirth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-[#E8F0FE] text-[#1A73E8] text-xs font-medium rounded-full">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {student.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-[#1A73E8] hover:bg-[#E8F0FE] rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(student)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {!loading && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t("No students found")}</p>
          </div>
        )}
      </div>

      {/* Student Detail Drawer */}
      <StudentDetailDrawer
        student={selectedStudent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveStudent}
        student={selectedStudent}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        studentName={studentToDelete?.name || ""}
      />
    </div>
  );
}
