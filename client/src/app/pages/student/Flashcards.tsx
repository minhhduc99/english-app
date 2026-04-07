import { Volume2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const flashcards = [
  {
    word: "Family",
    pronunciation: "/ˈfæməli/",
    meaning: "A group of people related by blood or marriage",
    example: "I love spending time with my family.",
  },
  {
    word: "Friend",
    pronunciation: "/frend/",
    meaning: "A person you know well and like",
    example: "She is my best friend.",
  },
  {
    word: "School",
    pronunciation: "/skuːl/",
    meaning: "A place where children go to learn",
    example: "I go to school every day.",
  },
];

export function Flashcards() {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useLanguage();

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const card = flashcards[currentCard];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">{t("learning_path.flashcards")}</h1>
        <p className="text-[#6B7280]">{t("Review vocabulary and play learning games")}</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
          <span>{t("Card")} {currentCard + 1} / {flashcards.length}</span>
          <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}% {t("Complete")}</span>
        </div>
        <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1A73E8] transition-all duration-300"
            style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <div
          className="relative w-full h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={`w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
            }}
          >
            {/* Front Side */}
            <div
              className="absolute w-full h-full bg-white border-2 border-[#E5E7EB] rounded-3xl shadow-lg p-12 backface-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl font-bold text-[#1A73E8] mb-4">{t(card.word)}</div>
                <div className="text-xl text-[#6B7280] mb-8">{card.pronunciation}</div>
                <div className="text-sm text-[#9CA3AF]">{t("Click to flip")}</div>
              </div>
            </div>

            {/* Back Side */}
            <div
              className="absolute w-full h-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] rounded-3xl shadow-lg p-12 backface-hidden"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="flex flex-col justify-center h-full text-white">
                <div className="text-2xl font-semibold mb-4">{t("Meaning")}</div>
                <div className="text-xl mb-8">{t(card.meaning)}</div>
                <div className="text-lg font-semibold mb-2">{t("Example")}</div>
                <div className="text-lg italic">{t(card.example)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#6B7280]" />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-8 py-3 bg-[#1A73E8] text-white rounded-xl font-medium hover:bg-[#1557B0] transition-colors flex items-center gap-2"
        >
          <RotateCw className="w-5 h-5" />
          {t("Flip Card")}
        </button>

        <button className="px-8 py-3 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#16A34A] transition-colors flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          {t("Listen")}
        </button>

        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-[#6B7280]" />
        </button>
      </div>

      {/* Mini Games Section */}
      <div className="border-t-2 border-[#E5E7EB] pt-8">
        <h2 className="text-2xl font-semibold text-[#111827] mb-6 text-center">
          {t("Learning Games")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Game 1 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#EEF5FF] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("Match the Word")}</h3>
            <p className="text-sm text-[#6B7280]">{t("Match words with their meanings")}</p>
          </div>

          {/* Game 2 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#22C55E] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("Choose the Image")}</h3>
            <p className="text-sm text-[#6B7280]">{t("Pick the correct image for each word")}</p>
          </div>

          {/* Game 3 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#F59E0B] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("Spell the Word")}</h3>
            <p className="text-sm text-[#6B7280]">{t("Test your spelling skills")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
