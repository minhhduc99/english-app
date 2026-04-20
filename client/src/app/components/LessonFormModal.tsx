import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
  initialData?: { title: string; description: string };
  loading?: boolean;
}

export function LessonFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading,
}: LessonFormModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: "", description: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? "Edit Lesson" : "Add New Lesson"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Lesson Title</label>
            <input
              required
              type="text"
              placeholder="e.g. Unit 1: Introduction to Greetings"
              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:border-[#1A73E8] focus:bg-white rounded-2xl transition-all outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
            <textarea
              rows={4}
              placeholder="What will students learn in this lesson?..."
              className="w-full px-4 py-3.5 bg-gray-50 border border-transparent focus:border-[#1A73E8] focus:bg-white rounded-2xl transition-all outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 font-bold text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3.5 bg-[#1A73E8] text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 hover:bg-[#1557B0] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
