import { BookOpen, Users, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { MyCourses as StudentCourses } from "./student/MyCourses";
import { useLanguage } from "../contexts/LanguageContext";

function AdminCourses() {
  const { t } = useLanguage();
  const courses = [
    { id: 1, name: "Mathematics", students: 156, duration: "12 weeks", status: "Active" },
    { id: 2, name: "Science", students: 142, duration: "10 weeks", status: "Active" },
    { id: 3, name: "English", students: 178, duration: "14 weeks", status: "Active" },
    { id: 4, name: "History", students: 134, duration: "8 weeks", status: "Active" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("Courses Component")}</h1>
        <p className="text-gray-500 mt-1">{t("Manage your courses and curriculum")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#1A73E8]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(course.name)}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{course.students} {t("Students_Label")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{course.duration}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {t(course.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
