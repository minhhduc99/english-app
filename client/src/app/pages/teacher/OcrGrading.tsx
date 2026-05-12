import { useState, useEffect, useRef } from "react";
import {
  ScanLine, Upload, FileText, CheckCircle, XCircle,
  Loader2, BarChart3, AlertCircle, ChevronDown, ChevronUp,
  Trophy, BookOpen, HelpCircle, ArrowRight,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "sonner";

interface Course { id: string; name: string; courseCode: string; }
interface Test   { id: string; title: string; timeLimit: number; passScore: number; totalScore: number; }

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
    id: string; order: number; content: string;
    options: string[]; correctAnswer: number;
    studentAnswer: number; isCorrect: boolean;
  }[];
}

const LABELS = ["A", "B", "C", "D"];

export function OcrGrading() {
  const { t, language } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses]       = useState<Course[]>([]);
  const [tests, setTests]           = useState<Test[]>([]);
  const [selectedCourse, setCourse] = useState<Course | null>(null);
  const [selectedTest, setTest]     = useState<Test | null>(null);
  const [file, setFile]             = useState<File | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<GradingResult | null>(null);
  const [showDetails, setShowDetails]     = useState(true);
  const [showOcrText, setShowOcrText]     = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingTests, setLoadingTests]   = useState(false);

  const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  /* ── Fetch courses ── */
  useEffect(() => {
    fetch("/api/courses", { headers: auth() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCourses(data))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  /* ── Fetch tests when course changes ── */
  useEffect(() => {
    if (!selectedCourse) { setTests([]); return; }
    setLoadingTests(true);
    fetch(`/api/course-exams/${selectedCourse.id}`, { headers: auth() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTests(data))
      .catch(() => {})
      .finally(() => setLoadingTests(false));
  }, [selectedCourse]);

  const handleFile = (f: File) => {
    const allowed = ["application/pdf","image/jpeg","image/png","image/webp","image/bmp","image/tiff"];
    if (!allowed.includes(f.type)) { toast.error(t("ocr.invalid_file_type")); return; }
    if (f.size > 20 * 1024 * 1024) { toast.error(t("ocr.file_too_large")); return; }
    setFile(f);
    setResult(null);
  };

  const handleGrade = async () => {
    if (!selectedCourse || !selectedTest || !file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `/api/course-exams/${selectedCourse.id}/${selectedTest.id}/grade-scan`,
        { method: "POST", headers: auth(), body: form }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      setResult(await res.json());
      toast.success(t("ocr.grading_complete"));
    } catch (e: any) {
      toast.error(e.message || t("ocr.grading_error"));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setResult(null); setShowDetails(true); setShowOcrText(false); };

  const scoreColor = (pct: number, pass: number) =>
    pct >= pass ? "text-emerald-600" : pct >= pass * 0.75 ? "text-amber-500" : "text-rose-600";
  const scoreBg = (pct: number, pass: number) =>
    pct >= pass ? "bg-emerald-50 border-emerald-200"
    : pct >= pass * 0.75 ? "bg-amber-50 border-amber-200"
    : "bg-rose-50 border-rose-200";

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
          <ScanLine className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("ocr.page_title")}</h1>
          <p className="text-sm text-gray-500">{t("ocr.page_subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Setup Panel ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Step 1 – Course */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {t("ocr.step1")}
            </p>
            {loadingCourses ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-violet-500" /></div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {courses.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">{t("course.no_courses")}</p>
                )}
                {courses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCourse(c); setTest(null); reset(); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all
                      ${selectedCourse?.id === c.id
                        ? "bg-violet-50 border-violet-300 text-violet-700"
                        : "border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 text-gray-700"}`}
                  >
                    <p className="font-bold truncate">{c.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">{c.courseCode}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 – Test */}
          <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-opacity ${!selectedCourse ? "opacity-40 pointer-events-none" : "border-gray-100"}`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {t("ocr.step2")}
            </p>
            {loadingTests ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-violet-500" /></div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {tests.length === 0 && selectedCourse && (
                  <p className="text-sm text-gray-400 italic text-center py-4">{t("course.no_exams")}</p>
                )}
                {tests.map(test => (
                  <button
                    key={test.id}
                    onClick={() => { setTest(test); reset(); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                      ${selectedTest?.id === test.id
                        ? "bg-violet-50 border-violet-300 text-violet-700"
                        : "border-gray-100 hover:border-violet-200 hover:bg-violet-50/40 text-gray-700"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <p className="font-bold truncate">{test.title}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 font-semibold">
                      {test.timeLimit}m &middot; Pass {test.passScore}% &middot; {test.totalScore}pts
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Upload + Result ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Upload Zone */}
          {!result && (
            <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-opacity
              ${!selectedTest ? "opacity-40 pointer-events-none" : "border-gray-100"}`}>

              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                {t("ocr.step3")}
              </p>

              {/* Drop area */}
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${dragOver ? "border-violet-500 bg-violet-50"
                  : file ? "border-violet-400 bg-violet-50"
                  : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff"
                  onChange={e => { const f = e.target.files?.[0]; if(f) handleFile(f); }} />

                {file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold">
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

              {/* Info banner */}
              <div className="flex items-start gap-3 mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">{t("ocr.info_banner")}</p>
              </div>

              {/* Grade button */}
              <button
                onClick={handleGrade}
                disabled={!file || loading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-2xl text-sm font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-200"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{t("ocr.grading")}</>
                  : <><ScanLine className="w-4 h-4" />{t("ocr.grade_btn")}</>
                }
              </button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Score card */}
              <div className={`bg-white rounded-2xl border p-6 ${scoreBg(result.percentage, result.passScore)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className={`w-6 h-6 ${scoreColor(result.percentage, result.passScore)}`} />
                    <div>
                      <h3 className="font-bold text-gray-900">{result.testTitle}</h3>
                      <p className="text-xs text-gray-500">{t("ocr.result_title")}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${result.isPassed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
                    {result.isPassed ? t("ocr.passed") : t("ocr.failed")}
                  </span>
                </div>

                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-5xl font-black ${scoreColor(result.percentage, result.passScore)}`}>
                    {result.raw_score}
                  </span>
                  <span className="text-2xl font-bold text-gray-400 mb-1">/ {result.total_score}</span>
                  <span className={`ml-auto text-3xl font-black ${scoreColor(result.percentage, result.passScore)}`}>
                    {result.percentage}%
                  </span>
                </div>

                <div className="h-2.5 bg-white/60 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${result.isPassed ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(result.percentage, 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: result.correct_count,   label: t("ocr.correct"),     color: "text-emerald-600" },
                    { val: result.wrong_count,      label: t("ocr.wrong"),       color: "text-rose-500"    },
                    { val: result.unanswered_count, label: t("ocr.unanswered"), color: "text-gray-400"    },
                  ].map(item => (
                    <div key={item.label} className="bg-white/70 rounded-xl p-3">
                      <p className={`text-xl font-black ${item.color}`}>{item.val}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">{t("ocr.question_details")}</span>
                  </div>
                  {showDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showDetails && (
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    {result.questions.map(q => (
                      <div key={q.id} className={`p-4 rounded-xl border text-sm
                        ${q.isCorrect ? "bg-emerald-50 border-emerald-100"
                        : q.studentAnswer === -1 ? "bg-gray-50 border-gray-100"
                        : "bg-rose-50 border-rose-100"}`}>
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-0.5">
                            {q.isCorrect
                              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                              : <XCircle className="w-4 h-4 text-rose-500" />
                            }
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 mb-2 leading-snug">
                              <span className="text-gray-400 mr-1">Q{q.order}.</span>{q.content}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <span className="text-xs">
                                <span className="font-bold text-gray-500">{t("ocr.student_ans")}: </span>
                                <span className={`font-bold ${q.studentAnswer === -1 ? "text-gray-400" : q.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                                  {q.studentAnswer === -1 ? t("ocr.no_answer") : `${LABELS[q.studentAnswer]} — ${q.options[q.studentAnswer] || ""}`}
                                </span>
                              </span>
                              {!q.isCorrect && (
                                <span className="text-xs">
                                  <span className="font-bold text-gray-500">{t("ocr.correct_ans")}: </span>
                                  <span className="font-bold text-emerald-600">
                                    {LABELS[q.correctAnswer]} — {q.options[q.correctAnswer] || ""}
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

              {/* Raw OCR text */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setShowOcrText(!showOcrText)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">{t("ocr.raw_text")}</span>
                  </div>
                  {showOcrText ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showOcrText && (
                  <pre className="p-4 text-xs text-gray-600 font-mono bg-gray-50 max-h-48 overflow-auto whitespace-pre-wrap">
                    {result.ocr_text || t("ocr.no_text_extracted")}
                  </pre>
                )}
              </div>

              {/* Scan another */}
              <button onClick={reset}
                className="w-full py-3 border-2 border-dashed border-violet-200 text-violet-600 rounded-2xl text-sm font-bold hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />{t("ocr.scan_another")}
              </button>
            </div>
          )}

          {/* Placeholder when no test selected yet */}
          {!selectedTest && !result && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center opacity-60">
              <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
              <p className="text-gray-400 font-semibold text-sm">
                {language === "en" ? "Select a course and test to get started" : "Chọn khóa học và bài kiểm tra để bắt đầu"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
