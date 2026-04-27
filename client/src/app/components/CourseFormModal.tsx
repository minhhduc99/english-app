import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export interface CourseFormData {
  id?: string;
  name: string;
  courseCode: string;
  level: string;
  startDate: string;
  endDate: string;
  studySchedule: string;
  maxAttendants: number;
  description: string;
  status?: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CourseFormData) => void;
  course?: CourseFormData | null;
  mode: "add" | "edit";
  loading?: boolean;
  hasTeacher?: boolean;
}

const LEVELS = [
  { value: "BEGINNER", labelEn: "Beginner", labelVi: "Sơ cấp" },
  { value: "ELEMENTARY", labelEn: "Elementary", labelVi: "Cơ bản" },
  { value: "INTERMEDIATE", labelEn: "Intermediate", labelVi: "Trung cấp" },
  { value: "UPPER_INTERMEDIATE", labelEn: "Upper Intermediate", labelVi: "Trung cấp cao" },
  { value: "ADVANCED", labelEn: "Advanced", labelVi: "Nâng cao" },
];

const STATUSES = [
  { value: "DRAFT", labelEn: "Draft", labelVi: "Nháp" },
  { value: "ACTIVE", labelEn: "Active", labelVi: "Đang hoạt động" },
  { value: "COMPLETED", labelEn: "Completed", labelVi: "Hoàn thành" },
  { value: "CANCELLED", labelEn: "Cancelled", labelVi: "Đã hủy" },
];

const emptyForm: CourseFormData = {
  name: "",
  courseCode: "",
  level: "BEGINNER",
  startDate: "",
  endDate: "",
  studySchedule: "",
  maxAttendants: 30,
  description: "",
  status: "DRAFT",
};

