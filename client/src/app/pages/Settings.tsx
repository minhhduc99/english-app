import { useState, useEffect } from "react";
import {
  Brain, Sparkles, Zap, Users, Shield, Palette, Image,
  Sun, Moon, Monitor, ChevronDown, ChevronRight, Copy, Check,
  Info, RefreshCw, Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, backgrounds } from "../contexts/ThemeContext";

const PROMPT_EXAMPLES = [
  {
    id: "strict_tutor",
    label: { en: "Strict Vocabulary Tutor", vi: "Gia sư Từ vựng Nghiêm túc" },
    tag: { en: "Recommended", vi: "Đề xuất" },
    tagColor: "bg-blue-100 text-blue-700",
    content: `You are an expert English Tutor AI. Your SOLE purpose is to help the user practice English using ONLY the vocabulary provided in the system context.

RULES:
1. DO NOT answer general knowledge questions.
2. DO NOT engage in conversations outside of English learning.
3. ONLY use and explain the vocabulary words provided in the context.
4. If the user asks something unrelated, gently steer them back to practicing their vocabulary.
5. If the user speaks Vietnamese, you may explain vocabulary in Vietnamese, but always encourage them to practice responding in English.
6. Keep corrections clear and polite. Use **bold** for corrected words.`,
  },
  {
    id: "conversational",
    label: { en: "Friendly Conversation Partner", vi: "Bạn trò chuyện thân thiện" },
    tag: { en: "Popular", vi: "Phổ biến" },
    tagColor: "bg-green-100 text-green-700",
    content: `You are a friendly English conversation partner named Alex. Your goal is to help students practice natural, everyday English conversation.

RULES:
1. Keep responses conversational and encouraging.
2. Gently correct grammar mistakes by restating the sentence correctly in **bold**.
3. Ask follow-up questions to keep the conversation flowing.
4. Adapt vocabulary complexity to the student's level.
5. Celebrate progress with positive reinforcement.
6. Support both English and Vietnamese speakers.`,
  },
  {
    id: "ielts_coach",
    label: { en: "IELTS Speaking Coach", vi: "Huấn luyện viên IELTS Speaking" },
    tag: { en: "Advanced", vi: "Nâng cao" },
    tagColor: "bg-purple-100 text-purple-700",
    content: `You are a professional IELTS Speaking examiner and coach. Your goal is to prepare students for the IELTS Speaking test (Bands 5.0–8.0).

RULES:
1. Ask IELTS-style questions (Part 1: personal topics, Part 2: cue cards, Part 3: abstract discussion).
2. Evaluate fluency, coherence, lexical resource, and grammatical range.
3. After each response, provide a brief score estimate and specific feedback.
4. Highlight strong vocabulary choices with ✓ and suggest improvements in **bold**.
5. Encourage the use of linking words and discourse markers.
6. Keep feedback concise and actionable.`,
  },
  {
    id: "grammar_focus",
    label: { en: "Grammar Correction Mode", vi: "Chế độ Sửa Ngữ pháp" },
    tag: { en: "Focused", vi: "Chuyên sâu" },
    tagColor: "bg-orange-100 text-orange-700",
    content: `You are a precise English grammar coach. Your primary role is to identify and correct grammatical errors in the student's writing and speaking.

RULES:
1. When a student writes something, first acknowledge their message, then provide a corrected version.
2. Explain WHY a correction was made (briefly, one sentence).
3. Use **bold** for all corrections.
4. Focus on: verb tenses, subject-verb agreement, articles (a/an/the), prepositions, and word order.
5. Do not overwhelm with too many corrections at once — prioritize the most important errors.
6. End every response with a short practice sentence for the student to try.`,
  },
];

