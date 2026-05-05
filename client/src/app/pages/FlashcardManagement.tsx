import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface Vocabulary {
  id: string;
  word: string;
  ipa: string;
  definition: string;
  example?: string;
  topic?: string;
  imageUrl?: string;
  createdAt: string;
}

export function FlashcardManagement() {
  const { t } = useLanguage();
  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    word: "",
    ipa: "",
    definition: "",
    example: "",
    topic: "",
    imageUrl: "",
  });
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserRole(user.role || "");
    } catch {}
  }, []);

  const isManagement = ["ADMIN", "MANAGER", "TEACHER"].includes(userRole);

  const fetchVocabs = async () => {
    try {
      const url = selectedTopicFilter !== "All" 
        ? `/api/vocabularies?topic=${encodeURIComponent(selectedTopicFilter)}`
        : "/api/vocabularies";
        
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setVocabs(data);
      }
    } catch (error) {
      console.error("Failed to fetch vocabularies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/vocabularies/topics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    }
  };

  useEffect(() => {
    fetchVocabs();
    fetchTopics();
  }, [selectedTopicFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/vocabularies/${editingId}` : "/api/vocabularies";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(t("flashcard.created_success"));
        setIsAdding(false);
        setEditingId(null);
        setFormData({ word: "", ipa: "", definition: "", example: "", topic: "", imageUrl: "" });
        fetchVocabs();
        fetchTopics();
      } else {
        toast.error("Failed to save vocabulary");
      }
    } catch (error) {
      toast.error("Error saving vocabulary");
    }
  };

  const handleEdit = (vocab: Vocabulary) => {
    setEditingId(vocab.id);
    setFormData({
      word: vocab.word,
      ipa: vocab.ipa || "",
      definition: vocab.definition,
      example: vocab.example || "",
      topic: vocab.topic || "",
      imageUrl: vocab.imageUrl || "",
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("flashcard.delete_confirm"))) return;

    try {
      const res = await fetch(`/api/vocabularies/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        toast.success(t("flashcard.deleted_success"));
        fetchVocabs();
      }
    } catch (error) {
      toast.error("Error deleting word");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("flashcard.management_title")}</h1>
          <p className="text-gray-500 mt-1">{t("flashcard.management_subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all font-medium"
          >
            <option value="All">{t("flashcard.all_topics")}</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {isManagement && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
              {t("flashcard.add_btn")}
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? t("flashcard.edit_btn") : t("flashcard.add_btn")}
            </h2>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("flashcard.word")}</label>
                <input
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                  placeholder="e.g. Beautiful"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("flashcard.ipa")}</label>
                <input
                  type="text"
                  value={formData.ipa}
                  onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                  placeholder="e.g. /ˈbjuːtɪfl/"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t("flashcard.definition")}</label>
              <textarea
                required
                value={formData.definition}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none h-24 resize-none transition-all"
                placeholder="Definition in English or Vietnamese..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("flashcard.example")}</label>
                <input
                  type="text"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                  placeholder="e.g. What a beautiful day!"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t("flashcard.topic")}</label>
                <input
                  type="text"
                  list="topics-list"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                  placeholder={t("flashcard.topic_placeholder")}
                />
                <datalist id="topics-list">
                  {topics.map(t => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">{t("flashcard.image")}</label>
              <div className="flex gap-4 items-start">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingImage(true);
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    const form = new FormData();
                    form.append("file", file);
                    form.append("uploadedById", user.id);
                    form.append("category", "FLASHCARD");
                    
                    try {
                      const res = await fetch("/api/materials/upload", {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: form,
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setFormData({ ...formData, imageUrl: `/api/materials/view/${data.id}` });
                        toast.success("Image uploaded successfully");
                      } else {
                        toast.error("Failed to upload image");
                      }
                    } catch (err) {
                      toast.error("Error uploading image");
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                  className="hidden"
                  id="vocab-image-upload"
                  disabled={uploadingImage}
                />
                <label 
                  htmlFor="vocab-image-upload" 
                  className={`px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 cursor-pointer transition-all ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploadingImage ? t("flashcard.uploading") : t("flashcard.upload_image")}
                </label>
                
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none transition-all"
                    placeholder={t("flashcard.image_url_placeholder")}
                  />
                </div>
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img src={formData.imageUrl} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setIsAdding(false); setEditingId(null); }}
                className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-2 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-100"
              >
                <Save className="w-5 h-5" />
                {t("common.save")}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("flashcard.word")}</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("flashcard.ipa")}</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("flashcard.definition")}</th>
                <th className="px-6 py-4 font-bold text-gray-400 text-xs uppercase tracking-wider">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex justify-center"><div className="w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin" /></div>
                </td></tr>
              ) : vocabs.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">{t("common.no_data")}</td></tr>
              ) : (
                vocabs.map((vocab) => (
                  <tr key={vocab.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {vocab.imageUrl && (
                          <img src={vocab.imageUrl} alt={vocab.word} className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
                        )}
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#1A73E8] transition-colors">
                            {vocab.word}
                            {vocab.topic && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-[#1A73E8] text-[10px] rounded-full uppercase tracking-wider">{vocab.topic}</span>}
                          </div>
                          {vocab.example && <div className="text-xs text-gray-500 italic mt-0.5 truncate max-w-xs">{vocab.example}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{vocab.ipa || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                      <p className="truncate">{vocab.definition}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {isManagement && (
                          <button onClick={() => handleEdit(vocab)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {isManagement && (
                          <button onClick={() => handleDelete(vocab.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
