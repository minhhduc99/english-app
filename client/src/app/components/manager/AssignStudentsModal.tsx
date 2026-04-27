import { useState, useEffect, useMemo } from "react";
import { X, Search, Users, CheckCircle2, UserCheck, Loader2, Save } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
}

interface AssignStudentsModalProps {
  courseId: string | null;
  courseName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignStudentsModal({ courseId, courseName, isOpen, onClose, onSuccess }: AssignStudentsModalProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user?.token || localStorage.getItem("token") || "";
    } catch { return ""; }
  };

  const authHeader = { Authorization: `Bearer ${getToken()}` };

  useEffect(() => {
    if (!isOpen || !courseId) return;
    setLoading(true);
    setSearch("");

    Promise.all([
      fetch("/api/courses/students/available", { headers: authHeader }).then(r => r.json()),
      fetch(`/api/courses/${courseId}/members`, { headers: authHeader }).then(r => r.json()),
    ])
      .then(([all, members]) => {
        setAvailableStudents(all || []);
        const ids = (members || []).map((s: any) => s.id);
        setSelectedIds(ids);
        setOriginalIds(ids);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, courseId]);

  // All hooks must be declared before any conditional return
  const filtered = useMemo(
    () =>
      availableStudents.filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase())
      ),
    [availableStudents, search]
  );

  // Only return null AFTER all hooks have been called
  if (!isOpen || !courseId) return null;

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const allFilteredIds = filtered.map((s) => s.id);
    const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/courses/${courseId}/members`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedIds }),
      });
      setOriginalIds(selectedIds);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      alert("Error assigning students. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase();

  const avatarColors = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-sky-600",
  ];

  const getColor = (id: string) =>
    avatarColors[id.charCodeAt(0) % avatarColors.length];

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));

  const newlyAdded = selectedIds.filter((id) => !originalIds.includes(id)).length;
  const removed = originalIds.filter((id) => !selectedIds.includes(id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col"
           style={{ maxHeight: "85vh" }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A73E8] to-[#6C63FF] p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Students</h2>
                {courseName && (
                  <p className="text-blue-100 text-sm mt-0.5 truncate max-w-[280px]">{courseName}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
              <UserCheck className="w-4 h-4 text-blue-100" />
              <span className="text-sm font-semibold">{selectedIds.length} enrolled</span>
            </div>
            {newlyAdded > 0 && (
              <div className="flex items-center gap-1.5 bg-emerald-400/30 rounded-lg px-3 py-1.5">
                <span className="text-sm font-semibold text-emerald-100">+{newlyAdded} to add</span>
              </div>
            )}
            {removed > 0 && (
              <div className="flex items-center gap-1.5 bg-red-400/30 rounded-lg px-3 py-1.5">
                <span className="text-sm font-semibold text-red-100">−{removed} to remove</span>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
            />
          </div>
        </div>

        {/* Select all toggle */}
        {filtered.length > 0 && (
          <div className="px-5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={toggleAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        )}

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">
                {search ? "No students match your search" : "No students available"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {!search && "Create student accounts first via User Management"}
              </p>
            </div>
          ) : (
            filtered.map((student) => {
              const selected = isSelected(student.id);
              const isNew = selected && !originalIds.includes(student.id);
              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left group ${
                    selected
                      ? "border-blue-300 bg-blue-50 shadow-sm shadow-blue-100"
                      : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(student.id)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
                  >
                    {getInitials(student.fullName)}
                  </div>

                  {/* Name & badges */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${selected ? "text-blue-900" : "text-gray-800"}`}>
                      {student.fullName}
                    </p>
                    {isNew && (
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                        New
                      </span>
                    )}
                    {selected && !isNew && (
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                        Enrolled
                      </span>
                    )}
                  </div>

                  {/* Checkmark */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    selected
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 group-hover:border-blue-300"
                  }`}>
                    {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {selectedIds.length > 0
              ? `${selectedIds.length} student${selectedIds.length !== 1 ? "s" : ""} will be enrolled`
              : "No students selected"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#1A73E8] to-[#6C63FF] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Assignments"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
