import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MyCourses as StudentCourses } from "./student/MyCourses";
import { useLanguage } from "../contexts/LanguageContext";
import { CourseFormModal, CourseFormData } from "../components/CourseFormModal";
import { AssignStudentsModal } from "../components/manager/AssignStudentsModal";
import { AssignTeachersModal } from "../components/manager/AssignTeachersModal";

interface Course {
  id: string;
  name: string;
  courseCode: string;
  level: string;
  startDate: string;
  endDate: string;
  studySchedule: string;
  maxAttendants: number;
  description?: string;
  status: string;
  createdAt?: string;
}

/* ────────── status/level styling helpers ────────── */
const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const levelColors: Record<string, string> = {
  BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ELEMENTARY: "bg-sky-50 text-sky-700 border-sky-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
  UPPER_INTERMEDIATE: "bg-purple-50 text-purple-700 border-purple-200",
  ADVANCED: "bg-rose-50 text-rose-700 border-rose-200",
};

/* ────────── Admin Courses Screen ────────── */
function AdminCourses() {
  const { t, language } = useLanguage();

  // Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [role, setRole] = useState<string>("ADMIN");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role) setRole(user.role);
    } catch {}
  }, []);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [selectedCourse, setSelectedCourse] = useState<CourseFormData | null>(null);

  // Assignment Modals
  const [assignStudentTarget, setAssignStudentTarget] = useState<{ id: string; name: string } | null>(null);
  const [assignTeacherTarget, setAssignTeacherTarget] = useState<{ id: string; name: string } | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  // Notification
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  /* ── Auth header helper ── */
  const authHeaders = (extra?: Record<string, string>) => ({
    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
    ...extra,
  });

  /* ── Fetch courses from API ── */
  const fetchCourses = async (search?: string) => {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/courses${query}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch {
      // API may not be ready; use empty list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* ── Search with debounce ── */
  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ── Add ── */
  const handleAdd = () => {
    setFormMode("add");
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  /* ── Edit ── */
  const handleEdit = (course: Course) => {
    setFormMode("edit");
    setSelectedCourse({
      id: course.id,
      name: course.name,
      courseCode: course.courseCode,
      level: course.level,
      startDate: course.startDate,
      endDate: course.endDate,
      studySchedule: course.studySchedule,
      maxAttendants: course.maxAttendants,
      description: course.description || "",
      status: course.status,
    });
    setIsFormOpen(true);
  };

  /* ── Save (Create / Update) ── */
  const handleSave = async (data: CourseFormData) => {
    setFormLoading(true);
    try {
      const isEdit = formMode === "edit" && data.id;
      const url = isEdit ? `/api/courses/${data.id}` : "/api/courses";
      const method = isEdit ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        name: data.name,
        courseCode: data.courseCode,
        level: data.level,
        startDate: data.startDate,
        endDate: data.endDate,
        studySchedule: data.studySchedule,
        maxAttendants: data.maxAttendants,
        description: data.description,
      };
      if (isEdit) body.status = data.status;

      const res = await fetch(url, {
        method,
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }

      showNotification("success", isEdit ? t("course.updated_success") : t("course.created_success"));
      setIsFormOpen(false);
      fetchCourses(searchQuery);
    } catch (err: any) {
      showNotification("error", err.message || t("course.save_error"));
    } finally {
      setFormLoading(false);
    }
  };

  /* ── Delete ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/courses/${deleteTarget.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("success", t("course.deleted_success"));
      setDeleteTarget(null);
      fetchCourses(searchQuery);
    } catch {
      showNotification("error", t("course.delete_error"));
    }
  };

  /* ── Helper: translate level/status labels ── */
  const levelLabel = (val: string) => {
    const map: Record<string, Record<string, string>> = {
      BEGINNER: { en: "Beginner", vi: "Sơ cấp" },
      ELEMENTARY: { en: "Elementary", vi: "Cơ bản" },
      INTERMEDIATE: { en: "Intermediate", vi: "Trung cấp" },
      UPPER_INTERMEDIATE: { en: "Upper Intermediate", vi: "Trung cấp cao" },
      ADVANCED: { en: "Advanced", vi: "Nâng cao" },
    };
    return map[val]?.[language] || val;
  };

  const statusLabel = (val: string) => {
    const map: Record<string, Record<string, string>> = {
      DRAFT: { en: "Draft", vi: "Nháp" },
      ACTIVE: { en: "Active", vi: "Đang hoạt động" },
      COMPLETED: { en: "Completed", vi: "Hoàn thành" },
      CANCELLED: { en: "Cancelled", vi: "Đã hủy" },
    };
    return map[val]?.[language] || val;
  };

  /* ── Stats ── */
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => c.status === "ACTIVE").length;
  const draftCourses = courses.filter((c) => c.status === "DRAFT").length;

  return (
    <div className="p-6 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 animate-slide-in ${
            notification.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("course.page_title")}</h1>
          <p className="text-gray-500 mt-1">{t("course.page_subtitle")}</p>
        </div>
        {["ADMIN", "MANAGER"].includes(role) && (
          <button
            onClick={handleAdd}
            id="btn-add-course"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1A73E8] text-white rounded-xl hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-100 font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            {t("course.add_btn")}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("course.total_courses")}</p>
              <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
            </div>
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-[#1A73E8]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("course.active_courses")}</p>
              <p className="text-3xl font-bold text-gray-900">{activeCourses}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t("course.draft_courses")}</p>
              <p className="text-3xl font-bold text-gray-900">{draftCourses}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("course.search_placeholder")}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent text-sm bg-gray-50"
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-[#1A73E8]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t("course.no_courses")}</p>
            <p className="text-gray-400 text-sm mt-1">{t("course.no_courses_hint")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_name")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_code")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_level")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_schedule")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_dates")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_capacity")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_status")}
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {t("course.col_actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1A73E8] to-[#6C63FF] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {course.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{course.name}</p>
                          {course.description && (
                            <p className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Code */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-semibold text-[#1A73E8] bg-[#E8F0FE] px-2.5 py-1 rounded-lg">
                        {course.courseCode}
                      </span>
                    </td>
                    {/* Level */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          levelColors[course.level] || "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {levelLabel(course.level)}
                      </span>
                    </td>
                    {/* Schedule */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="max-w-[150px] truncate">{course.studySchedule}</span>
                      </div>
                    </td>
                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="whitespace-nowrap">
                          {course.startDate} → {course.endDate}
                        </span>
                      </div>
                    </td>
                    {/* Capacity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {course.maxAttendants}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          statusColors[course.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {statusLabel(course.status)}
                      </span>
                    </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("learning_path.review")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {["ADMIN", "MANAGER"].includes(role) && (
                            <button
                              onClick={() => setDeleteTarget(course)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t("course.delete_btn")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      <CourseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        course={selectedCourse}
        mode={formMode}
        loading={formLoading}
      />

      <AssignStudentsModal
        courseId={assignStudentTarget?.id ?? null}
        courseName={assignStudentTarget?.name}
        isOpen={!!assignStudentTarget}
        onClose={() => setAssignStudentTarget(null)}
      />

      <AssignTeachersModal
        courseId={assignTeacherTarget?.id ?? null}
        courseName={assignTeacherTarget?.name}
        isOpen={!!assignTeacherTarget}
        onClose={() => setAssignTeacherTarget(null)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t("course.delete_title")}</h3>
                    <p className="text-sm text-gray-500">{t("course.delete_warning")}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-6">
                  {t("course.delete_confirm")}{" "}
                  <span className="font-semibold">{deleteTarget.name}</span> ({deleteTarget.courseCode})?
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm"
                  >
                    {t("course.cancel")}
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold text-sm"
                  >
                    {t("course.delete_btn")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Root Courses Component ────────── */
export function Courses() {
  const [role, setRole] = useState<string>("ADMIN");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role) {
        setRole(user.role);
      }
    } catch (e) {
      // default
    }
  }, []);

  if (role === "STUDENT") {
    return <StudentCourses />;
  }

  return <AdminCourses />;
}
