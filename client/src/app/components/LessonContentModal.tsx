import { useState, useEffect } from "react";
import { 
  X, 
  Book, 
  FileText, 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  ExternalLink,
  ChevronRight,
  GraduationCap,
  PlaySquare
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";
import { SelectMaterialModal } from "./manager/SelectMaterialModal";
import { InteractiveVideoPlayer, VideoQuestion } from "./InteractiveVideoPlayer";

const MOCK_VIDEO_QUESTIONS: VideoQuestion[] = [
  {
    id: "q1",
    timestamp: 5,
    type: "MULTIPLE_CHOICE",
    question: "What is the name of the big bunny?",
    options: ["Big Buck Bunny", "Bugs Bunny", "Roger Rabbit", "Peter Rabbit"],
    correctAnswer: "Big Buck Bunny"
  },
  {
    id: "q2",
    timestamp: 12,
    type: "FILL_BLANK",
    question: "Fill in the blank: The bunny is eating an ______",
    correctAnswer: "apple"
  }
];

interface Vocabulary {
  id: string;
  word: string;
  ipa: string;
  definition: string;
  example?: string;
}

interface Material {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  size: number;
}

interface LessonContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  onContentUpdate?: () => void;
}

export function LessonContentModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  courseId,
  onContentUpdate
}: LessonContentModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"vocab" | "materials" | "videos">("vocab");
  const [loading, setLoading] = useState(true);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [userRole, setUserRole] = useState("");
  
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(user.role || "");
    } catch (e) {
      setUserRole("");
    }
  }, []);

  const isManagement = ["ADMIN", "MANAGER", "TEACHER"].includes(userRole);
  
  // Vocabulary Form State
  const [isAddingVocab, setIsAddingVocab] = useState(false);
  const [vocabForm, setVocabForm] = useState({
    word: "",
    ipa: "",
    definition: "",
    example: ""
  });

  // Materials Selection State
  const [isSelectMaterialOpen, setIsSelectMaterialOpen] = useState(false);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/content`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setVocabularies(data.vocabularies || []);
        setMaterials(data.materials || []);
      }
    } catch (error) {
      toast.error("Failed to load lesson content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lessonId) {
      fetchContent();
    }
  }, [isOpen, lessonId]);

  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vocabularies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...vocabForm, lessonId }),
      });

      if (res.ok) {
        toast.success("Vocabulary added");
        setIsAddingVocab(false);
        setVocabForm({ word: "", ipa: "", definition: "", example: "" });
        fetchContent();
        onContentUpdate?.();
      }
    } catch (error) {
      toast.error("Error adding vocabulary");
    }
  };

  const handleDeleteVocab = async (id: string) => {
    if (!window.confirm("Remove this vocabulary?")) return;
    try {
      const res = await fetch(`/api/vocabularies/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Word removed");
        fetchContent();
        onContentUpdate?.();
      }
    } catch (error) {
      toast.error("Error removing word");
    }
  };

  const handleLinkMaterials = async (selectedIds: string[]) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ materialIds: selectedIds }),
      });

      if (res.ok) {
        toast.success("Materials linked to lesson");
        setIsSelectMaterialOpen(false);
        fetchContent();
        onContentUpdate?.();
      }
    } catch (error) {
      toast.error("Error linking materials");
    }
  };

  const handleUnlinkMaterial = async (matId: string) => {
    // We update material's lessonId to null
    try {
      const res = await fetch(`/api/lessons/${lessonId}/materials`, {
        method: "POST", // Reusing same endpoint but logic in backend should handle unlinking if we send different data or create a DELETE endpoint
        // For simplicity now, let's assume we link to null or use a dedicated DELETE
        // I'll use a PUT on materials for unlinking if needed, or just a new endpoint
      });
      // Implementation note: I should add a specific UNLINK endpoint if needed.
      // For now, let's just implement the UI and I'll add the backend part if missing.
    } catch (error) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1A73E8] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Lesson Content</p>
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{lessonTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 pt-6 gap-8 border-b border-gray-50">
          <button
            onClick={() => setActiveTab("vocab")}
            className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
              activeTab === "vocab" ? "text-[#1A73E8]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Vocabularies ({vocabularies.length})
            </div>
            {activeTab === "vocab" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A73E8] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("materials")}
            className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
              activeTab === "materials" ? "text-[#1A73E8]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Materials ({materials.length})
            </div>
            {activeTab === "materials" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A73E8] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
              activeTab === "videos" ? "text-[#1A73E8]" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <PlaySquare className="w-4 h-4" />
              {t("video.tab")}
            </div>
            {activeTab === "videos" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A73E8] rounded-t-full" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 animate-pulse">Loading content...</p>
            </div>
          ) : activeTab === "vocab" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  Vocabulary List
                </h3>
                {isManagement && !isAddingVocab && (
                  <button
                    onClick={() => setIsAddingVocab(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> Add Word
                  </button>
                )}
              </div>

              {isAddingVocab && (
                <form onSubmit={handleAddVocab} className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 space-y-4 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Word (e.g. Vocabulary)"
                      className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
                      value={vocabForm.word}
                      onChange={e => setVocabForm({...vocabForm, word: e.target.value})}
                    />
                    <input
                      placeholder="IPA (e.g. /vəˈkæbjələri/)"
                      className="px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-mono"
                      value={vocabForm.ipa}
                      onChange={e => setVocabForm({...vocabForm, ipa: e.target.value})}
                    />
                  </div>
                  <textarea
                    required
                    placeholder="Definition..."
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm min-h-[80px] resize-none"
                    value={vocabForm.definition}
                    onChange={e => setVocabForm({...vocabForm, definition: e.target.value})}
                  />
                  <input
                    placeholder="Example sentence..."
                    className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
                    value={vocabForm.example}
                    onChange={e => setVocabForm({...vocabForm, example: e.target.value})}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddingVocab(false)} className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100">Save Word</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vocabularies.map((v) => (
                  <div key={v.id} className="group p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-black text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{v.word}</h4>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{v.ipa || "/.../"}</p>
                      </div>
                      {isManagement && (
                        <button onClick={() => handleDeleteVocab(v.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{v.definition}</p>
                    {v.example && (
                      <div className="mt-3 pt-3 border-t border-gray-50 text-[11px] text-gray-400 italic">
                        "{v.example}"
                      </div>
                    )}
                  </div>
                ))}
                {vocabularies.length === 0 && !isAddingVocab && (
                  <div className="col-span-2 py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <Book className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No vocabularies added to this lesson</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "materials" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  Lesson Materials
                </h3>
                {isManagement && (
                  <button
                    onClick={() => setIsSelectMaterialOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all text-sm font-bold"
                  >
                    <LinkIcon className="w-4 h-4" /> Link Materials
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {materials.map((m) => (
                  <div key={m.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-green-200 hover:bg-green-50/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                        <FileText className={`w-6 h-6 ${m.fileType.includes('pdf') ? 'text-red-400' : 'text-blue-400'}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{m.fileType}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[10px] font-bold text-gray-400">{(m.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      {isManagement && (
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {materials.length === 0 && (
                  <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                    <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No materials linked to this lesson</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                  Interactive Video
                </h3>
                {isManagement && (
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all text-sm font-bold"
                  >
                    <Plus className="w-4 h-4" /> Add Video
                  </button>
                )}
              </div>

              <div className="bg-white p-6 border border-gray-100 rounded-[2rem] shadow-sm">
                <InteractiveVideoPlayer 
                  src="https://www.w3schools.com/html/mov_bbb.mp4"
                  poster="https://www.w3schools.com/html/pic_trulli.jpg"
                  questions={MOCK_VIDEO_QUESTIONS}
                />
                
                <div className="mt-8">
                  <h4 className="font-bold text-gray-900 mb-4">Interactive Questions</h4>
                  <div className="space-y-3">
                    {MOCK_VIDEO_QUESTIONS.map((q, idx) => (
                      <div key={q.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-800">{q.question}</p>
                            <p className="text-xs text-gray-500 mt-1">Appears at: {q.timestamp}s • Type: {q.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isManagement && <button className="text-gray-400 hover:text-blue-500 transition-colors">Edit</button>}
                          {isManagement && <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>

      <SelectMaterialModal 
        isOpen={isSelectMaterialOpen} 
        onClose={() => setIsSelectMaterialOpen(false)} 
        onSelect={handleLinkMaterials}
        alreadyAssignedIds={materials.map(m => m.id)}
      />
    </div>
  );
}
