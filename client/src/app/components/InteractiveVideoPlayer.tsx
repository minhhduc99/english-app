import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Play, Pause, CheckCircle2, XCircle } from "lucide-react";

export interface VideoQuestion {
  id: string;
  timestamp: number; // in seconds
  question: string;
  type: "MULTIPLE_CHOICE" | "FILL_BLANK";
  options?: string[]; // For multiple choice
  correctAnswer: string;
}

interface InteractiveVideoPlayerProps {
  src: string;
  poster?: string;
  questions: VideoQuestion[];
  onComplete?: () => void;
}

export function InteractiveVideoPlayer({ src, poster, questions, onComplete }: InteractiveVideoPlayerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = Math.floor(video.currentTime);
      
      // Check if there is an unanswered question at the current timestamp
      const questionAtTime = questions.find(
        (q) => Math.abs(q.timestamp - currentTime) < 1 && !answeredQuestionIds.has(q.id)
      );

      if (questionAtTime && !currentQuestion) {
        video.pause();
        setIsPlaying(false);
        setCurrentQuestion(questionAtTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [questions, answeredQuestionIds, currentQuestion, onComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const submitAnswer = () => {
    if (!currentQuestion) return;

    if (userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()) {
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  const continueVideo = () => {
    if (!currentQuestion) return;
    
    setAnsweredQuestionIds((prev) => new Set(prev).add(currentQuestion.id));
    setCurrentQuestion(null);
    setUserAnswer("");
    setFeedback(null);
    
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8">
      {/* Beautiful Border Container */}
      <div className="relative p-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden group">
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
        
        {/* Inner Container */}
        <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-full object-cover"
            onClick={togglePlay}
          />
          
          {/* Custom Play/Pause Overlay when not interacting with a question */}
          {!currentQuestion && (
            <div 
              className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
              onClick={togglePlay}
            >
              <button className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 hover:scale-110 transition-all">
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
              </button>
            </div>
          )}

          {/* Question Overlay */}
          {currentQuestion && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-[2rem] w-11/12 max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                    ?
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{t("video.interactive_question")}</h3>
                </div>
                
                <p className="text-lg font-medium text-gray-800 mb-6">{currentQuestion.question}</p>

                {currentQuestion.type === "MULTIPLE_CHOICE" && currentQuestion.options && (
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option}
                        disabled={feedback !== null}
                        onClick={() => setUserAnswer(option)}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all font-medium ${
                          userAnswer === option
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-100 hover:border-purple-200 hover:bg-gray-50 text-gray-700"
                        } ${feedback !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "FILL_BLANK" && (
                  <div className="mb-6">
                    <input
                      type="text"
                      disabled={feedback !== null}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t("video.type_answer")}
                      className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-purple-500 focus:bg-white transition-all text-lg font-medium"
                    />
                  </div>
                )}

                {/* Feedback Area */}
                {feedback && (
                  <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
                    feedback === "correct" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>
                    {feedback === "correct" ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    <p className="font-bold">
                      {feedback === "correct" ? t("video.correct") : t("video.incorrect")}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  {!feedback ? (
                    <button
                      onClick={submitAnswer}
                      disabled={!userAnswer}
                      className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {t("video.submit")}
                    </button>
                  ) : (
                    <button
                      onClick={continueVideo}
                      className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-200 hover:scale-105 transition-all"
                    >
                      {t("video.continue")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
