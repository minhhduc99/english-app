import { Flame, Award, Star, Target, Zap, Trophy, TrendingUp } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useLanguage } from "../../contexts/LanguageContext";

const badges = [
  {
    name: "3-Day Streak",
    icon: "🔥",
    color: "orange",
    earned: true,
    date: "March 15, 2026",
  },
  {
    name: "7-Day Streak",
    icon: "🔥",
    color: "orange",
    earned: true,
    date: "March 19, 2026",
  },
  {
    name: "Homework Hero",
    icon: "📚",
    color: "blue",
    earned: true,
    date: "March 20, 2026",
  },
  {
    name: "Speaking Star",
    icon: "🎤",
    color: "green",
    earned: true,
    date: "March 22, 2026",
  },
  {
    name: "Vocabulary Master",
    icon: "📖",
    color: "blue",
    earned: false,
    date: null,
  },
  {
    name: "14-Day Streak",
    icon: "🔥",
    color: "orange",
    earned: false,
    date: null,
  },
  {
    name: "Quiz Champion",
    icon: "🏆",
    color: "yellow",
    earned: false,
    date: null,
  },
  {
    name: "Perfect Score",
    icon: "⭐",
    color: "yellow",
    earned: false,
    date: null,
  },
];

export function Achievements() {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">{t("menu.achievements")}</h1>
        <p className="text-[#6B7280]">{t("Track your badges, streaks, and milestones")}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Current Streak */}
        <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">
              {t("Current")}
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">7 {t("Days")}</div>
          <div className="text-sm opacity-90">{t("dashboard.learning_streak")}</div>
        </div>

        {/* Total Points */}
        <div className="bg-gradient-to-br from-[#1A73E8] to-[#1557B0] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">
              {t("Total")}
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">425</div>
          <div className="text-sm opacity-90">{t("Points Earned")}</div>
        </div>

        {/* Badges Earned */}
        <div className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">
              {t("Unlocked")}
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">4 / 8</div>
          <div className="text-sm opacity-90">{t("Badges")}</div>
        </div>

        {/* Current Rank */}
        <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-8 h-8" />
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-lg">
              {t("Class")}
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">#5</div>
          <div className="text-sm opacity-90">{t("Your Rank")}</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#111827] mb-1">{t("Level Progress")}</h3>
            <p className="text-sm text-[#6B7280]">{t("Keep learning to reach the next level")}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#1A73E8]">{t("Level 5")}</div>
            <div className="text-sm text-[#6B7280]">425 / 500 XP</div>
          </div>
        </div>
        <Progress.Root
          className="relative overflow-hidden bg-[#E5E7EB] rounded-full w-full h-4"
          value={85}
        >
          <Progress.Indicator
            className="bg-gradient-to-r from-[#1A73E8] to-[#22C55E] w-full h-full transition-transform duration-300"
            style={{ transform: `translateX(-${100 - 85}%)` }}
          />
        </Progress.Root>
        <div className="mt-2 text-sm text-[#6B7280]">75 XP {t("until Level 6")}</div>
      </div>

      {/* Weekly Score */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#111827] mb-1">{t("This Week's Performance")}</h3>
            <p className="text-sm text-[#6B7280]">{t("You're doing great! Keep it up!")}</p>
          </div>
          <TrendingUp className="w-8 h-8 text-[#22C55E]" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
            const scores = [85, 90, 75, 95, 80, 0, 0];
            const score = scores[index];
            const isToday = index === 4;
            return (
              <div key={day} className="text-center">
                <div
                  className={`h-32 rounded-xl mb-2 flex items-end justify-center pb-2 ${
                    score > 0
                      ? isToday
                        ? "bg-[#1A73E8]"
                        : "bg-[#22C55E]"
                      : "bg-[#F3F4F6]"
                  }`}
                >
                  {score > 0 && (
                    <span className="text-white font-semibold">{score}</span>
                  )}
                </div>
                <div className="text-xs text-[#6B7280] font-medium">{day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Gallery */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#111827] mb-6">{t("Badge Collection")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`rounded-2xl p-6 shadow-sm transition-all ${
                badge.earned
                  ? badge.color === "orange"
                    ? "bg-[#FEF3C7] border-2 border-[#F59E0B] hover:shadow-lg"
                    : badge.color === "green"
                    ? "bg-[#DCFCE7] border-2 border-[#22C55E] hover:shadow-lg"
                    : badge.color === "yellow"
                    ? "bg-[#FEF9C3] border-2 border-[#FACC15] hover:shadow-lg"
                    : "bg-[#EEF5FF] border-2 border-[#1A73E8] hover:shadow-lg"
                  : "bg-white border-2 border-[#E5E7EB] opacity-50"
              }`}
            >
              <div className="text-5xl mb-3 text-center">{badge.icon}</div>
              <h3
                className={`font-semibold text-center mb-1 ${
                  badge.earned ? "text-[#111827]" : "text-[#9CA3AF]"
                }`}
              >
                {t(badge.name)}
              </h3>
              {badge.earned && badge.date && (
                <div className="text-xs text-center text-[#6B7280]">{badge.date}</div>
              )}
              {!badge.earned && (
                <div className="text-xs text-center text-[#9CA3AF] mt-2">🔒 {t("learning_path.locked")}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-[#111827] mb-6">{t("Recent Milestones")}</h3>
        <div className="space-y-4">
          {/* Milestone 1 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#22C55E] rounded-full flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#111827]">{t("Completed Unit 2")}</div>
              <div className="text-sm text-[#6B7280]">March 24, 2026 • {t("Earned")} 50 XP</div>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#111827]">{t("7-Day Streak Achieved")}</div>
              <div className="text-sm text-[#6B7280]">March 22, 2026 • {t("Unlocked Badge")}</div>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#1A73E8] rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#111827]">{t("All Homework Completed")}</div>
              <div className="text-sm text-[#6B7280]">March 20, 2026 • {t("Earned")} 30 XP</div>
            </div>
          </div>

          {/* Milestone 4 */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#8B5CF6] rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-[#111827]">{t("Reached Level 5")}</div>
              <div className="text-sm text-[#6B7280]">March 18, 2026 • {t("New abilities unlocked")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