export function Settings() {
  const { t, language } = useLanguage();
  const { background, setBackground, theme, setTheme } = useTheme();

  const user = (() => {
    try {
      const cached = localStorage.getItem("user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

  // ── System Prompt state ──
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);
  const [expandedExample, setExpandedExample] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/settings/AI_SYSTEM_PROMPT", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data.value) setSystemPrompt(data.value); })
      .catch(() => toast.error(t("settings.ai_prompt_load_error")));
  }, [isAdmin]);

  const handleSaveSystemPrompt = async () => {
    try {
      setIsSavingPrompt(true);
      const res = await fetch("/api/settings/AI_SYSTEM_PROMPT", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ value: systemPrompt }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("settings.ai_prompt_saved"));
    } catch {
      toast.error(t("settings.ai_prompt_save_error"));
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleSyncAI = async () => {
    try {
      setIsSyncingAI(true);
      const res = await fetch("/api/vocabularies/sync-ai", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) toast.success(t("flashcard.sync_success"));
      else toast.error(t("flashcard.sync_error"));
    } catch {
      toast.error(t("flashcard.sync_error"));
    } finally {
      setIsSyncingAI(false);
    }
  };

  const applyExample = (content: string) => {
    setSystemPrompt(content);
    toast.success(t("settings.example_apply"));
  };

  const copyExample = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const aiFeatures = [
    { icon: Brain, title: "Smart Recommendations", description: "AI-powered course and content recommendations for students", enabled: true },
    { icon: Sparkles, title: "Auto-Grading", description: "Automatic grading for assignments and quizzes", enabled: true },
    { icon: Zap, title: "Performance Analytics", description: "AI-driven insights into student performance patterns", enabled: false },
  ];

  const roles = [
    { id: 1, name: "Administrator", users: 3, permissions: ["Full Access", "User Management", "System Settings"], color: "bg-red-50 text-red-700 border-red-200" },
    { id: 2, name: "Teacher", users: 24, permissions: ["Course Management", "Student Grading", "Attendance"], color: "bg-blue-50 text-blue-700 border-blue-200" },
    { id: 3, name: "Student", users: 1234, permissions: ["View Courses", "Submit Assignments", "View Grades"], color: "bg-green-50 text-green-700 border-green-200" },
    { id: 4, name: "Parent", users: 856, permissions: ["View Student Progress", "View Attendance", "View Reports"], color: "bg-purple-50 text-purple-700 border-purple-200" },
  ];

  const themes = [
    { id: "light", name: t("settings.theme_light"), icon: Sun, preview: "bg-white" },
    { id: "dark", name: t("settings.theme_dark"), icon: Moon, preview: "bg-gray-900" },
    { id: "auto", name: t("settings.theme_auto"), icon: Monitor, preview: "bg-gradient-to-r from-white to-gray-900" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("menu.settings")}</h1>
        <p className="text-gray-500 mt-1">{t("settings.page_subtitle")}</p>
      </div>

      {/* ── Admin-only sections ── */}
      {isAdmin && (
        <>
          {/* Roles & Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("settings.roles_title")}</h3>
                  <p className="text-sm text-gray-500">{t("settings.roles_subtitle")}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors text-sm font-medium">
                {t("settings.add_role")}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <div key={role.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${role.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <h4 className="font-semibold">{role.name}</h4>
                    </div>
                    <span className="text-sm font-medium">{role.users} {t("settings.users_suffix")}</span>
                  </div>
                  <div className="space-y-1">
                    {role.permissions.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-current/20 flex gap-2">
                    <button className="flex-1 px-3 py-1.5 bg-white/50 rounded hover:bg-white/80 transition-colors text-sm font-medium">{t("settings.edit")}</button>
                    <button className="flex-1 px-3 py-1.5 bg-white/50 rounded hover:bg-white/80 transition-colors text-sm font-medium">{t("settings.manage")}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI System Prompt ── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#E8F0FE] to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1A73E8] rounded-lg flex items-center justify-center shadow">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t("settings.ai_prompt_title")}</h3>
                  <p className="text-sm text-gray-500">{t("settings.ai_prompt_subtitle")}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Tip banner */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{t("settings.prompt_tip")}</span>
              </div>

              {/* Example prompts panel */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-[#1A73E8]" />
                  <span className="text-sm font-semibold text-gray-700">{t("settings.examples_title")}</span>
                  <span className="text-xs text-gray-400">— {t("settings.examples_subtitle")}</span>
                </div>
                <div className="space-y-2">
                  {PROMPT_EXAMPLES.map((ex) => {
                    const isOpen = expandedExample === ex.id;
                    return (
                      <div key={ex.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Example header */}
                        <button
                          onClick={() => setExpandedExample(isOpen ? null : ex.id)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800 text-sm">
                              {ex.label[language as "en" | "vi"]}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${ex.tagColor}`}>
                              {ex.tag[language as "en" | "vi"]}
                            </span>
                          </div>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>

                        {/* Example body */}
                        {isOpen && (
                          <div className="border-t border-gray-100 bg-gray-50">
                            <pre className="px-4 py-3 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                              {ex.content}
                            </pre>
                            <div className="flex gap-2 px-4 pb-3">
                              <button
                                onClick={() => applyExample(ex.content)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A73E8] text-white text-xs font-semibold rounded-lg hover:bg-[#1557B0] transition-colors"
                              >
                                <RefreshCw className="w-3 h-3" />
                                {t("settings.example_apply")}
                              </button>
                              <button
                                onClick={() => copyExample(ex.id, ex.content)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                {copiedId === ex.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                                {copiedId === ex.id ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompt editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    {t("settings.ai_prompt_title")}
                  </label>
                  <span className="text-xs text-gray-400">
                    {systemPrompt.length} {t("settings.ai_prompt_chars")}
                  </span>
                </div>
                <textarea
                  id="ai-system-prompt-editor"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={10}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent resize-y font-mono text-sm text-gray-800 leading-relaxed"
                  placeholder={t("settings.ai_prompt_placeholder")}
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="save-system-prompt-btn"
                  onClick={handleSaveSystemPrompt}
                  disabled={isSavingPrompt || systemPrompt.trim() === ""}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors disabled:opacity-50 font-semibold text-sm"
                >
                  {isSavingPrompt ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" />{t("settings.ai_prompt_saving")}</>
                  ) : (
                    t("settings.ai_prompt_save")
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* AI Knowledge Sync */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t("settings.ai_sync_title")}</h3>
                <p className="text-sm text-gray-500">{t("settings.ai_sync_subtitle")}</p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{t("settings.ai_sync_vocab")}</p>
                <p className="text-sm text-gray-500">{t("settings.ai_sync_vocab_desc")}</p>
              </div>
              <button
                id="sync-ai-vocab-btn"
                onClick={handleSyncAI}
                disabled={isSyncingAI}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isSyncingAI ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                <Brain className={`w-4 h-4 ${isSyncingAI ? "animate-pulse" : ""}`} />
                {isSyncingAI ? t("settings.ai_syncing_btn") : t("settings.ai_sync_btn")}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Theme Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("settings.theme_title")}</h3>
            <p className="text-sm text-gray-500">{t("settings.theme_subtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((thm) => (
            <button
              key={thm.id}
              onClick={() => { setTheme(thm.id as any); toast.success(`${thm.name} theme selected`); }}
              className={`relative p-4 border-2 rounded-xl transition-all ${
                theme === thm.id ? "border-[#1A73E8] bg-[#E8F0FE]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-full h-24 ${thm.preview} rounded-lg border border-gray-200`} />
                <div className="flex items-center gap-2">
                  <thm.icon className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">{thm.name}</span>
                </div>
              </div>
              {theme === thm.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#1A73E8] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Background Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("settings.bg_title")}</h3>
            <p className="text-sm text-gray-500">{t("settings.bg_subtitle")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => { setBackground(bg.id as any); toast.success(`${bg.name} background selected`); }}
              className={`relative p-3 border-2 rounded-xl transition-all ${
                background === bg.id ? "border-[#1A73E8]" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full h-20 ${bg.preview} rounded-lg border border-gray-300`} />
                <span className="text-sm font-medium text-gray-900 text-center">{bg.name}</span>
              </div>
              {background === bg.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1A73E8] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI Features — non-student */}
      {!isStudent && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#1A73E8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t("settings.ai_features_title")}</h3>
              <p className="text-sm text-gray-500">{t("settings.ai_features_subtitle")}</p>
            </div>
          </div>
          <div className="space-y-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={feature.enabled}
                        onChange={(e) => toast.success(`${feature.title} ${e.target.checked ? "enabled" : "disabled"}`)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1A73E8] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A73E8]" />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
          {t("settings.reset_default")}
        </button>
        <button
          onClick={() => toast.success(t("settings.saved"))}
          className="px-6 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors text-sm font-medium"
        >
          {t("settings.save_changes")}
        </button>
      </div>
    </div>
  );
}
