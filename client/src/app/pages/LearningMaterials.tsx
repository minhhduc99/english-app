import { useState } from "react";
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
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

export function LearningMaterials() {
  const [dragActive, setDragActive] = useState(false);

  const stats = [
    { label: "Total Materials", value: "284", icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "PDF & Images", value: "156", icon: ImageIcon, color: "bg-green-50 text-green-600" },
    { label: "Flashcards", value: "89", icon: CreditCard, color: "bg-purple-50 text-purple-600" },
    { label: "English Games", value: "39", icon: Gamepad2, color: "bg-orange-50 text-orange-600" },
  ];

  const createActions = [
    {
      title: "Create Course Material",
      description: "Create PDF, documents, or presentations for courses",
      icon: BookOpen,
      color: "bg-[#1A73E8]",
      hoverColor: "hover:bg-[#1557B0]",
    },
    {
      title: "Create English Game",
      description: "Design interactive games for English learning",
      icon: Gamepad2,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
    {
      title: "Create Flashcards",
      description: "Build flashcard sets for vocabulary practice",
      icon: CreditCard,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
    },
  ];

  const materials = [
    {
      id: 1,
      name: "English Grammar Basics - Unit 1",
      type: "PDF",
      course: "English 101",
      createdBy: "Sarah Johnson",
      lastUpdated: "Mar 22, 2026",
      status: "Published",
      downloads: 234,
    },
    {
      id: 2,
      name: "Vocabulary Practice Set A",
      type: "Flashcards",
      course: "English 102",
      createdBy: "Michael Brown",
      lastUpdated: "Mar 21, 2026",
      status: "Published",
      downloads: 189,
    },
    {
      id: 3,
      name: "Word Scramble Challenge",
      type: "Game",
      course: "English 101",
      createdBy: "Emma Wilson",
      lastUpdated: "Mar 20, 2026",
      status: "Published",
      downloads: 412,
    },
    {
      id: 4,
      name: "Present Tense Worksheets",
      type: "PDF",
      course: "English 103",
      createdBy: "James Chen",
      lastUpdated: "Mar 19, 2026",
      status: "Draft",
      downloads: 0,
    },
    {
      id: 5,
      name: "Reading Comprehension Images",
      type: "Images",
      course: "English 102",
      createdBy: "Olivia Davis",
      lastUpdated: "Mar 18, 2026",
      status: "Published",
      downloads: 156,
    },
    {
      id: 6,
      name: "Irregular Verbs Flashcards",
      type: "Flashcards",
      course: "English 101",
      createdBy: "Daniel Martinez",
      lastUpdated: "Mar 17, 2026",
      status: "Published",
      downloads: 298,
    },
    {
      id: 7,
      name: "Spelling Bee Game",
      type: "Game",
      course: "English 103",
      createdBy: "Sarah Johnson",
      lastUpdated: "Mar 16, 2026",
      status: "Published",
      downloads: 367,
    },
    {
      id: 8,
      name: "Essay Writing Guide",
      type: "PDF",
      course: "English 104",
      createdBy: "Michael Brown",
      lastUpdated: "Mar 15, 2026",
      status: "Draft",
      downloads: 0,
    },
  ];

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      toast.success(`Uploaded ${e.dataTransfer.files.length} file(s)`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      toast.success(`Uploaded ${e.target.files.length} file(s)`);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-50 text-red-700 border-red-200";
      case "Flashcards":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Game":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Images":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === "Published") {
      return "bg-green-50 text-green-700";
    }
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Learning Materials</h1>
        <p className="text-gray-500 mt-1">Upload, create, and manage course learning resources</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload Files</h2>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? "border-[#1A73E8] bg-[#E8F0FE]"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#E8F0FE] rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#1A73E8]" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX, PPT, PPTX (Max 50MB)
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#1A73E8] text-white rounded-lg hover:bg-[#1557B0] transition-colors">
                <Upload className="w-5 h-5" />
                Upload Files
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Create Learning Content Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Create Learning Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {createActions.map((action, index) => (
            <button
              key={index}
              onClick={() => toast.success(`Opening ${action.title}...`)}
              className={`${action.color} ${action.hoverColor} text-white rounded-xl p-6 text-left transition-all hover:shadow-lg transform hover:-translate-y-1`}
            >
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <action.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-white/90">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Material Library Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Material Library</h2>
            <p className="text-sm text-gray-500 mt-1">Manage all your learning materials</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search materials..."
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent">
              <option>All Types</option>
              <option>PDF</option>
              <option>Images</option>
              <option>Flashcards</option>
              <option>Games</option>
            </select>
            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent">
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Material Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#1A73E8]" />
                      </div>
                      <span className="font-medium text-gray-900">{material.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeStyle(
                        material.type
                      )}`}
                    >
                      {material.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.course}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.createdBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                        material.status
                      )}`}
                    >
                      {material.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.downloads}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.success("Viewing material...")}
                        className="p-2 text-gray-600 hover:text-[#1A73E8] hover:bg-[#E8F0FE] rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.success("Downloading material...")}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.success("Opening editor...")}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.error("Material deleted")}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1 to 8 of 284 materials</p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-[#1A73E8] text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
