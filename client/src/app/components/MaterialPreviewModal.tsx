import { X, Download, Maximize2, Minimize2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface MaterialPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: {
    id: string;
    name: string;
    fileType: string;
  } | null;
  onDownload: (id: string, name: string) => void;
}

export function MaterialPreviewModal({ isOpen, onClose, material, onDownload }: MaterialPreviewModalProps) {
  const { t } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;

    const fetchPreview = async () => {
      if (!material || !isOpen) return;
      
      setLoading(true);
      try {
        const res = await fetch(`/api/materials/view/${material.id}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          currentUrl = url;
        } else {
          console.error("Failed to fetch preview content");
        }
      } catch (error) {
        console.error("Error fetching preview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      setBlobUrl(null);
    };
  }, [material, isOpen]);

  if (!isOpen || !material) return null;

  const isImage = ["JPG", "JPEG", "PNG", "GIF"].includes(material.fileType.toUpperCase());
  const isPDF = material.fileType.toUpperCase() === "PDF";
  const canPreview = isPDF || isImage;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[85vh]'}`}>
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-[#1A73E8]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-[#1A73E8]">{material.fileType}</span>
            </div>
            <div className="truncate">
              <h3 className="font-bold text-gray-900 truncate">{material.name}</h3>
              <p className="text-xs text-gray-500">{t("materials.preview_mode")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onDownload(material.id, material.name)}
              className="p-2.5 text-gray-400 hover:text-[#1A73E8] hover:bg-blue-50 rounded-xl transition-all"
              title={t("Download")}
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <div className="w-px h-6 bg-gray-100 mx-1" />
            <button 
              onClick={onClose}
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100/50 overflow-hidden relative group">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white">
              <Loader2 className="w-12 h-12 text-[#1A73E8] animate-spin" />
              <p className="text-gray-400 font-bold animate-pulse">{t("common.loading")}</p>
            </div>
          ) : blobUrl && canPreview ? (
            isPDF ? (
              <iframe 
                src={`${blobUrl}#toolbar=0&navpanes=0`} 
                className="w-full h-full border-none"
                title={material.name}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                <img 
                  src={blobUrl} 
                  alt={material.name} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 text-center bg-white">
              <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-gray-100">
                <span className="text-2xl font-black text-gray-300">{material.fileType}</span>
              </div>
              <div className="max-w-md">
                <h4 className="text-xl font-bold text-gray-900 mb-2">{t("materials.preview_unavailable")}</h4>
                <p className="text-gray-500 mb-6">{t("materials.preview_unavailable_desc")}</p>
                <button 
                  onClick={() => onDownload(material.id, material.name)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-100"
                >
                  <Download className="w-5 h-5" />
                  {t("Download")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