export function CourseFormModal({
  isOpen,
  onClose,
  onSave,
  course,
  mode,
  loading,
  hasTeacher = false,
}: CourseFormModalProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<CourseFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && course) {
        const formatDate = (date: string | undefined) => {
          if (!date) return "";
          return date.includes("T") ? date.split("T")[0] : date;
        };
        const sanitizedCourse = {
          ...course,
          startDate: formatDate(course.startDate),
          endDate: formatDate(course.endDate),
        };
        setFormData(sanitizedCourse);
        const schedule = sanitizedCourse.studySchedule;
        if (schedule) {
          const lastSpaceIndex = schedule.lastIndexOf(" ");
          const daysPart = lastSpaceIndex === -1 ? schedule : schedule.substring(0, lastSpaceIndex);
          const timePart = lastSpaceIndex === -1 ? "" : schedule.substring(lastSpaceIndex + 1);
          
          setSelectedDays(daysPart ? daysPart.split(", ").map(d => d.trim()).filter(Boolean) : []);
          if (timePart.includes("-")) {
            const [start, end] = timePart.split("-");
            setStartTime(start);
            setEndTime(end);
          } else {
            setStartTime(timePart);
            setEndTime("");
          }
        }
      } else {
        setFormData({ ...emptyForm });
        setSelectedDays([]);
        setStartTime("");
        setEndTime("");
      }
    }
    setErrors({});
  }, [mode, course, isOpen]);

  const handleDayToggle = (dayId: string) => {
    let newDays;
    if (selectedDays.includes(dayId)) {
      newDays = selectedDays.filter(d => d !== dayId);
    } else {
      const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      newDays = [...selectedDays, dayId].sort((a, b) => weekOrder.indexOf(a) - weekOrder.indexOf(b));
    }
    setSelectedDays(newDays);
    updateScheduleString(newDays, startTime, endTime);
  };

  const updateScheduleString = (days: string[], start: string, end: string) => {
    const time = (start && end) ? `${start}-${end}` : (start || end || "");
    const schedule = `${days.join(", ")} ${time}`.trim();
    setFormData(prev => ({ ...prev, studySchedule: schedule }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t("course.error_name_required");
    if (!formData.courseCode.trim()) newErrors.courseCode = t("course.error_code_required");
    if (!formData.startDate) newErrors.startDate = t("course.error_start_required");
    if (!formData.endDate) newErrors.endDate = t("course.error_end_required");
    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = t("course.error_end_after_start");
    }
    if (!formData.studySchedule.trim()) newErrors.studySchedule = t("course.error_schedule_required");
    if (formData.maxAttendants < 1 || formData.maxAttendants > 500) {
      newErrors.maxAttendants = t("course.error_attendants_range");
    }
    if (formData.status === "ACTIVE" && !hasTeacher) {
      newErrors.status = t("course.error_teacher_required_for_active");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent transition-all text-sm";
  const errorClass = "text-xs text-red-500 mt-1";

  const DAYS = [
    { id: "Mon", labelVi: "H", labelEn: "M" },
    { id: "Tue", labelVi: "B", labelEn: "T" },
    { id: "Wed", labelVi: "T", labelEn: "W" },
    { id: "Thu", labelVi: "N", labelEn: "T" },
    { id: "Fri", labelVi: "S", labelEn: "F" },
    { id: "Sat", labelVi: "B", labelEn: "S" },
    { id: "Sun", labelVi: "C", labelEn: "S" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === "add" ? t("course.add_title") : t("course.edit_title")}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {mode === "add" ? t("course.add_subtitle") : t("course.edit_subtitle")}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Row 1: Name + Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("course.name")} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`${inputClass} ${errors.name ? "border-red-300 ring-1 ring-red-300" : ""}`}
                  placeholder={t("course.name_placeholder")}
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("course.code")} *</label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value.toUpperCase() }))}
                  className={`${inputClass} ${errors.courseCode ? "border-red-300 ring-1 ring-red-300" : ""}`}
                  placeholder={t("course.code_placeholder")}
                />
                {errors.courseCode && <p className={errorClass}>{errors.courseCode}</p>}
              </div>
            </div>

            {/* Row 2: Level + Max Attendants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("course.level")} *</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  className={inputClass}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {language === "vi" ? lvl.labelVi : lvl.labelEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("course.max_attendants")} *</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={formData.maxAttendants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAttendants: parseInt(e.target.value) || 0 }))}
                  className={`${inputClass} ${errors.maxAttendants ? "border-red-300 ring-1 ring-red-300" : ""}`}
                />
                {errors.maxAttendants && <p className={errorClass}>{errors.maxAttendants}</p>}
              </div>
            </div>

            {/* Row 3: Start Date + End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("course.start_date")} *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={`${inputClass} ${errors.startDate ? "border-red-300 ring-1 ring-red-300" : ""}`}
                />
                {errors.startDate && <p className={errorClass}>{errors.startDate}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("course.end_date")} *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={`${inputClass} ${errors.endDate ? "border-red-300 ring-1 ring-red-300" : ""}`}
                />
                {errors.endDate && <p className={errorClass}>{errors.endDate}</p>}
              </div>
            </div>

            {/* Row 4: Study Schedule */}
            <div>
              <label className={labelClass}>{t("course.study_schedule")} *</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all border ${
                        isSelected
                          ? "bg-[#1A73E8] border-[#1A73E8] text-white shadow-md shadow-blue-100"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {language === "vi" ? day.labelVi : day.labelEn}
                    </button>
                  );
                })}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t("course.start_time")}</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        updateScheduleString(selectedDays, e.target.value, endTime);
                      }}
                      className={`${inputClass} ${errors.studySchedule ? "border-red-300" : ""}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{t("course.end_time")}</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(e.target.value);
                        updateScheduleString(selectedDays, startTime, e.target.value);
                      }}
                      className={`${inputClass} ${errors.studySchedule ? "border-red-300" : ""}`}
                    />
                  </div>
                </div>
              </div>
              {errors.studySchedule && <p className={errorClass}>{errors.studySchedule}</p>}
            </div>

            {/* Row 5: Status (only in edit mode) */}
            {mode === "edit" && (
              <div>
                <label className={labelClass}>{t("course.status")}</label>
                <select
                  value={formData.status || "DRAFT"}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={inputClass}
                >
                  {STATUSES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {language === "vi" ? st.labelVi : st.labelEn}
                    </option>
                  ))}
                </select>
                {errors.status && <p className={errorClass}>{errors.status}</p>}
              </div>
            )}

            {/* Row 6: Description */}
            <div>
              <label className={labelClass}>{t("course.description")}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={`${inputClass} min-h-[100px] resize-y`}
                placeholder={t("course.description_placeholder")}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm"
              >
                {t("course.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#1A73E8] text-white rounded-xl hover:bg-[#1557B0] transition-colors font-bold text-sm shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {mode === "add" ? t("course.create_btn") : t("course.save_btn")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
