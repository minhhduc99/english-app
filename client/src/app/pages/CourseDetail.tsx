import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  BookOpen,
  Map as MapIcon,
  FileText,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
  Clock,
  Users,
  ArrowLeft,
  GraduationCap,
  FolderOpen
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
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
  description: string;
  status: string;
  teacherNames?: string;
}

interface LearningPathStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface LearningMaterial {
  id: string;
  name: string;
  type: string;
}

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [isAssignTeachersOpen, setIsAssignTeachersOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([
    { id: "1", title: t("learning_path.unit1"), description: "Learn basic greetings and how to introduce yourself.", order: 1 },
    { id: "2", title: t("learning_path.unit2"), description: "Vocabulary related to family members and describing people.", order: 2 },
    { id: "3", title: t("learning_path.unit3"), description: "Common phrases for daily life and making appointments.", order: 3 },
  ]);

  const [materials, setMaterials] = useState<LearningMaterial[]>([
    { id: "1", name: "Grammar Workbook - Beginner", type: "PDF" },
    { id: "2", name: "Conversation Starters", type: "PDF" },
  ]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      } else {
        toast.error("Course not found");
        navigate("/courses");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
    fetchCourse();
  }, [id, navigate]);

  const isManagement = ["ADMIN", "MANAGER", "TEACHER"].includes(userRole);
  const isSuperAdmin = ["ADMIN", "MANAGER"].includes(userRole);

  const handleSaveCourse = async (data: CourseFormData) => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t("course.updated_success"));
        setIsEditModalOpen(false);
        fetchCourse();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      toast.error(t("course.save_error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddPathStep = () => {
    if (!isManagement) return;
    const newStep = {
      id: Math.random().toString(36).substr(2, 9),
      title: "New Unit",
      description: "Description of the unit",
      order: learningPath.length + 1
    };
    setLearningPath([...learningPath, newStep]);
    toast.success("Added new learning path unit");
  };

  const handleDeletePathStep = (stepId: string) => {
    if (!isManagement) return;
    setLearningPath(learningPath.filter(s => s.id !== stepId));
    toast.error("Removed unit from learning path");
  };

  const handleAddMaterial = () => {
    if (!isManagement) return;
    const newMat = {
      id: Math.random().toString(36).substr(2, 9),
      name: "New Resource",
      type: "PDF"
    };
    setMaterials([...materials, newMat]);
    toast.success("Added material from library");
  };

  const handleDeleteMaterial = (matId: string) => {
    if (!isManagement) return;
    setMaterials(materials.filter(m => m.id !== matId));
    toast.error("Removed material");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto font-outfit animate-in fade-in duration-500">
      {/* Back Button & Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/courses")}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-[#1A73E8] text-white rounded-lg">
                {course.courseCode}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg">
                {course.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#111827]">{course.name}</h1>
          </div>
        </div>

        {/* Management Actions */}
        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm"
            >
              <Edit className="w-4 h-4" />
              {t("course.edit_title")}
            </button>
            <button
              onClick={() => setIsAssignTeachersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all text-sm font-semibold"
            >
              <GraduationCap className="w-4 h-4" />
              {t("course.assign_teachers")}
            </button>
            <button
              onClick={() => setIsAssignStudentsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all text-sm font-semibold"
            >
              <Users className="w-4 h-4" />
              {t("course.assign_students")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Course Info & Learning Path */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("course.col_capacity")}</p>
                <p className="text-xl font-bold text-gray-900">{course.maxAttendants}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("course.col_schedule")}</p>
                <p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">{course.studySchedule}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t("course.col_level")}</p>
                <p className="text-xl font-bold text-gray-900">{course.level}</p>
              </div>
            </div>
          </div>

          {/* Learning Path */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <MapIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{t("menu.learning_path")}</h2>
                </div>
              </div>
              {isManagement && (
                <button
                  onClick={handleAddPathStep}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"
                >
                  <Plus className="w-4 h-4" />
                  {t("course.add_lesson")}
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {learningPath.map((step, index) => (
                  <div key={step.id} className="group flex items-start gap-6 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {index + 1}
                      </div>
                      {index < learningPath.length - 1 && <div className="w-0.5 h-12 bg-gray-100" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                        {isManagement && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePathStep(step.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Instructor & Materials */}
        <div className="space-y-8">
          {/* Instructor Card */}
          <section className="bg-[#1A73E8] rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
            <h2 className="text-lg font-bold mb-4 opacity-90">{t("Instructor")}</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold">
                {course.teacherNames ? course.teacherNames[0] : "T"}
              </div>
              <div>
                <p className="font-bold text-xl">{course.teacherNames || t("dashboard.ms_thuthao")}</p>
              </div>
            </div>
          </section>

          {/* Learning Materials */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="font-bold text-gray-900">{t("learning_path.materials")}</h2>
              </div>
              {isManagement && (
                <button
                  onClick={handleAddMaterial}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {materials.map((mat) => (
                <div key={mat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{mat.name}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{mat.type}</p>
                    </div>
                  </div>
                  {isManagement ? (
                    <button
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {materials.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-4 italic">No materials added yet</p>
              )}
            </div>
          </section>

          {/* About Section */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">{t("course.description")}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {course.description || "No description provided for this course. Start learning to explore the curriculum and resources available."}
            </p>
          </section>
        </div>
      </div>

      {/* Modals */}
      {isSuperAdmin && (
        <>
          <CourseFormModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveCourse}
            course={{
              ...course,
              description: course.description || "",
            }}
            mode="edit"
            loading={formLoading}
          />

          <AssignStudentsModal
            courseId={course.id}
            courseName={course.name}
            isOpen={isAssignStudentsOpen}
            onClose={() => setIsAssignStudentsOpen(false)}
          />

          <AssignTeachersModal
            courseId={course.id}
            courseName={course.name}
            isOpen={isAssignTeachersOpen}
            onClose={() => setIsAssignTeachersOpen(false)}
          />
        </>
      )}
    </div>
  );
}
