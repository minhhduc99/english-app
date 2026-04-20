import { useState, useEffect } from "react";
import { X, Search, FileText, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../../contexts/LanguageContext";

interface Material {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  size: number;
}

interface SelectMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (materialIds: string[]) => void;
  alreadyAssignedIds: string[];
}

export function SelectMaterialModal({
  isOpen,
  onClose,
  onSelect,
  alreadyAssignedIds,
}: SelectMaterialModalProps) {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
      setSelectedIds([]);
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      !alreadyAssignedIds.includes(m.id) &&
      (m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.fileType.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Learning Materials</h2>
            <p className="text-sm text-gray-500">Choose materials from your library to add to this course</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search library materials..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent focus:border-[#1A73E8] focus:bg-white rounded-2xl transition-all outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full" />
                <p className="text-sm text-gray-500 font-medium tracking-wide">Loading library...</p>
              </div>
            ) : filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  onClick={() => toggleSelect(material.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                    selectedIds.includes(material.id)
                      ? "bg-blue-50 border-blue-200 scale-[0.99]"
                      : "bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      selectedIds.includes(material.id) ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`font-bold transition-colors ${
                        selectedIds.includes(material.id) ? "text-blue-900" : "text-gray-900"
                      }`}>{material.name}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{material.fileType}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedIds.includes(material.id)
                      ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100"
                      : "border-gray-200"
                  }`}>
                    {selectedIds.includes(material.id) && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400 italic">No available materials found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm font-bold text-gray-500">
            {selectedIds.length} materials selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-gray-600 hover:bg-white rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSelect(selectedIds)}
              disabled={selectedIds.length === 0}
              className={`px-8 py-2.5 bg-[#1A73E8] text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 ${
                selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1557B0] hover:scale-105 active:scale-95"
              }`}
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
