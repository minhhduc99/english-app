import { X, PlaySquare } from "lucide-react";
import { InteractiveVideoPlayer, VideoQuestion } from "./InteractiveVideoPlayer";
import { useLanguage } from "../contexts/LanguageContext";

const MOCK_VIDEO_QUESTIONS: VideoQuestion[] = [
  {
    id: "q1",
    timestamp: 5,
    type: "MULTIPLE_CHOICE",
    question: "What is the name of the big bunny?",
    options: ["Big Buck Bunny", "Bugs Bunny", "Roger Rabbit", "Peter Rabbit"],
    correctAnswer: "Big Buck Bunny"
  },
  {
    id: "q2",
    timestamp: 12,
    type: "FILL_BLANK",
    question: "Fill in the blank: The bunny is eating an ______",
    correctAnswer: "apple"
  }
];

interface InteractiveVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function InteractiveVideoModal({ isOpen, onClose, title }: InteractiveVideoModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-gray-900 rounded-[2.5rem] w-full max-w-5xl max-h-[95vh] shadow-2xl overflow-hidden flex flex-col border border-gray-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <PlaySquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">{t("video.tab")}</p>
              <h2 className="text-xl font-black text-white leading-tight">{title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-all shadow-sm border border-transparent"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex items-center justify-center">
          <InteractiveVideoPlayer 
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            poster="https://www.w3schools.com/html/pic_trulli.jpg"
            questions={MOCK_VIDEO_QUESTIONS}
          />
        </div>
      </div>
    </div>
  );
}
