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
  FolderOpen,
  Target,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
import { CourseFormModal, CourseFormData } from "../components/CourseFormModal";
import { AssignStudentsModal } from "../components/manager/AssignStudentsModal";
import { AssignTeachersModal } from "../components/manager/AssignTeachersModal";
import { SelectMaterialModal } from "../components/manager/SelectMaterialModal";
import { LessonFormModal } from "../components/LessonFormModal";
import { LessonContentModal } from "../components/LessonContentModal";
import { TestManagementModal } from "../components/TestManagementModal";
import { TestTakingModal } from "../components/TestTakingModal";
import { translateSchedule } from "../utils/schedule";

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
  vocabularyCount: number;
  materialCount: number;
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
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathStep[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [isAssignTeachersOpen, setIsAssignTeachersOpen] = useState(false);
  const [isSelectMaterialOpen, setIsSelectMaterialOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isLessonContentOpen, setIsLessonContentOpen] = useState(false);
  const [isTestManagementOpen, setIsTestManagementOpen] = useState(false);
  const [isTestTakingOpen, setIsTestTakingOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [editingLesson, setEditingLesson] = useState<LearningPathStep | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [selectedLessonTitle, setSelectedLessonTitle] = useState<string>("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchCourseData = async () => {
    try {
      const authHeader = { "Authorization": `Bearer ${localStorage.getItem("token")}` };
      
      const responses = await Promise.all([
        fetch(`/api/courses/${id}`, { headers: authHeader }),
        fetch(`/api/courses/${id}/materials`, { headers: authHeader }),
        fetch(`/api/lessons/course/${id}`, { headers: authHeader }),
        fetch(`/api/course-exams/${id}`, { headers: authHeader })
      ]);

      const [courseRes, materialsRes, lessonsRes, testsRes] = responses;

      if (courseRes.ok) {
        const courseData = await courseRes.json();
        setCourse(courseData);
      } else {
        toast.error("Course not found");
        navigate("/courses");
        return;
      }

      if (materialsRes.ok) {
        const materialsData = await materialsRes.json();
        setMaterials(materialsData);
      }

      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        setLearningPath(lessonsData);
      }

      if (testsRes.ok) {
        const testsData = await testsRes.json();
        setTests(testsData);
      }
    } catch (error) {
      console.error("Failed to fetch course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
    fetchCourseData();
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
        fetchCourseData();
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      toast.error(t("course.save_error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddMaterialsBatch = async (materialIds: string[]) => {
    try {
      const res = await fetch(`/api/courses/${id}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ materialIds }),
      });

      if (res.ok) {
        toast.success("Materials added to course");
        setIsSelectMaterialOpen(false);
        fetchCourseData();
      } else {
        toast.error("Failed to add materials");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    if (!window.confirm("Remove this material from the course?")) return;

    try {
      const res = await fetch(`/api/courses/${id}/materials/${matId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (res.ok) {
        toast.success("Material removed");
        fetchCourseData();
      } else {
        toast.error("Failed to remove material");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!window.confirm("Delete this exam? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/course-exams/${id}/${testId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (res.ok) {
        toast.success("Exam deleted");
        fetchCourseData();
      } else {
        toast.error("Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const handleEditTest = async (testId: string) => {
    try {
      const res = await fetch(`/api/course-exams/${id}/${testId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const testData = await res.json();
        setEditingTest(testData);
        setIsTestManagementOpen(true);
      } else {
        toast.error("Failed to load exam details");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    }
  };

  const handleSaveLesson = async (data: { title: string; description: string }) => {
    setFormLoading(true);
    try {
      const method = editingLesson ? "PUT" : "POST";
      const url = editingLesson ? `/api/lessons/${editingLesson.id}` : "/api/lessons";
      const payload = editingLesson 
        ? data 
        : { ...data, courseId: id, order: learningPath.length + 1 };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingLesson ? "Lesson updated" : "Lesson added to learning path");
        setIsLessonModalOpen(false);
        setEditingLesson(null);
        fetchCourseData();
      } else {
        toast.error("Failed to save lesson");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePathStep = async (stepId: string) => {
    if (!window.confirm("Delete this lesson from the learning path?")) return;

    try {
      const res = await fetch(`/api/lessons/${stepId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });

      if (res.ok) {
        toast.success("Lesson deleted");
        fetchCourseData();
      } else {
        toast.error("Failed to delete lesson");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
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
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-[#1A73E8] text-white rounded-lg">{course.courseCode}</span>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg">{course.status}</span>
            </div>
            <h1 className="text-3xl font-bold text-[#111827]">{course.name}</h1>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm">
              <Edit className="w-4 h-4" />{t("course.edit_title")}
            </button>
            <button onClick={() => setIsAssignTeachersOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all text-sm font-semibold">
              <GraduationCap className="w-4 h-4" />{t("course.assign_teachers")}
            </button>
            <button onClick={() => setIsAssignStudentsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all text-sm font-semibold">
              <Users className="w-4 h-4" />{t("course.assign_students")}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
               <div><p className="text-sm text-gray-500">{t("course.col_capacity")}</p><p className="text-xl font-bold text-gray-900">{course.maxAttendants}</p></div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div>
               <div><p className="text-sm text-gray-500">{t("course.col_schedule")}</p><p className="text-lg font-bold text-gray-900 truncate max-w-[150px]">{translateSchedule(course.studySchedule, language)}</p></div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
               <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"><BookOpen className="w-6 h-6 text-green-600" /></div>
               <div><p className="text-sm text-gray-500">{t("course.col_level")}</p><p className="text-xl font-bold text-gray-900">{course.level}</p></div>
             </div>
          </div>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><MapIcon className="w-5 h-5 text-indigo-600" /></div>
                 <h2 className="text-xl font-bold text-gray-900">{t("menu.learning_path")}</h2>
               </div>
               {isManagement && (
                 <button onClick={() => { setEditingLesson(null); setIsLessonModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100">
                   <Plus className="w-4 h-4" />{t("course.add_lesson")}
                 </button>
               )}
             </div>
             <div className="p-6">
               <div className="space-y-4">
                 {learningPath.map((step, index) => (
                   <div key={step.id} className="group flex items-start gap-6 p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                     <div className="flex flex-col items-center">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{index + 1}</div>
                       {index < learningPath.length - 1 && <div className="w-0.5 h-12 bg-gray-100" />}
                     </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{step.title}</h3>
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-2 mr-4">
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">
                                <BookOpen className="w-3 h-3" /> {step.vocabularyCount || 0}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-md">
                                <FileText className="w-3 h-3" /> {step.materialCount || 0}
                              </span>
                            </div>
                            {isManagement && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => { 
                                    setSelectedLessonId(step.id); 
                                    setSelectedLessonTitle(step.title); 
                                    setIsLessonContentOpen(true); 
                                  }} 
                                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Manage Content"
                                >
                                  <FolderOpen className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setEditingLesson(step); setIsLessonModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeletePathStep(step.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <button 
                          onClick={() => { 
                            setSelectedLessonId(step.id); 
                            setSelectedLessonTitle(step.title); 
                            setIsLessonContentOpen(true); 
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/btn"
                        >
                          View details <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                 {learningPath.length === 0 && <p className="text-center text-gray-400 py-8 italic">No lessons in path yet</p>}
               </div>
             </div>
          </section>

          {/* Exam Zone */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-rose-600" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-gray-900">{t("course.exam_zone")}</h2>
                    <p className="text-xs text-gray-500">{t("course.exam_zone_desc")}</p>
                 </div>
               </div>
               {isManagement && (
                 <button 
                  onClick={() => { setEditingTest(null); setIsTestManagementOpen(true); }} 
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all text-sm font-bold shadow-lg shadow-rose-100"
                 >
                   <Plus className="w-4 h-4" /> {t("course.create_test")}
                 </button>
               )}
             </div>
             <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tests.map((test) => (
                    <div key={test.id} className="p-5 rounded-2xl border border-gray-100 hover:border-rose-100 hover:bg-rose-50/20 transition-all group relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <HelpCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        {isManagement && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditTest(test.id)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteTest(test.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">{test.title}</h3>
                      <p className="text-xs text-gray-500 mb-4 line-clamp-1">{test.description || "No description"}</p>
                      
                      <div className="flex items-center gap-3 mb-5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" /> {test.timeLimit}m
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                          <Target className="w-3 h-3" /> {test.passScore}%
                        </span>
                      </div>

                      {userRole === "STUDENT" ? (
                        <button 
                          onClick={() => { setSelectedTestId(test.id); setIsTestTakingOpen(true); }}
                          className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                        >
                          {t("course.do_test")}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEditTest(test.id)}
                          className="w-full py-2.5 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-50 transition-all"
                        >
                          {t("course.manage_test")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {tests.length === 0 && (
                  <div className="text-center py-10">
                    <Target className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                    <p className="text-gray-400 italic text-sm">{t("course.no_exams")}</p>
                  </div>
                )}
             </div>
          </section>
        </div>

        <div className="space-y-8">
          {course.teacherNames && (
            <section className="bg-[#1A73E8] rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
              <h2 className="text-lg font-bold mb-4 opacity-90">{t("Instructor")}</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold">{course.teacherNames[0]}</div>
                <div><p className="font-bold text-xl">{course.teacherNames}</p></div>
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><FolderOpen className="w-5 h-5 text-green-600" /></div>
                <h2 className="font-bold text-gray-900">{t("learning_path.materials")}</h2>
              </div>
              {isManagement && (
                <button onClick={() => setIsSelectMaterialOpen(true)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"><Plus className="w-5 h-5" /></button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {materials.map((mat) => (
                <div key={mat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm"><FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" /></div>
                    <div><p className="text-sm font-bold text-gray-900">{mat.name}</p><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{mat.type}</p></div>
                  </div>
                  {isManagement ? <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button> : <button className="p-2 text-indigo-600 hover:text-indigo-700 transition-colors"><ChevronRight className="w-5 h-5" /></button>}
                </div>
              ))}
              {materials.length === 0 && <p className="text-center text-sm text-gray-400 py-4 italic">No materials added yet</p>}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-3">{t("course.description")}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{course.description || "No description provided."}</p>
          </section>
        </div>
      </div>

      <LessonFormModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveLesson}
        initialData={editingLesson || undefined}
        loading={formLoading}
      />

      <SelectMaterialModal isOpen={isSelectMaterialOpen} onClose={() => setIsSelectMaterialOpen(false)} onSelect={handleAddMaterialsBatch} alreadyAssignedIds={materials.map(m => m.id)} />

      <LessonContentModal
        isOpen={isLessonContentOpen}
        onClose={() => setIsLessonContentOpen(false)}
        lessonId={selectedLessonId}
        lessonTitle={selectedLessonTitle}
        courseId={id || ""}
        onContentUpdate={fetchCourseData}
      />

      {isSuperAdmin && (
        <>
          <CourseFormModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleSaveCourse} 
            course={{ ...course, description: course.description || "" }} 
            mode="edit" 
            loading={formLoading} 
            hasTeacher={!!course.teacherNames}
          />
          <AssignStudentsModal courseId={course.id || ''} courseName={course.name} isOpen={isAssignStudentsOpen} onClose={() => setIsAssignStudentsOpen(false)} onSuccess={fetchCourseData} />
          <AssignTeachersModal courseId={course.id || ''} courseName={course.name} isOpen={isAssignTeachersOpen} onClose={() => setIsAssignTeachersOpen(false)} onSuccess={fetchCourseData} />
        </>
      )}

      <TestManagementModal
        isOpen={isTestManagementOpen}
        onClose={() => setIsTestManagementOpen(false)}
        courseId={id || ""}
        test={editingTest}
        onSuccess={fetchCourseData}
      />

      <TestTakingModal
        isOpen={isTestTakingOpen}
        onClose={() => setIsTestTakingOpen(false)}
        courseId={id || ""}
        testId={selectedTestId}
        onComplete={fetchCourseData}
      />
    </div>
  );
}
