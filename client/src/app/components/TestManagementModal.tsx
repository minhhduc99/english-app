import { useState, useEffect } from "react";
import { Plus, Trash2, X, Clock, Target, CheckCircle, ListChecks, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

interface Question {
  id?: string;
  content: string;
  options: string[];
  correctAnswer: number;
}

interface TestData {
  title: string;
  description: string;
  timeLimit: number;
  passScore: number;
  totalScore: number;
  questions: Question[];
}

interface TestManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  test?: any; // If editing
  onSuccess: () => void;
}

export function TestManagementModal({ isOpen, onClose, courseId, test, onSuccess }: TestManagementModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<TestData>({
    title: "",
    description: "",
    timeLimit: 60,
    passScore: 50,
    totalScore: 100,
    questions: [
      { content: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (test) {
      setFormData({
        title: test.title || "",
        description: test.description || "",
        timeLimit: test.timeLimit || 60,
        passScore: test.passScore || 50,
        totalScore: test.totalScore || 100,
        questions: test.questions?.length > 0 ? test.questions : [{ content: "", options: ["", "", "", ""], correctAnswer: 0 }]
      });
    } else {
      setFormData({
        title: "",
        description: "",
        timeLimit: 60,
        passScore: 50,
        totalScore: 100,
        questions: [{ content: "", options: ["", "", "", ""], correctAnswer: 0 }]
      });
    }
  }, [test, isOpen]);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { content: "", options: ["", "", "", ""], correctAnswer: 0 }]
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Title is required");
    if (formData.questions.some(q => !q.content)) return toast.error("All questions must have content");

    setLoading(true);
    try {
      const url = test 
        ? `/api/course-exams/${courseId}/${test.id}` 
        : `/api/course-exams/${courseId}`;
      const method = test ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(test ? "Test updated" : "Test created");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to save test");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 font-outfit">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{test ? t("course.manage_test") : t("course.create_test")}</h2>
              <p className="text-sm text-gray-500">Design your assessment for this course</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* General Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-3">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("test.title")}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 font-medium"
                placeholder="e.g. Midterm Proficiency Test"
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("test.time_limit")}</label>
              <div className="relative">
                <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("test.total_score")}</label>
              <div className="relative">
                <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.totalScore}
                  onChange={(e) => setFormData({ ...formData, totalScore: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("test.pass_score")}</label>
              <div className="relative">
                <CheckCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.passScore}
                  onChange={(e) => setFormData({ ...formData, passScore: parseInt(e.target.value) || 0 })}
                  className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 font-medium"
                />
              </div>
            </div>
            <div className="space-y-4 md:col-span-3">
              <label className="text-sm font-bold text-gray-700 ml-1">{t("test.description")}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-gray-900 font-medium min-h-[100px]"
                placeholder="Instructions for students..."
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">{t("test.questions")} ({formData.questions.length})</h3>
              </div>
              <button 
                type="button" 
                onClick={handleAddQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all text-sm font-bold"
              >
                <Plus className="w-4 h-4" /> {t("test.add_question")}
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="p-6 rounded-3xl border-2 border-gray-100 space-y-4 bg-white hover:border-indigo-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">Q{qIndex + 1}</span>
                    {formData.questions.length > 1 && (
                      <button onClick={() => handleRemoveQuestion(qIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <textarea
                    value={question.content}
                    onChange={(e) => handleQuestionChange(qIndex, "content", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    placeholder="Enter question content..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, oIndex) => {
                      const [textPart, imagePart] = option.split('[IMG]');
                      const hasImage = !!imagePart;
                      const displayImage = imagePart || (option.startsWith('data:image/') || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(option) ? option : '');
                      const displayText = hasImage ? textPart : (displayImage ? '' : option);
                      const isCorrect = question.correctAnswer === oIndex;

                      return (
                        <div key={oIndex} className={`relative group w-full rounded-2xl flex flex-col transition-all border-2 ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                          {/* Top Row: Input & Controls */}
                          <div className="flex items-center min-h-[60px] relative w-full">
                            {/* A/B/C Label */}
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isCorrect ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-500 group-hover:bg-indigo-200'}`}>
                              {String.fromCharCode(65 + oIndex)}
                            </div>
                            
                            {/* Text Input */}
                            <input
                              type="text"
                              value={displayText}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, displayImage ? `${e.target.value}[IMG]${displayImage}` : e.target.value)}
                              className="w-full pl-16 pr-24 py-4 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-600 placeholder:text-gray-400"
                              placeholder={`Option ${oIndex + 1} text`}
                            />

                            {/* Action Buttons */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {!displayImage && (
                                <label className={`cursor-pointer p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all block ${isCorrect ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                  <ImageIcon className="w-5 h-5" />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          handleOptionChange(qIndex, oIndex, `${displayText}[IMG]${reader.result}`);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }} 
                                  />
                                </label>
                              )}

                              <button 
                                type="button"
                                onClick={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                                className={`p-2 rounded-xl transition-all ${isCorrect ? 'text-green-600 bg-green-50 opacity-100' : 'text-gray-300 hover:text-green-500 hover:bg-green-50 opacity-0 group-hover:opacity-100'}`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Preview Area */}
                          {displayImage && (
                            <div className="px-4 pb-4 pl-16 relative">
                              <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm group/img">
                                <img src={displayImage} alt="preview" className="h-24 w-auto object-contain bg-white" />
                                <button 
                                  type="button"
                                  onClick={() => handleOptionChange(qIndex, oIndex, displayText)}
                                  className="absolute top-1 right-1 p-1.5 bg-black/60 hover:bg-red-500 rounded-lg text-white opacity-0 group-hover/img:opacity-100 transition-all backdrop-blur-sm"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? "Saving..." : test ? "Update Exam" : "Create Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
