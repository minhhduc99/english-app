import { BookOpen, CheckCircle2, Circle } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useLanguage } from "../../contexts/LanguageContext";

export function LearningPath() {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">{t("menu.learning_path")}</h1>
        <p className="text-[#6B7280]">{t("learning_path.subtitle")}</p>
      </div>

      {/* Units List */}
      <div className="space-y-4">
        {/* Unit Card 1 - In Progress */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#EEF5FF] rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-10 h-10 text-[#1A73E8]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit3")}</h3>
                  <span className="inline-block bg-[#DBEAFE] text-[#1D4ED8] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.in_progress")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={65}
                >
                  <Progress.Indicator
                    className="bg-[#1A73E8] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 65}%)` }}
                  />
                </Progress.Root>
              </div>
              <div className="flex gap-2">
                <button className="bg-[#1A73E8] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#1557B0] transition-colors">
                  {t("learning_path.learn_now")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.materials")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.flashcards")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.speaking")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Card 2 - Completed */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit2")}</h3>
                  <span className="inline-block bg-[#DCFCE7] text-[#166534] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.completed")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium text-[#22C55E]">100%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={100}
                >
                  <Progress.Indicator
                    className="bg-[#22C55E] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 100}%)` }}
                  />
                </Progress.Root>
              </div>
              <div className="flex gap-2">
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.review")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.materials")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.flashcards")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Card 3 - Completed */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#DCFCE7] rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit1")}</h3>
                  <span className="inline-block bg-[#DCFCE7] text-[#166534] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.completed")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium text-[#22C55E]">100%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={100}
                >
                  <Progress.Indicator
                    className="bg-[#22C55E] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 100}%)` }}
                  />
                </Progress.Root>
              </div>
              <div className="flex gap-2">
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.review")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.materials")}
                </button>
                <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                  {t("learning_path.flashcards")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Unit Card 4 - Not Started */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow opacity-60">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#F3F4F6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Circle className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit4")}</h3>
                  <span className="inline-block bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.not_started")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={0}
                >
                  <Progress.Indicator
                    className="bg-[#9CA3AF] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 0}%)` }}
                  />
                </Progress.Root>
              </div>
              <button className="border border-[#E5E7EB] text-[#9CA3AF] py-2 px-6 rounded-lg font-medium cursor-not-allowed">
                {t("learning_path.locked")}
              </button>
            </div>
          </div>
        </div>

        {/* Unit Card 5 - Not Started */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow opacity-60">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#F3F4F6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Circle className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit5")}</h3>
                  <span className="inline-block bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.not_started")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={0}
                >
                  <Progress.Indicator
                    className="bg-[#9CA3AF] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 0}%)` }}
                  />
                </Progress.Root>
              </div>
              <button className="border border-[#E5E7EB] text-[#9CA3AF] py-2 px-6 rounded-lg font-medium cursor-not-allowed">
                {t("learning_path.locked")}
              </button>
            </div>
          </div>
        </div>

        {/* Unit Card 6 - Not Started */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow opacity-60">
          <div className="flex gap-6">
            <div className="w-24 h-24 bg-[#F3F4F6] rounded-xl flex items-center justify-center flex-shrink-0">
              <Circle className="w-10 h-10 text-[#9CA3AF]" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-[#111827] mb-1">{t("learning_path.unit6")}</h3>
                  <span className="inline-block bg-[#F3F4F6] text-[#6B7280] text-xs font-medium px-2 py-1 rounded-md">
                    {t("learning_path.not_started")}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[#6B7280] mb-2">
                  <span>{t("learning_path.progress")}</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress.Root
                  className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-2"
                  value={0}
                >
                  <Progress.Indicator
                    className="bg-[#9CA3AF] w-full h-full transition-transform duration-300"
                    style={{ transform: `translateX(-${100 - 0}%)` }}
                  />
                </Progress.Root>
              </div>
              <button className="border border-[#E5E7EB] text-[#9CA3AF] py-2 px-6 rounded-lg font-medium cursor-not-allowed">
                {t("learning_path.locked")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
