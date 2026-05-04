import { useState, useEffect } from "react";
import {
  FileText,
  Image as ImageIcon,
  CreditCard,
  Gamepad2,
  Upload,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { MaterialPreviewModal } from "../components/MaterialPreviewModal";

interface Material {
  id: string;
  name: string;
  originalName: string;
  fileName: string;
  fileType: string;
  category: string;
  size: number;
  uploadedById: string;
  uploadedBy: {
    fullName: string;
  };
  createdAt: string;
  status: string;
}

export function LearningMaterials() {
  const { t } = useLanguage();
  const [dragActive, setDragActive] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadCategory, setUploadCategory] = useState("GENERAL");
  const [vocabCount, setVocabCount] = useState(0);

  // Preview State
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

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

  const fetchVocabCount = async () => {
    try {
      const res = await fetch("/api/vocabularies", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVocabCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch vocabularies:", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    fetchMaterials();
    fetchVocabCount();
  }, []);

  const stats = [
    { label: t("materials.total_materials"), value: materials.length.toString(), icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: t("materials.pdf_images"), value: materials.filter(m => m.category === 'GENERAL' || !m.category).length.toString(), icon: ImageIcon, color: "bg-green-50 text-green-600" },
    { label: t("materials.flashcards"), value: vocabCount.toString(), icon: CreditCard, color: "bg-purple-50 text-purple-600" },
    { label: t("materials.games"), value: (materials.filter(m => m.category === 'GAME').length + 3).toString(), icon: Gamepad2, color: "bg-orange-50 text-orange-600" },
  ];

  const handleSaveUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!currentUser?.id) {
      toast.error("User session not found");
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", selectedFiles[i]);
      formData.append("uploadedById", currentUser.id);
      formData.append("category", uploadCategory);

      try {
        const res = await fetch("/api/materials/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json();
          toast.error(data.message || `Failed to upload ${selectedFiles[i].name}`);
        }
      } catch (error) {
        toast.error(`Error uploading ${selectedFiles[i].name}`);
      }
    }

    if (successCount > 0) {
      toast.success(t("materials.upload_success"));
      fetchMaterials();
      setSelectedFiles([]); // Clear after success
    }
    setUploading(false);
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      toast.info("Preparing download...");
      const res = await fetch(`/api/materials/download/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Download started");
      } else {
        toast.error("Failed to download file");
      }
    } catch (error) {
      toast.error("Error downloading file");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("materials.delete_confirm"))) return;

    try {
      const res = await fetch(`/api/materials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        toast.success(t("materials.delete_success"));
        fetchMaterials();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete material");
      }
    } catch (error) {
      toast.error("Error deleting material");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "PDF": return "bg-red-50 text-red-700 border-red-200";
      case "XLSX": return "bg-green-50 text-green-700 border-green-200";
      case "PPTX": return "bg-orange-50 text-orange-700 border-orange-200";
      case "PNG":
      case "JPG":
      case "JPEG": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const isManagement = ["ADMIN", "MANAGER", "TEACHER"].includes(currentUser?.role || "");

  const isOwnerOrAdmin = (material: Material) => {
    if (!currentUser) return false;
    return currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER' || material.uploadedById === currentUser.id;
  };

  return (
    <div className="p-6 space-y-6 font-outfit animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("materials.page_title")}</h1>
        <p className="text-gray-500 mt-1">{t("materials.page_subtitle")}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Card */}
      {isManagement && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{t("materials.upload_title")}</h2>
            {selectedFiles.length > 0 && !uploading && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t("materials.category")}:</span>
                <select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]"
                >
                  <option value="GENERAL">{t("materials.general")}</option>
                  <option value="FLASHCARD">{t("materials.flashcard")}</option>
                  <option value="GAME">{t("materials.game")}</option>
                </select>
              </div>
            )}
          </div>
          
          {selectedFiles.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#1A73E8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button 
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                <button 
                  onClick={handleCancelUpload}
                  disabled={uploading}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  onClick={handleSaveUpload}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-8 py-2.5 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  {uploading ? t("auth.processing") : t("common.save")}
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-[#1A73E8] bg-[#E8F0FE] scale-[1.01]"
                  : "border-gray-200 hover:border-[#1A73E8]/50 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                  <Upload className={`w-8 h-8 text-[#1A73E8] ${uploading ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 mb-1">{t("materials.drop_hint")}</p>
                  <p className="text-sm text-gray-500">{t("materials.supported_formats")}</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" multiple accept=".pdf,.xlsx,.pptx,.png,.jpg,.jpeg" onChange={handleFileInput} className="hidden" disabled={uploading} />
                  <span className={`inline-flex items-center gap-2 px-8 py-3.5 bg-[#1A73E8] text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-100 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1557B0] hover:scale-105 active:scale-95'}`}>
                    <Upload className="w-5 h-5" />
                    {uploading ? t("auth.processing") : t("materials.upload_title")}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Library Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("materials.library_title")}</h2>
            <p className="text-sm text-gray-500 mt-1">{t("materials.library_subtitle")}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t("materials.col_name")}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t("materials.col_type")}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t("materials.col_created_by")}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t("materials.col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {materials.map((material) => (
                <tr key={material.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        {["PNG", "JPG", "JPEG"].includes(material.fileType) ? <ImageIcon className="w-5 h-5 text-[#1A73E8]" /> : <FileText className="w-5 h-5 text-[#1A73E8]" />}
                      </div>
                      <span className="font-bold text-gray-900 group-hover:text-[#1A73E8] transition-colors">{material.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getTypeStyle(material.fileType)}`}>{material.fileType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{material.uploadedBy?.fullName || 'System'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setPreviewMaterial(material)} 
                        className="p-2 text-gray-400 hover:text-[#1A73E8] hover:bg-blue-50 rounded-lg transition-all" 
                        title={t("Preview")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDownload(material.id, material.originalName)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title={t("Download")}>
                        <Download className="w-4 h-4" />
                      </button>
                      {isOwnerOrAdmin(material) && (
                        <button onClick={() => handleDelete(material.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title={t("Delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {materials.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">{t("materials.no_materials")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <MaterialPreviewModal 
        isOpen={!!previewMaterial} 
        onClose={() => setPreviewMaterial(null)} 
        material={previewMaterial}
        onDownload={handleDownload}
      />
    </div>
  );
}

