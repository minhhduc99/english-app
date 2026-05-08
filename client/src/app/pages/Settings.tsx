import { useState, useEffect } from "react";
import { Brain, Sparkles, Zap, Users, Shield, Palette, Image, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, backgrounds } from "../contexts/ThemeContext";

export function Settings() {
  const { t } = useLanguage();
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

  const aiFeatures = [
    {
      icon: Brain,
      title: "Smart Recommendations",
      description: "AI-powered course and content recommendations for students",
      enabled: true,
    },
    {
      icon: Sparkles,
      title: "Auto-Grading",
      description: "Automatic grading for assignments and quizzes",
      enabled: true,
    },
    {
      icon: Zap,
      title: "Performance Analytics",
      description: "AI-driven insights into student performance patterns",
      enabled: false,
    },
  ];

  const roles = [
    {
      id: 1,
      name: "Administrator",
      users: 3,
      permissions: ["Full Access", "User Management", "System Settings"],
      color: "bg-red-50 text-red-700 border-red-200",
    },
    {
      id: 2,
      name: "Teacher",
      users: 24,
      permissions: ["Course Management", "Student Grading", "Attendance"],
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: 3,
      name: "Student",
      users: 1234,
      permissions: ["View Courses", "Submit Assignments", "View Grades"],
      color: "bg-green-50 text-green-700 border-green-200",
    },
    {
      id: 4,
      name: "Parent",
      users: 856,
      permissions: ["View Student Progress", "View Attendance", "View Reports"],
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const themes = [
    { id: "light", name: "Light", icon: Sun, preview: "bg-white" },
    { id: "dark", name: "Dark", icon: Moon, preview: "bg-gray-900" },
    { id: "auto", name: "Auto", icon: Monitor, preview: "bg-gradient-to-r from-white to-gray-900" },
  ];

  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isSyncingAI, setIsSyncingAI] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const fetchSystemPrompt = async () => {
        try {
          const response = await fetch("/api/settings/AI_SYSTEM_PROMPT", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.value) {
              setSystemPrompt(data.value);
            }
          }
        } catch (error) {
          console.error("Failed to fetch AI System Prompt:", error);
        }
      };
      fetchSystemPrompt();
    }
  }, [isAdmin]);

  const handleSaveSystemPrompt = async () => {
    try {
      setIsSavingPrompt(true);
      const response = await fetch("/api/settings/AI_SYSTEM_PROMPT", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ value: systemPrompt }),
      });

      if (response.ok) {
        toast.success(t("AI System Prompt saved successfully"));
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast.error(t("Failed to save AI System Prompt"));
      console.error(error);
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleSyncAI = async () => {
    try {
      setIsSyncingAI(true);
      const res = await fetch("/api/vocabularies/sync-ai", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        toast.success(t("flashcard.sync_success") || "Synced successfully");
      } else {
        toast.error(t("flashcard.sync_error") || "Failed to sync");
      }
    } catch (error) {
      toast.error(t("flashcard.sync_error") || "Error syncing");
    } finally {
      setIsSyncingAI(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success(t("Settings saved successfully"));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("menu.settings")}</h1>
        <p className="text-gray-500 mt-1">{t("Manage system settings and preferences")}</p>
      </div>

      {/* Roles & Permissions Section */}
      {isAdmin && (
        <>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1A73E8]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
              <p className="text-sm text-gray-500">Manage user roles and access control</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors">
            Add Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${role.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h4 className="font-semibold">{role.name}</h4>
                </div>
                <span className="text-sm font-medium">{role.users} users</span>
              </div>
              <div className="space-y-1">
                {role.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                    <span>{permission}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-current/20 flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-white/50 rounded hover:bg-white/80 transition-colors text-sm font-medium">
                  Edit
                </button>
                <button className="flex-1 px-3 py-1.5 bg-white/50 rounded hover:bg-white/80 transition-colors text-sm font-medium">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("System AI Prompt (Tutor)")}</h3>
            <p className="text-sm text-gray-500">{t("Configure the root behavior instructions for the AI Tutor microservice")}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent resize-none"
            placeholder={t("Enter system prompt for AI Tutor...")}
          ></textarea>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSystemPrompt("You are an expert English Tutor API. Your SOLE purpose is to help the user practice English using ONLY the vocabulary provided in the system context.\n\nRULES:\n1. DO NOT answer general knowledge questions.\n2. DO NOT engage in conversations outside of English learning.\n3. ONLY use and explain the vocabulary words provided in the context.\n4. If the user asks something unrelated, gently steer them back to practicing their vocabulary.\n5. If the user speaks Vietnamese, you may explain the vocabulary in Vietnamese, but encourage them to practice in English.")}
              className="px-4 py-2 text-[#1A73E8] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              {t("Load Sample")}
            </button>
            <button
              onClick={handleSaveSystemPrompt}
              disabled={isSavingPrompt}
              className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors disabled:opacity-50"
            >
              {isSavingPrompt ? t("Saving...") : t("Save System Prompt")}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t("AI Knowledge Synchronization")}</h3>
            <p className="text-sm text-gray-500">{t("Manually sync system learning materials with the AI Tutor")}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{t("Vocabulary Database")}</p>
            <p className="text-sm text-gray-500">{t("Push latest vocabulary definitions and examples to AI context")}</p>
          </div>
          <button
            onClick={handleSyncAI}
            disabled={isSyncingAI}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isSyncingAI 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <Brain className={`w-4 h-4 ${isSyncingAI ? 'animate-pulse' : ''}`} />
            {isSyncingAI ? t("Syncing...") : t("Sync Now")}
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
            <h3 className="text-lg font-semibold text-gray-900">{t("Theme Settings")}</h3>
            <p className="text-sm text-gray-500">{t("Customize the appearance of your dashboard")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((thm) => (
            <button
              key={thm.id}
              onClick={() => {
                setTheme(thm.id as any);
                toast.success(`${thm.name} theme selected`);
              }}
              className={`relative p-4 border-2 rounded-xl transition-all ${
                theme === thm.id
                  ? "border-[#1A73E8] bg-[#E8F0FE] dark:bg-[#1A73E8]/20"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-full h-24 ${thm.preview} rounded-lg border border-gray-200 dark:border-gray-700`}></div>
                <div className="flex items-center gap-2">
                  <thm.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{thm.name}</span>
                </div>
              </div>
              {theme === thm.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#1A73E8] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
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
            <h3 className="text-lg font-semibold text-gray-900">Background Settings</h3>
            <p className="text-sm text-gray-500">Choose your preferred background style</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                setBackground(bg.id as any);
                toast.success(`${bg.name} background selected`);
              }}
              className={`relative p-3 border-2 rounded-xl transition-all ${
                background === bg.id
                  ? "border-[#1A73E8]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full h-20 ${bg.preview} rounded-lg border border-gray-300`}></div>
                <span className="text-sm font-medium text-gray-900 text-center">{bg.name}</span>
              </div>
              {background === bg.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1A73E8] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI Features */}
      {!isStudent && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
            <p className="text-sm text-gray-500">Manage AI-powered capabilities</p>
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
                      onChange={(e) => {
                        const action = e.target.checked ? "enabled" : "disabled";
                        toast.success(`${feature.title} ${action}`);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#1A73E8] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A73E8]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Usage Statistics */}
      <div className="bg-gradient-to-br from-[#1A73E8] to-[#1557B0] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Usage Statistics</h3>
            <p className="text-sm text-white/80">Current month performance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">AI Recommendations</span>
              <span className="font-semibold">1,234</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Auto-Graded Items</span>
              <span className="font-semibold">856</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Performance Insights</span>
              <span className="font-semibold">432</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Reset to Default
        </button>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
