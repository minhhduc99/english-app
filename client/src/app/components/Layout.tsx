import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  FileText,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  FolderOpen,
  Home,
  Mic,
  CreditCard,
  Trophy,
  Map,
  Gamepad2,
} from "lucide-react";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentsExpanded, setStudentsExpanded] = useState(true);
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  
  // Use user state instead of hardcoded
  const [user, setUser] = useState({ fullName: "Loading...", role: "..." });

  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (!cachedUser) {
      navigate("/login");
      return;
    }
    
    // Attempt parse
    try {
      setUser(JSON.parse(cachedUser));
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Call the logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear storage regardless of API success to avoid session hanging in UI
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMenuItems = () => {
    if (user.role === "STUDENT") {
      return [
        { path: "/", label: t("menu.home"), icon: Home },
        { path: "/courses", label: t("menu.my_courses"), icon: BookOpen },
        { path: "/ai-speaking", label: t("menu.ai_speaking"), icon: Mic },
        {
          path: "/learning-materials",
          label: t("menu.learning_materials"),
          icon: FolderOpen,
          expandable: true,
          isOpen: materialsExpanded,
          toggle: () => setMaterialsExpanded(!materialsExpanded),
          subItems: [
            { path: "/learning-path", label: t("menu.learning_path") },
            { path: "/flashcards", label: t("menu.flashcards") },
            { path: "/english-games", label: t("menu.english_games") },
          ],
        },
        { path: "/achievements", label: t("menu.achievements"), icon: Trophy },
      ];
    }
    return [
      { path: "/", label: t("menu.dashboard"), icon: LayoutDashboard },
      { path: "/courses", label: t("menu.courses"), icon: BookOpen },
      {
        path: "/students",
        label: t("menu.students"),
        icon: Users,
        expandable: true,
        isOpen: studentsExpanded,
        toggle: () => setStudentsExpanded(!studentsExpanded),
        subItems: [
          { path: "/students", label: t("menu.student_management") },
          { path: "/attendance", label: t("menu.attendance") },
        ],
      },
      // Only show User Management for Admins
      ...(user.role === "ADMIN" ? [{ path: "/user-management", label: t("menu.user_management"), icon: ShieldCheck }] : []),
      ...(["ADMIN", "MANAGER", "TEACHER"].includes(user.role) ? [
        {
          path: "/learning-materials",
          label: t("menu.learning_materials"),
          icon: FolderOpen,
          expandable: true,
          isOpen: materialsExpanded,
          toggle: () => setMaterialsExpanded(!materialsExpanded),
          subItems: [
            { path: "/learning-materials", label: t("menu.learning_materials") },
            { path: "/flashcard-management", label: t("menu.flashcards") },
            { path: "/english-games", label: t("menu.english_games") },
          ],
        }
      ] : []),
      { path: "/reports", label: t("menu.reports"), icon: FileText },
      { path: "/settings", label: t("menu.settings"), icon: Settings },
    ];
  };

  const menuItems = getMenuItems();

  const getPageTitle = () => {
    if (location.pathname === "/") return null;
    if (location.pathname === "/courses") return user.role === "STUDENT" ? t("menu.my_courses") : t("menu.courses");
    if (location.pathname === "/students") return t("menu.student_management");
    if (location.pathname === "/attendance") return t("menu.attendance");
    if (location.pathname === "/learning-materials") return t("menu.learning_materials");
    if (location.pathname === "/reports") return t("menu.reports");
    if (location.pathname === "/settings") return t("menu.settings");
    if (location.pathname === "/user-management") return t("menu.user_management");
    if (location.pathname === "/learning-path") return t("menu.learning_path");
    if (location.pathname === "/ai-speaking") return t("menu.ai_speaking");
    if (location.pathname === "/flashcards") return t("menu.flashcards");
    if (location.pathname === "/achievements") return t("menu.achievements");
    return null;
  };

  const pageTitle = getPageTitle();


  const isItemActive = (item: any) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }
    if (location.pathname.startsWith(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some((sub: any) => location.pathname === sub.path);
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1A73E8] rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">
                EduLMS
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  {item.expandable ? (
                    <>
                      <button
                        onClick={item.toggle}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                          isItemActive(item)
                            ? "bg-[#E8F0FE] text-[#1A73E8]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            item.isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {item.isOpen && item.subItems && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.path}>
                              <Link
                                to={subItem.path}
                                onClick={() =>
                                  setMobileMenuOpen(false)
                                }
                                className={`block px-4 py-2 rounded-lg transition-colors ${
                                  location.pathname ===
                                  subItem.path
                                    ? "bg-[#E8F0FE] text-[#1A73E8]"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isItemActive(item)
                          ? "bg-[#E8F0FE] text-[#1A73E8]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            {pageTitle ? (
              <h1 className="text-xl font-semibold text-gray-900">
                {pageTitle}
              </h1>
            ) : (
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("search.placeholder")}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#1A73E8] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getInitials(user.fullName)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user.fullName}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role}
                </div>
              </div>
            </div>
            <div className="pl-4 border-l border-gray-200">
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                title={t("header.logout")}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}