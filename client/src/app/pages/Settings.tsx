import { useState } from "react";
import { Brain, Sparkles, Zap, Users, Shield, Palette, Image, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedBackground, setSelectedBackground] = useState("default");

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

  const backgrounds = [
    { id: "default", name: "Default", preview: "bg-[#F8F9FA]" },
    { id: "blue", name: "Ocean Blue", preview: "bg-gradient-to-br from-blue-50 to-blue-100" },
    { id: "green", name: "Fresh Green", preview: "bg-gradient-to-br from-green-50 to-green-100" },
    { id: "purple", name: "Royal Purple", preview: "bg-gradient-to-br from-purple-50 to-purple-100" },
    { id: "gradient", name: "Sunset", preview: "bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50" },
  ];

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system settings and preferences</p>
      </div>

      {/* Roles & Permissions Section */}
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

      {/* Theme Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme Settings</h3>
            <p className="text-sm text-gray-500">Customize the appearance of your dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                setSelectedTheme(theme.id);
                toast.success(`${theme.name} theme selected`);
              }}
              className={`relative p-4 border-2 rounded-xl transition-all ${
                selectedTheme === theme.id
                  ? "border-[#1A73E8] bg-[#E8F0FE]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-full h-24 ${theme.preview} rounded-lg border border-gray-200`}></div>
                <div className="flex items-center gap-2">
                  <theme.icon className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">{theme.name}</span>
                </div>
              </div>
              {selectedTheme === theme.id && (
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {backgrounds.map((background) => (
            <button
              key={background.id}
              onClick={() => {
                setSelectedBackground(background.id);
                toast.success(`${background.name} background selected`);
              }}
              className={`relative p-3 border-2 rounded-xl transition-all ${
                selectedBackground === background.id
                  ? "border-[#1A73E8]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`w-full h-20 ${background.preview} rounded-lg border border-gray-300`}></div>
                <span className="text-sm font-medium text-gray-900 text-center">{background.name}</span>
              </div>
              {selectedBackground === background.id && (
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
