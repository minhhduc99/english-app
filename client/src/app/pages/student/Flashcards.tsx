import { Volume2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export function Flashcards() {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await fetch("/api/vocabularies", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFlashcards(data);
        }
      } catch (error) {
        console.error("Failed to fetch flashcards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, []);

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentCard((prev: number) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentCard((prev: number) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 italic">
        <p>{t("flashcard.no_data")}</p>
      </div>
    );
  }

  const card = flashcards[currentCard];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">{t("learning_path.flashcards")}</h1>
        <p className="text-[#6B7280]">{t("flashcard.review_subtitle")}</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
          <span>{t("flashcard.card")} {currentCard + 1} / {flashcards.length}</span>
          <span>{Math.round(((currentCard + 1) / flashcards.length) * 100)}% {t("flashcard.complete")}</span>
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
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl font-bold text-[#1A73E8] mb-4">{card.word}</div>
                <div className="text-xl text-[#6B7280] mb-8 font-mono">{card.ipa}</div>
                <div className="text-sm text-[#9CA3AF] uppercase tracking-widest">{t("materials.drop_hint")}</div>
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
                <div className="text-2xl font-semibold mb-4 border-b border-white/20 pb-2">{t("Meaning")}</div>
                <div className="text-3xl mb-8 font-medium">{card.definition}</div>
                {card.example && (
                  <>
                    <div className="text-lg font-semibold mb-2">{t("flashcard.example")}</div>
                    <div className="text-lg italic bg-white/10 p-4 rounded-xl">{card.example}</div>
                  </>
                )}
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
          {t("flashcard.flip")}
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
          {t("games.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Game 1 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#1A73E8] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#EEF5FF] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("games.match_title")}</h3>
            <p className="text-sm text-[#6B7280]">{t("games.match_desc")}</p>
          </div>

          {/* Game 2 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#22C55E] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#DCFCE7] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🖼️</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("games.image_title")}</h3>
            <p className="text-sm text-[#6B7280]">{t("games.image_desc")}</p>
          </div>

          {/* Game 3 */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-6 hover:border-[#F59E0B] hover:shadow-lg transition-all cursor-pointer">
            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="font-semibold text-[#111827] mb-2">{t("games.spell_title")}</h3>
            <p className="text-sm text-[#6B7280]">{t("games.spell_desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
