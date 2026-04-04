import { Search, Bell } from "lucide-react";

export function Topbar() {
  const user = {
    fullName: "Class Manager",
    role: "Class Manager",
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
  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative p-2 hover:bg-gray-50 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  );
}