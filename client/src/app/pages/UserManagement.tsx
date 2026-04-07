import { useState } from "react";
import { UserPlus, GraduationCap, ShieldCheck, Mail, User, Key, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function UserManagement() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"system" | "student">("system");
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "", // Temporary password
    role: "TEACHER", // Default for system context
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const endpoint = activeTab === "system" ? "/api/auth/system-user" : "/api/auth/student";

    try {
      // Hashing the temporary password for masked payload consistency
      const encoder = new TextEncoder();
      const pwData = encoder.encode(formData.password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", pwData);
      const maskedPassword = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, password: maskedPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create account");
      }

      setSuccess(`New ${activeTab === 'system' ? 'System User' : 'Student'} created successfully!`);
      setFormData({ username: "", fullName: "", email: "", password: "", role: activeTab === 'system' ? 'TEACHER' : 'STUDENT' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("menu.user_management")}</h1>
            <p className="text-gray-500 mt-1">{t("Administer platform roles and student onboarding")}</p>
          </div>
          <div className="bg-gray-50 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "system"
                  ? "bg-white text-[#1A73E8] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {t("System Users")}
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "student"
                  ? "bg-white text-[#1A73E8] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {t("Students")}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-12 px-8">
          <form onSubmit={handleCreate} className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                {success}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t("auth.fullname")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
                    placeholder={t("Enter full name")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t("auth.username")}</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
                    placeholder="e.g. jdoe_edu"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
                    placeholder="name@edulms.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t("Temporary Password")}</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
                    placeholder={t("Set temporary password")}
                  />
                </div>
              </div>

              {activeTab === "system" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">System Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A73E8] transition-all"
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1A73E8] text-white rounded-xl font-bold hover:bg-[#1557b0] transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                {loading ? t("auth.processing") : (activeTab === 'system' ? t("Create System Account") : t("Create Student Account"))}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                {t("User will be prompted to change this temporary password on their first login.")}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
