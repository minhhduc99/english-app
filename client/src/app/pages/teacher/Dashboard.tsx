import { useState, useEffect } from "react";
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
  ArrowRight,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  CreditCard,
  Gamepad2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { translateSchedule } from "../../utils/schedule";
import { useLanguage } from "../../contexts/LanguageContext";

interface Course {
  id: string;
  name: string;
  courseCode: string;
  studySchedule: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function Dashboard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDate] = useState(new Date());
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    materials: { 
      total: 0, 
      thisMonth: 0, 
      types: [] as { type: string; count: number }[],
      categories: [] as { category: string; count: number }[]
    },
    global: {
      flashcards: 0,
      games: 0
    }
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
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

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/teacher-stats", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchCourses();
    fetchStats();
  }, []);

  const getDayName = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const isToday = (course: Course) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dayName = getDayName(today);
    
    // Check if within date range
    if (todayStr < course.startDate || todayStr > course.endDate) return false;
    
    // Day synonyms for matching (English & Vietnamese)
    const daySynonyms: Record<string, string[]> = {
      Mon: ["Mon", "Thứ Hai", "Thứ 2", "H"],
      Tue: ["Tue", "Thứ Ba", "Thứ 3", "B"],
      Wed: ["Wed", "Thứ Tư", "Thứ 4", "T"],
      Thu: ["Thu", "Thứ Năm", "Thứ 5", "N"],
      Fri: ["Fri", "Thứ Sáu", "Thứ 6", "S"],
      Sat: ["Sat", "Thứ Bảy", "Thứ 7", "B"],
      Sun: ["Sun", "Chủ Nhật", "CN", "C"],
    };

    const synonyms = daySynonyms[dayName] || [dayName];
    return synonyms.some(syn => course.studySchedule.includes(syn));
  };

  const isUpcoming = (course: Course) => {
    const today = new Date();
    
    // Day synonyms for matching (English & Vietnamese)
    const daySynonyms: Record<string, string[]> = {
      Mon: ["Mon", "Thứ Hai", "Thứ 2", "H"],
      Tue: ["Tue", "Thứ Ba", "Thứ 3", "B"],
      Wed: ["Wed", "Thứ Tư", "Thứ 4", "T"],
      Thu: ["Thu", "Thứ Năm", "Thứ 5", "N"],
      Fri: ["Fri", "Thứ Sáu", "Thứ 6", "S"],
      Sat: ["Sat", "Thứ Bảy", "Thứ 7", "B"],
      Sun: ["Sun", "Chủ Nhật", "CN", "C"],
    };

    // Simplistic upcoming check: next 7 days, excluding today
    for (let i = 1; i <= 7; i++) {
       const futureDate = new Date();
       futureDate.setDate(today.getDate() + i);
       const futureStr = futureDate.toISOString().split("T")[0];
       const dayName = getDayName(futureDate);
       
       if (futureStr >= course.startDate && futureStr <= course.endDate) {
         const synonyms = daySynonyms[dayName] || [dayName];
         if (synonyms.some(syn => course.studySchedule.includes(syn))) return true;
       }
    }
    return false;
  };

  const getTodayClasses = () => {
    return courses.filter(isToday).map(c => ({
      id: c.id,
      time: c.studySchedule.split(" ").slice(-1)[0], // Assuming "Day Day HH:mm-HH:mm"
      subject: c.name,
      class: c.courseCode,
      room: "TBD", // Room not in Course entity yet
      type: "in-person",
      status: "upcoming",
    }));
  };

  const getUpcomingClasses = () => {
    // Day synonyms for matching (English & Vietnamese)
    const daySynonyms: Record<string, string[]> = {
      Mon: ["Mon", "Thứ Hai", "Thứ 2", "H"],
      Tue: ["Tue", "Thứ Ba", "Thứ 3", "B"],
      Wed: ["Wed", "Thứ Tư", "Thứ 4", "T"],
      Thu: ["Thu", "Thứ Năm", "Thứ 5", "N"],
      Fri: ["Fri", "Thứ Sáu", "Thứ 6", "S"],
      Sat: ["Sat", "Thứ Bảy", "Thứ 7", "B"],
      Sun: ["Sun", "Chủ Nhật", "CN", "C"],
    };

    return courses.filter(c => !isToday(c) && isUpcoming(c)).map(c => {
      // Find the first upcoming day in next 7 days
      let upcomingInfo = { date: "Upcoming" };
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + i);
        const futureStr = futureDate.toISOString().split("T")[0];
        const dayName = getDayName(futureDate);
        const synonyms = daySynonyms[dayName] || [dayName];
        
        if (futureStr >= c.startDate && futureStr <= c.endDate && synonyms.some(syn => c.studySchedule.includes(syn))) {
          upcomingInfo.date = futureDate.toLocaleDateString(language === 'en' ? 'en-US' : 'vi-VN', { weekday: 'short', month: 'short', day: 'numeric' });
          break;
        }
      }

      return {
        id: c.id,
        date: upcomingInfo.date,
        time: c.studySchedule.split(" ").slice(-1)[0],
        schedule: translateSchedule(c.studySchedule, language),
        subject: c.name,
        class: c.courseCode,
        room: "TBD",
      };
    });
  };

  const todayClasses = getTodayClasses();
  const upcomingClasses = getUpcomingClasses();

  // Learning Materials Statistics
  const materialStats = {
    total: stats.materials.total,
    thisMonth: stats.materials.thisMonth,
    byType: stats.materials.types.length > 0 ? stats.materials.types.map((item) => {
      const typeConfig: Record<string, { icon: any, color: string, label: string }> = {
        PDF: { icon: FileText, color: "bg-red-50 text-red-600", label: "PDFs" },
        MP4: { icon: Video, color: "bg-purple-50 text-purple-600", label: "Videos" },
        PNG: { icon: Image, color: "bg-green-50 text-green-600", label: "Images" },
        JPG: { icon: Image, color: "bg-green-50 text-green-600", label: "Images" },
        JPEG: { icon: Image, color: "bg-green-50 text-green-600", label: "Images" },
        XLSX: { icon: FileSpreadsheet, color: "bg-blue-50 text-blue-600", label: "Sheets" },
        XLS: { icon: FileSpreadsheet, color: "bg-blue-50 text-blue-600", label: "Sheets" },
        PPTX: { icon: FileText, color: "bg-orange-50 text-orange-600", label: "Slides" },
        PPT: { icon: FileText, color: "bg-orange-50 text-orange-600", label: "Slides" },
        DOCX: { icon: FileText, color: "bg-blue-50 text-blue-800", label: "Documents" },
        DOC: { icon: FileText, color: "bg-blue-50 text-blue-800", label: "Documents" },
      };
      const config = typeConfig[item.type] || { icon: FileText, color: "bg-gray-50 text-gray-600", label: item.type };
      return {
        type: config.label,
        count: item.count,
        icon: config.icon,
        color: config.color
      };
    }) : [
      { type: t("menu.learning_materials"), count: 0, icon: FolderOpen, color: "bg-gray-50 text-gray-600" }
    ],
    // Flashcard and Game stats from global API summary
    flashcards: (stats as any).global?.flashcards || 0,
    games: ((stats as any).global?.games || 0) + 3,
    pdfImages: stats.materials.categories.find((c) => c.category === "GENERAL" || !c.category)?.count || 0,
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
    if (status === "ongoing") return t("dashboard.in_progress");
    if (status === "upcoming") return t("dashboard.upcoming");
    return status;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("menu.dashboard")}</h1>
          <p className="text-gray-500 mt-1">
            {language === 'en' ? 'Today is ' : 'Hôm nay là '}
            {selectedDate.toLocaleDateString(language === 'en' ? "en-US" : "vi-VN", { 
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
              <p className="text-sm text-gray-500 mb-1">{t("dashboard.todays_classes")}</p>
              <p className="text-3xl font-semibold text-gray-900">{todayClasses.length}</p>
              <p className="text-xs text-gray-500 mt-1">{todayClasses.length} {t("dashboard.upcoming")}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">{t("dashboard.upcoming")}</p>
              <p className="text-3xl font-semibold text-gray-900">{upcomingClasses.length}</p>
              <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">{t("menu.learning_materials")}</p>
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
              <p className="text-sm text-gray-500 mb-1">{t("menu.attendance")}</p>
              <p className="text-3xl font-semibold text-gray-900">{absentStudents.length}</p>
              <p className="text-xs text-orange-600 mt-1">{lateStudents.length} {t("dashboard.late_arrivals")}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.todays_classes")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("dashboard.your_schedule")}</p>
          </div>
          <button className="text-sm text-[#1A73E8] hover:underline font-medium flex items-center gap-1">
            {t("dashboard.view_full_schedule")}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {todayClasses.length > 0 ? todayClasses.map((classItem) => (
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
                    {t("dashboard.view_details")}
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 text-gray-500 italic">
                {language === 'en' ? 'No classes scheduled for today' : 'Không có lớp học nào được lên lịch cho hôm nay'}
              </div>
            )}
          </div>
        )}
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
                <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.upcoming")}</h2>
                <p className="text-sm text-gray-500">Next 7 days</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingClasses.length > 0 ? upcomingClasses.map((classItem) => (
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
                    <span>{classItem.schedule}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>{classItem.class}</span>
                    <span>•</span>
                    <span>{classItem.room}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 italic text-sm">
                {language === 'en' ? 'No upcoming classes' : 'Không có lớp học sắp tới'}
              </div>
            )}
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
                <h2 className="text-lg font-semibold text-gray-900">{t("menu.learning_materials")}</h2>
                <p className="text-sm text-gray-500">{t("dashboard.total_materials_desc")}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate("/learning-materials")}
              className="text-sm text-[#1A73E8] hover:underline font-medium"
            >
              {t("dashboard.upload_new")}
            </button>
          </div>

          <div className="mb-6 p-4 bg-gradient-to-br from-[#1A73E8] to-[#1557B0] rounded-xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <FileCheck className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">{t("materials.total_materials")}</p>
                <p className="text-3xl font-bold">{materialStats.total}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">+{materialStats.thisMonth} {language === 'en' ? 'this month' : 'tháng này'}</p>
          </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">{t("materials.flashcards")}</span>
                </div>
                <span className="text-lg font-bold text-purple-900">{materialStats.flashcards}</span>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">{t("materials.games")}</span>
                </div>
                <span className="text-lg font-bold text-orange-900">{materialStats.games}</span>
              </div>
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
                <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.absent_today")}</h2>
                <p className="text-sm text-gray-500">{absentStudents.length} {t("menu.students")}</p>
              </div>
            </div>
            <button className="text-sm text-[#1A73E8] hover:underline font-medium">
              {t("attendance.status_all")}
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
                      {t("dashboard.parent_contacted")}
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 flex items-center gap-1 w-fit">
                      <AlertCircle className="w-3 h-3" />
                      {t("dashboard.contact_required")}
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
                <h2 className="text-lg font-semibold text-gray-900">{t("dashboard.late_arrivals")}</h2>
                <p className="text-sm text-gray-500">{lateStudents.length} {t("menu.students")}</p>
              </div>
            </div>
            <button className="text-sm text-[#1A73E8] hover:underline font-medium">
              {t("attendance.status_all")}
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
                    <span>{language === 'en' ? 'Arrived: ' : 'Đến lúc: '}{student.arrivalTime}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.minutesLate > 15
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-orange-50 text-orange-700 border border-orange-200"
                      }`}
                    >
                      {student.minutesLate} {t("dashboard.minutes_late")}
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
