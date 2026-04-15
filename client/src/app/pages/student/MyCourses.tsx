import { BookOpen, Clock, CheckCircle2 } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
  teacherNames?: string;
}

export function MyCourses() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const res = await fetch("/api/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  const getCourseColor = (title: string, index: number) => {
    if (title.toLowerCase().includes("english")) return "blue";
    if (title.toLowerCase().includes("math")) return "green";
    if (title.toLowerCase().includes("science")) return "purple";
    const colors = ["blue", "green", "purple", "orange"];
    return colors[index % colors.length];
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 font-outfit">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">{t("My Courses")}</h1>
        <p className="text-[#6B7280]">{t("Track your progress across all subjects")}</p>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {courses.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t("course.no_courses")}</p>
          </div>
        ) : (
          courses.map((course, index) => {
            const color = getCourseColor(course.name, index);
            // Mock some data that isn't in DB yet to keep UI beautiful
            const progress = course.status === "COMPLETED" ? 100 : (15 + (index * 20)) % 100;
            const completedLessons = Math.floor((progress / 100) * 30);
            
            return (
              <div
                key={course.id}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500 font-outfit"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Course Icon */}
                  <div
                    className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      color === "blue"
                        ? "bg-[#EEF5FF]"
                        : color === "green"
                        ? "bg-[#DCFCE7]"
                        : color === "purple"
                        ? "bg-[#F3E8FF]"
                        : "bg-[#FFF4E5]"
                    }`}
                  >
                    <BookOpen
                      className={`w-10 h-10 ${
                        color === "blue"
                          ? "text-[#1A73E8]"
                          : color === "green"
                          ? "text-[#22C55E]"
                          : color === "purple"
                          ? "text-[#8B5CF6]"
                          : "text-[#F59E0B]"
                      }`}
                    />
                  </div>

                  {/* Course Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-[#111827] mb-1">
                          {course.name} - {levelLabel(course.level)}
                        </h3>
                        <p className="text-sm text-[#6B7280]">
                          <span className="font-medium text-gray-900">{t("Instructor")}:</span> {course.teacherNames || t("dashboard.ms_thuthao")}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                          course.status === "COMPLETED"
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : course.status === "ACTIVE"
                            ? "bg-[#DBEAFE] text-[#1D4ED8]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {course.status === "ACTIVE" ? t("dashboard.in_progress") : course.status === "COMPLETED" ? t("learning_path.completed") : course.status}
                      </span>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4 mt-4">
                      <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                        <span>
                          {completedLessons} / 30 {t("lessons completed")}
                        </span>
                        <span className="font-bold text-gray-900">{progress}%</span>
                      </div>
                      <Progress.Root
                        className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2.5"
                        value={progress}
                      >
                        <Progress.Indicator
                          className={`w-full h-full transition-transform duration-700 ease-out rounded-full ${
                            color === "blue"
                              ? "bg-gradient-to-r from-[#1A73E8] to-[#6C63FF]"
                              : color === "green"
                              ? "bg-gradient-to-r from-[#22C55E] to-[#10B981]"
                              : color === "purple"
                              ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]"
                              : "bg-gradient-to-r from-[#F59E0B] to-[#EF4444]"
                          }`}
                          style={{ transform: `translateX(-${100 - progress}%)` }}
                        />
                      </Progress.Root>
                    </div>

                    {/* Schedule info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-6">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{course.studySchedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="font-mono text-xs font-bold text-[#1A73E8]">{course.courseCode}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {course.status === "COMPLETED" ? (
                        <>
                          <button className="bg-gradient-to-r from-[#22C55E] to-[#10B981] text-white py-2.5 px-6 rounded-xl font-bold hover:shadow-lg hover:shadow-green-100 transition-all text-sm">
                            {t("Review Course")}
                          </button>
                          <button className="border border-[#E5E7EB] text-[#6B7280] py-2.5 px-4 rounded-xl font-semibold hover:bg-[#F8F9FA] transition-all text-sm">
                            {t("View Certificate")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className={`text-white py-2.5 px-8 rounded-xl font-bold shadow-lg transition-all text-sm ${
                              color === "blue"
                                ? "bg-gradient-to-r from-[#1A73E8] to-[#1557B0] hover:shadow-blue-100"
                                : color === "green"
                                ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:shadow-green-100"
                                : color === "purple"
                                ? "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:shadow-purple-100"
                                : "bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:shadow-orange-100"
                            }`}
                          >
                            {t("Continue Learning")}
                          </button>
                          <button 
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="border border-[#E5E7EB] text-[#6B7280] py-2.5 px-6 rounded-xl font-semibold hover:bg-[#F8F9FA] transition-all text-sm"
                          >
                            {t("Course Details")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
