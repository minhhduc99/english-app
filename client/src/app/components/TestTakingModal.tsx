import { useState, useEffect, useCallback } from "react";
import { X, Clock, Target, CheckCircle2, ArrowRight, ArrowLeft, Trophy, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  content: string;
  options: string[];
}

interface TestTakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  testId: string;
  onComplete?: () => void;
}

export function TestTakingModal({ isOpen, onClose, courseId, testId, onComplete }: TestTakingModalProps) {
  const [test, setTest] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  const fetchTestData = useCallback(async () => {
    try {
      const res = await fetch(`/api/course-exams/${courseId}/${testId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTest(data);
        setTimeLeft(data.timeLimit * 60);
      }
    } catch (err) {
      toast.error("Failed to load test");
    } finally {
      setLoading(false);
    }
  }, [courseId, testId]);

  useEffect(() => {
    if (isOpen) {
      fetchTestData();
      setIsStarted(false);
      setIsSubmitted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
    }
  }, [isOpen, fetchTestData]);

  useEffect(() => {
    let timer: any;
    if (isStarted && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isStarted && !isSubmitted) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isStarted, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    
    // Simple client-side scoring for now
    let correctCount = 0;
    test.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const maxScore = test.totalScore || 100;
    const calculatedScore = (correctCount / test.questions.length) * maxScore;
    setScore(calculatedScore);
    
    if (onComplete) onComplete();
  };

  if (!isOpen) return null;

  if (loading) return null;

  if (!isStarted && !isSubmitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full max-w-lg rounded-3xl p-8 text-center animate-in zoom-in-95 font-outfit shadow-2xl">
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h2>
          <p className="text-gray-500 mb-8">{test.description || "Take this assessment to test your knowledge."}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Time Limit</p>
              <p className="text-lg font-bold text-gray-900">{test.timeLimit} mins</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pass Score</p>
              <p className="text-lg font-bold text-gray-900">{test.passScore}%</p>
            </div>
          </div>

          <button
            onClick={() => setIsStarted(true)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Start Exam
          </button>
          <button onClick={onClose} className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const maxScore = test.totalScore || 100;
    const passThreshold = (test.passScore / 100) * maxScore;
    const passed = score >= passThreshold;
    
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-white w-full max-w-lg rounded-3xl p-10 text-center animate-in zoom-in-95 font-outfit shadow-2xl">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
            {passed ? <Trophy className="w-12 h-12 text-green-500" /> : <AlertCircle className="w-12 h-12 text-red-500" />}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{passed ? "Congratulations!" : "Keep Trying!"}</h2>
          <p className="text-gray-500 mb-8">You have completed the <b>{test.title}</b></p>
          
          <div className="bg-gray-50 rounded-3xl p-8 mb-8">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Your Final Score</p>
            <p className={`text-6xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {Math.round(score)}<span className="text-3xl text-gray-400">/{maxScore}</span>
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {passed ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8FAFC] animate-in fade-in duration-300 font-outfit">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-100 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-2 rounded-lg"><Target className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm md:text-base">{test.title}</h3>
            <p className="text-xs text-gray-400">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
          <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span className={`font-mono font-black text-lg ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>{formatTime(timeLeft)}</span>
        </div>

        <button onClick={() => { if(window.confirm("Exit test? Progress will not be saved.")) onClose(); }} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Time Bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 60 ? 'bg-red-500' : 'bg-indigo-600'}`}
          style={{ width: `${(timeLeft / (test.timeLimit * 60)) * 100}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto p-6 md:p-12 pb-32">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {currentQuestion.content}
          </h2>
        </div>

        <div className="space-y-4">
          {currentQuestion.options.map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleSelectOption(index)}
              className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group ${
                answers[currentQuestionIndex] === index
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-white bg-white hover:border-indigo-100 hover:bg-gray-50/50 shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0 transition-colors ${
                answers[currentQuestionIndex] === index
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className={`flex-1 flex flex-col items-start justify-center gap-3 ${answers[currentQuestionIndex] === index ? 'text-indigo-900' : 'text-gray-700'} overflow-hidden`}>
                {(() => {
                  const [textPart, imagePart] = option.split('[IMG]');
                  const hasImage = !!imagePart;
                  const displayImage = imagePart || (option.startsWith('data:image/') || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i.test(option) ? option : '');
                  const displayText = hasImage ? textPart : (displayImage ? '' : option);

                  return (
                    <>
                      {displayText && <span className="text-lg font-semibold">{displayText}</span>}
                      {displayImage && <img src={displayImage} alt={`Option ${index + 1}`} className="max-h-32 w-auto object-contain rounded-lg shadow-sm bg-white" />}
                    </>
                  );
                })()}
              </div>
              {answers[currentQuestionIndex] === index && (
                <div className="ml-auto w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex items-center justify-center">
        <div className="max-w-3xl w-full flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-500 font-bold hover:text-indigo-600 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </button>
          
          <div className="flex gap-2">
            {test.questions.map((_: any, idx: number) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentQuestionIndex ? 'w-6 bg-indigo-600' : answers[idx] !== undefined ? 'bg-indigo-200' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          {currentQuestionIndex === test.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-10 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              Submit Exam <CheckCircle2 className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((p) => Math.min(test.questions.length - 1, p + 1))}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              Next Question <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
