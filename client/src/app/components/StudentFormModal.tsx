import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Student } from "../types/student";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<Student, "id">) => void;
  student?: Student | null;
  mode: "add" | "edit";
}

export function StudentFormModal({ isOpen, onClose, onSave, student, mode }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    gender: "",
    dateOfBirth: "",
    class: "",
    email: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
  });

  useEffect(() => {
    if (mode === "edit" && student) {
      setFormData({
        studentId: student.studentId,
        name: student.name,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        class: student.class,
        email: student.email,
        phone: student.phone,
        status: student.status,
      });
    } else {
      setFormData({
        studentId: "",
        name: "",
        gender: "",
        dateOfBirth: "",
        class: "",
        email: "",
        phone: "",
        status: "Active",
      });
    }
  }, [mode, student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === "add" ? "Add New Student" : "Edit Student"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                  placeholder="e.g., STU001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  required
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                >
                  <option value="">Select class</option>
                  <option value="Class 1A">Class 1A</option>
                  <option value="Class 1B">Class 1B</option>
                  <option value="Class 2A">Class 2A</option>
                  <option value="Class 2B">Class 2B</option>
                  <option value="Class 3A">Class 3A</option>
                  <option value="Class 3B">Class 3B</option>
                  <option value="Class 4A">Class 4A</option>
                  <option value="Class 4B">Class 4B</option>
                  <option value="Class 5A">Class 5A</option>
                  <option value="Class 5B">Class 5B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors"
              >
                {mode === "add" ? "Add Student" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
