import { BookOpen, Clock, CheckCircle2, Circle } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useLanguage } from "../../contexts/LanguageContext";

const courses = [
  {
    title: "English Language - Level 5",
    instructor: "Ms. Thu Thao",
    progress: 65,
    status: "In Progress",
    totalLessons: 30,
    completedLessons: 19,
    nextLesson: "Unit 3: Daily Conversations",
    color: "blue",
  },
  {
    title: "Math Fundamentals",
    instructor: "Mr. Hoang Nam",
    progress: 45,
    status: "In Progress",
    totalLessons: 25,
    completedLessons: 11,
    nextLesson: "Chapter 5: Fractions",
    color: "green",
  },
  {
    title: "Science Explorer",
    instructor: "Ms. Lan Anh",
    progress: 100,
    status: "Completed",
    totalLessons: 20,
    completedLessons: 20,
    nextLesson: null,
    color: "purple",
  },
];

export function MyCourses() {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">{t("My Courses")}</h1>
        <p className="text-[#6B7280]">{t("Track your progress across all subjects")}</p>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {courses.map((course, index) => (
          <div
            key={index}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-6">
              {/* Course Icon */}
              <div
                className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  course.color === "blue"
                    ? "bg-[#EEF5FF]"
                    : course.color === "green"
                    ? "bg-[#DCFCE7]"
                    : "bg-[#F3E8FF]"
                }`}
              >
                <BookOpen
                  className={`w-10 h-10 ${
                    course.color === "blue"
                      ? "text-[#1A73E8]"
                      : course.color === "green"
                      ? "text-[#22C55E]"
                      : "text-[#8B5CF6]"
                  }`}
                />
              </div>

              {/* Course Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-[#111827] mb-1">
                      {course.title === "English Language - Level 5" 
                        ? t("dashboard.english") + " - " + t("Level 5")
                        : course.title === "Math Fundamentals" ? t("Math Fundamentals")
                        : t("Science Explorer")}
                    </h3>
                    <p className="text-sm text-[#6B7280]">{t("Instructor")}: {course.instructor}</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-xs font-medium ${
                      course.status === "Completed"
                        ? "bg-[#DCFCE7] text-[#166534]"
                        : "bg-[#DBEAFE] text-[#1D4ED8]"
                    }`}
                  >
                    {course.status === "In Progress" ? t("dashboard.in_progress") : t("learning_path.completed")}
                  </span>
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                    <span>
                      {course.completedLessons} / {course.totalLessons} {t("lessons completed")}
                    </span>
                    <span className="font-medium">{course.progress}%</span>
                  </div>
                  <Progress.Root
                    className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                    value={course.progress}
                  >
                    <Progress.Indicator
                      className={`w-full h-full transition-transform duration-300 ${
                        course.color === "blue"
                          ? "bg-[#1A73E8]"
                          : course.color === "green"
                          ? "bg-[#22C55E]"
                          : "bg-[#8B5CF6]"
                      }`}
                      style={{ transform: `translateX(-${100 - course.progress}%)` }}
                    />
                  </Progress.Root>
                </div>

                {/* Next Lesson or Completed Message */}
                {course.nextLesson ? (
                  <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{t("Next")}: {
                      course.title === "English Language - Level 5" ? t("dashboard.topic_en").split(" - ")[0] :
                      course.title === "Math Fundamentals" ? t("dashboard.topic_math").split(" - ")[0] :
                      course.nextLesson
                    }</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-[#22C55E] mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("Course completed! Well done!")}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {course.status === "Completed" ? (
                    <>
                      <button className="bg-[#22C55E] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#16A34A] transition-colors">
                        {t("Review Course")}
                      </button>
                      <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                        {t("View Certificate")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`text-white py-2 px-6 rounded-lg font-medium transition-colors ${
                          course.color === "blue"
                            ? "bg-[#1A73E8] hover:bg-[#1557B0]"
                            : "bg-[#22C55E] hover:bg-[#16A34A]"
                        }`}
                      >
                        {t("Continue Learning")}
                      </button>
                      <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                        {t("Course Details")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
