import { useState, useEffect, useMemo } from "react";
import { X, Search, GraduationCap, CheckCircle2, UserCheck, Loader2, Save } from "lucide-react";

interface Teacher {
  id: string;
  fullName: string;
  email?: string;
}

interface AssignTeachersModalProps {
  courseId: string | null;
  courseName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssignTeachersModal({ courseId, courseName, isOpen, onClose, onSuccess }: AssignTeachersModalProps) {
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
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
      fetch("/api/courses/teachers/available", { headers: authHeader }).then(r => r.json()),
      fetch(`/api/courses/${courseId}/teachers`, { headers: authHeader }).then(r => r.json()),
    ])
      .then(([all, members]) => {
        setAvailableTeachers(all || []);
        const ids = (members || []).map((t: any) => t.id);
        setSelectedIds(ids);
        setOriginalIds(ids);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, courseId]);

  const filtered = useMemo(
    () =>
      availableTeachers.filter((t) =>
        t.fullName.toLowerCase().includes(search.toLowerCase())
      ),
    [availableTeachers, search]
  );

  if (!isOpen || !courseId) return null;

  const isSelected = (id: string) => selectedIds.includes(id);

  const toggleTeacher = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const allFilteredIds = filtered.map((t) => t.id);
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
      await fetch(`/api/courses/${courseId}/teachers`, {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ teacherIds: selectedIds }),
      });
      setOriginalIds(selectedIds);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      alert("Error assigning teachers. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").slice(-2).map((n) => n[0]).join("").toUpperCase();

  const avatarColors = [
    "from-indigo-500 to-blue-600",
    "from-purple-500 to-indigo-600",
    "from-teal-500 to-emerald-600",
    "from-pink-500 to-rose-600",
    "from-orange-500 to-amber-600",
    "from-sky-500 to-cyan-600",
  ];

  const getColor = (id: string) =>
    avatarColors[id.charCodeAt(0) % avatarColors.length];

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.includes(t.id));

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
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Assign Teachers</h2>
                {courseName && (
                  <p className="text-indigo-100 text-sm mt-0.5 truncate max-w-[280px]">{courseName}</p>
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
              <UserCheck className="w-4 h-4 text-indigo-100" />
              <span className="text-sm font-semibold">{selectedIds.length} assigned</span>
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
              placeholder="Search teachers..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              autoFocus
            />
          </div>
        </div>

        {/* Select all toggle */}
        {filtered.length > 0 && (
          <div className="px-5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {filtered.length} teacher{filtered.length !== 1 ? "s" : ""}
            </span>
            <button
               onClick={toggleAll}
               className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {allFilteredSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        )}

        {/* Teacher list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading teachers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <GraduationCap className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-600">
                {search ? "No teachers match your search" : "No teachers available"}
              </p>
            </div>
          ) : (
            filtered.map((teacher) => {
               const selected = isSelected(teacher.id);
               const isNew = selected && !originalIds.includes(teacher.id);
               return (
                 <button
                   key={teacher.id}
                   onClick={() => toggleTeacher(teacher.id)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left group ${
                     selected
                       ? "border-indigo-300 bg-indigo-50 shadow-sm shadow-indigo-100"
                       : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                   }`}
                 >
                   {/* Avatar */}
                   <div
                     className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(teacher.id)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
                   >
                     {getInitials(teacher.fullName)}
                   </div>

                   {/* Name & badges */}
                   <div className="flex-1 min-w-0">
                     <p className={`text-sm font-semibold truncate ${selected ? "text-indigo-900" : "text-gray-800"}`}>
                       {teacher.fullName}
                     </p>
                     {isNew && (
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                         New
                       </span>
                     )}
                     {selected && !isNew && (
                       <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
                         Assigned
                       </span>
                     )}
                   </div>

                   {/* Checkmark */}
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                     selected
                       ? "bg-indigo-600 border-indigo-600"
                       : "bg-white border-gray-300 group-hover:border-indigo-300"
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
              ? `${selectedIds.length} teacher${selectedIds.length !== 1 ? "s" : ""} will be assigned`
              : "No teachers selected"}
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
               className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-100 disabled:opacity-60 disabled:cursor-not-allowed"
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
