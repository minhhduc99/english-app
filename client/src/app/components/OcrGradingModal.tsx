import { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ScanLine,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

interface OcrGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  testId: string;
  testTitle: string;
}

interface GradingResult {
  ocr_text: string;
  student_answers: number[];
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  raw_score: number;
  total_score: number;
  percentage: number;
  testTitle: string;
  passScore: number;
  isPassed: boolean;
  questions: {
    id: string;
    order: number;
    content: string;
    options: string[];
    correctAnswer: number;
    studentAnswer: number;
    isCorrect: boolean;
  }[];
}

const ANSWER_LABELS = ["A", "B", "C", "D"];

export function OcrGradingModal({
  isOpen,
  onClose,
  courseId,
  testId,
  testTitle,
}: OcrGradingModalProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setSelectedFile(null);
    setResult(null);
    setShowOcrText(false);
    setShowDetails(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t("ocr.invalid_file_type"));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error(t("ocr.file_too_large"));
      return;
    }
    setSelectedFile(file);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleGrade = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch(
        `/api/course-exams/${courseId}/${testId}/grade-scan`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data: GradingResult = await res.json();
      setResult(data);
      toast.success(t("ocr.grading_complete"));
    } catch (error: any) {
      console.error("OCR grading error:", error);
      toast.error(error.message || t("ocr.grading_error"));
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (pct: number, pass: number) => {
    if (pct >= pass) return "text-emerald-600";
    if (pct >= pass * 0.75) return "text-amber-500";
    return "text-rose-600";
  };

  const getScoreBg = (pct: number, pass: number) => {
    if (pct >= pass) return "bg-emerald-50 border-emerald-200";
    if (pct >= pass * 0.75) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{t("ocr.title")}</h2>
              <p className="text-xs text-gray-500 font-medium truncate max-w-xs">{testTitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Upload Zone */}
          {!result && (
            <>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                  ${dragOver ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"}
                  ${selectedFile ? "border-violet-400 bg-violet-50" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold mt-1"
                    >
                      {t("ocr.remove_file")}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                      <Upload className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-700">{t("ocr.drop_hint")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("ocr.supported_formats")}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("ocr.info_banner")}</p>
              </div>
            </>
          )}

          {/* Result View */}
          {result && (
            <div className="space-y-5">
              {/* Score Card */}
              <div className={`rounded-2xl border p-6 ${getScoreBg(result.percentage, result.passScore)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className={`w-6 h-6 ${getScoreColor(result.percentage, result.passScore)}`} />
                    <h3 className="font-bold text-gray-900">{t("ocr.result_title")}</h3>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    result.isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}>
                    {result.isPassed ? t("ocr.passed") : t("ocr.failed")}
                  </span>
                </div>

                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-5xl font-black ${getScoreColor(result.percentage, result.passScore)}`}>
                    {result.raw_score}
                  </span>
                  <span className="text-2xl font-bold text-gray-400 mb-1">/ {result.total_score}</span>
                  <span className={`ml-auto text-2xl font-bold ${getScoreColor(result.percentage, result.passScore)}`}>
                    {result.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      result.isPassed ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(result.percentage, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xl font-black text-emerald-600">{result.correct_count}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t("ocr.correct")}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xl font-black text-rose-500">{result.wrong_count}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t("ocr.wrong")}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl p-3">
                    <p className="text-xl font-black text-gray-400">{result.unanswered_count}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{t("ocr.unanswered")}</p>
                  </div>
                </div>
              </div>

              {/* Question Details Accordion */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">{t("ocr.question_details")}</span>
                  </div>
                  {showDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {showDetails && (
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {result.questions.map((q) => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border text-sm ${
                          q.isCorrect
                            ? "bg-emerald-50 border-emerald-100"
                            : q.studentAnswer === -1
                            ? "bg-gray-50 border-gray-100"
                            : "bg-rose-50 border-rose-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-0.5">
                            {q.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 mb-2 leading-snug">
                              <span className="text-gray-400 font-bold mr-1">Q{q.order}.</span>
                              {q.content}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="text-xs">
                                <span className="font-bold text-gray-500">{t("ocr.student_ans")}: </span>
                                <span className={`font-bold ${q.studentAnswer === -1 ? "text-gray-400" : q.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                  {q.studentAnswer === -1 ? t("ocr.no_answer") : ANSWER_LABELS[q.studentAnswer]}
                                  {q.studentAnswer !== -1 && ` — ${q.options[q.studentAnswer] || ""}`}
                                </span>
                              </span>
                              {!q.isCorrect && (
                                <span className="text-xs">
                                  <span className="font-bold text-gray-500">{t("ocr.correct_ans")}: </span>
                                  <span className="font-bold text-emerald-600">
                                    {ANSWER_LABELS[q.correctAnswer]} — {q.options[q.correctAnswer] || ""}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OCR Raw Text Accordion */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowOcrText(!showOcrText)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">{t("ocr.raw_text")}</span>
                  </div>
                  {showOcrText ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showOcrText && (
                  <pre className="p-4 text-xs text-gray-600 font-mono bg-gray-50 overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {result.ocr_text || t("ocr.no_text_extracted")}
                  </pre>
                )}
              </div>

              {/* Re-scan Button */}
              <button
                onClick={() => { setResult(null); setSelectedFile(null); }}
                className="w-full py-3 border-2 border-dashed border-violet-200 text-violet-600 rounded-2xl text-sm font-bold hover:bg-violet-50 transition-all"
              >
                {t("ocr.scan_another")}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleGrade}
              disabled={!selectedFile || loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("ocr.grading")}
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  {t("ocr.grade_btn")}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
