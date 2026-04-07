import { Flame, BookCheck, Mic, Trophy, ArrowRight, Calendar, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { useLanguage } from "../../contexts/LanguageContext";

export function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#111827] mb-2">
          {t("dashboard.welcome")}
        </h1>
        <p className="text-[#6B7280] mb-1">{t("dashboard.subtitle")}</p>
        <p className="text-[#1A73E8] font-medium">
          {t("dashboard.streak_message")}
        </p>
      </div>

      {/* Daily Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Learning Streak */}
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
          <h3 className="text-[#92400E] font-semibold mb-1">{t("dashboard.learning_streak")}</h3>
          <div className="text-3xl font-bold text-[#F59E0B] mb-2">{t("dashboard.7_days")}</div>
          <p className="text-sm text-[#92400E] mb-4">{t("dashboard.studied_7_days")}</p>
          <button className="text-sm text-[#F59E0B] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            {t("dashboard.view_calendar")} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Homework */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#EEF5FF] rounded-xl flex items-center justify-center">
              <BookCheck className="w-6 h-6 text-[#1A73E8]" />
            </div>
          </div>
          <h3 className="text-[#111827] font-semibold mb-1">{t("dashboard.homework")}</h3>
          <div className="text-xl font-bold text-[#111827] mb-1">{t("dashboard.tasks_remaining")}</div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-[#6B7280]">{t("dashboard.next_deadline")}</span>
            <span className="text-sm bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded-md font-medium">
              9:00 PM
            </span>
          </div>
          <button className="w-full bg-[#1A73E8] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#1557B0] transition-colors">
            {t("dashboard.continue")}
          </button>
        </div>

        {/* AI Speaking Practice */}
        <div className="bg-[#DCFCE7] border border-[#BBF7D0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-[#22C55E]" />
            </div>
          </div>
          <h3 className="text-[#14532D] font-semibold mb-1">{t("dashboard.ai_speaking")}</h3>
          <div className="text-xl font-bold text-[#22C55E] mb-2">{t("dashboard.goal2_status").split(" ")[0]} 10 minutes</div>
          <Progress.Root
            className="relative overflow-hidden bg-white rounded-full w-full h-2 mb-4"
            value={50}
          >
            <Progress.Indicator
              className="bg-[#22C55E] w-full h-full transition-transform duration-300"
              style={{ transform: `translateX(-${100 - 50}%)` }}
            />
          </Progress.Root>
          <button className="w-full bg-[#22C55E] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#16A34A] transition-colors">
            {t("dashboard.practice_now")}
          </button>
        </div>

        {/* Current Rank */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-[#FEF3C7] rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
          <h3 className="text-[#111827] font-semibold mb-1">{t("dashboard.current_rank")}</h3>
          <div className="text-3xl font-bold text-[#1A73E8] mb-2">#5</div>
          <p className="text-sm text-[#6B7280] mb-4">{t("dashboard.in_your_class")}</p>
          <button className="text-sm text-[#1A73E8] font-medium flex items-center gap-1 hover:gap-2 transition-all">
            {t("dashboard.view_leaderboard")} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes Section */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#111827] mb-1">{t("dashboard.todays_classes")}</h2>
            <p className="text-[#6B7280]">{t("dashboard.schedule_date")}</p>
          </div>

          <div className="space-y-4">
            {/* Class 1 - Ongoing */}
            <div className="bg-white border-2 border-[#1A73E8] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 bg-[#EEF5FF] rounded-xl flex items-center justify-center mb-2">
                    <BookOpen className="w-8 h-8 text-[#1A73E8]" />
                  </div>
                  <span className="text-xs font-medium text-[#1A73E8] bg-[#EEF5FF] px-2 py-1 rounded-md">
                    {t("dashboard.now")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">{t("dashboard.english")}</h3>
                      <p className="text-sm text-[#6B7280]">{t("dashboard.ms_thuthao")}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#111827]">9:00 - 10:30 AM</div>
                      <div className="text-sm text-[#1A73E8]">{t("dashboard.in_progress")}</div>
                    </div>
                  </div>
                  <div className="bg-[#F8FBFF] rounded-lg p-4 mb-3">
                    <div className="text-sm text-[#6B7280] mb-1">{t("dashboard.todays_topic")}</div>
                    <div className="font-medium text-[#111827]">{t("dashboard.topic_en")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-[#1A73E8] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#1557B0] transition-colors">
                      {t("dashboard.join_class")}
                    </button>
                    <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                      {t("dashboard.view_materials")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Class 2 - Upcoming */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-xl flex items-center justify-center mb-2">
                    <span className="text-2xl">🔢</span>
                  </div>
                  <span className="text-xs font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md">
                    {t("dashboard.next")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">{t("dashboard.math")}</h3>
                      <p className="text-sm text-[#6B7280]">{t("dashboard.mr_hoangnam")}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#111827]">10:45 - 12:00 PM</div>
                      <div className="text-sm text-[#6B7280]">{t("dashboard.starts_15")}</div>
                    </div>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-lg p-4 mb-3">
                    <div className="text-sm text-[#6B7280] mb-1">{t("dashboard.todays_topic")}</div>
                    <div className="font-medium text-[#111827]">{t("dashboard.topic_math")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                      {t("dashboard.view_materials")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Class 3 - Upcoming */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-16 h-16 bg-[#F3E8FF] rounded-xl flex items-center justify-center mb-2">
                    <span className="text-2xl">🔬</span>
                  </div>
                  <span className="text-xs font-medium text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-md">
                    {t("dashboard.later")}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#111827] mb-1">{t("dashboard.science")}</h3>
                      <p className="text-sm text-[#6B7280]">{t("dashboard.ms_lananh")}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-[#111827]">1:00 - 2:30 PM</div>
                      <div className="text-sm text-[#6B7280]">{t("dashboard.after_lunch")}</div>
                    </div>
                  </div>
                  <div className="bg-[#F8F9FA] rounded-lg p-4 mb-3">
                    <div className="text-sm text-[#6B7280] mb-1">{t("dashboard.todays_topic")}</div>
                    <div className="font-medium text-[#111827]">{t("dashboard.topic_sci")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="border border-[#E5E7EB] text-[#6B7280] py-2 px-4 rounded-lg font-medium hover:bg-[#F8F9FA] transition-colors">
                      {t("dashboard.view_materials")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* My Rank Widget */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#111827] mb-1">{t("dashboard.my_rank")}</h3>
            <p className="text-sm text-[#6B7280] mb-4">{t("dashboard.see_who")}</p>
            
            <div className="space-y-2">
              {/* Student Above */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors">
                <div className="text-[#F59E0B] font-bold text-lg w-6">#4</div>
                <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#1A73E8] font-medium flex-shrink-0">
                  TN
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#111827] truncate">Thu Nga</div>
                  <div className="text-xs text-[#6B7280]">Class 5A</div>
                </div>
                <div className="font-semibold text-[#111827]">450</div>
              </div>

              {/* Current Student */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#EEF5FF] border-2 border-[#1A73E8]">
                <div className="text-[#1A73E8] font-bold text-lg w-6">#5</div>
                <div className="w-10 h-10 rounded-full bg-[#1A73E8] flex items-center justify-center text-white font-medium flex-shrink-0">
                  MD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#111827] truncate">{t("dashboard.you")}</div>
                  <div className="text-xs text-[#6B7280]">Class 5A</div>
                </div>
                <div className="font-semibold text-[#1A73E8]">425</div>
              </div>

              {/* Student Below */}
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8F9FA] transition-colors">
                <div className="text-[#6B7280] font-bold text-lg w-6">#6</div>
                <div className="w-10 h-10 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#22C55E] font-medium flex-shrink-0">
                  HL
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[#111827] truncate">Hoang Long</div>
                  <div className="text-xs text-[#6B7280]">Class 5A</div>
                </div>
                <div className="font-semibold text-[#111827]">410</div>
              </div>
            </div>
          </div>

          {/* Today's Goals Widget */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-[#111827] mb-4">{t("dashboard.todays_goals")}</h3>
            
            <div className="space-y-3">
              {/* Goal 1 - Completed */}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[#111827] line-through">{t("dashboard.goal1")}</div>
                </div>
              </div>

              {/* Goal 2 - In Progress */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-[#1A73E8] rounded-full flex-shrink-0 mt-0.5"></div>
                <div className="flex-1">
                  <div className="text-[#111827]">{t("dashboard.goal2")}</div>
                  <div className="text-xs text-[#1A73E8] mt-1">{t("dashboard.goal2_status")}</div>
                </div>
              </div>

              {/* Goal 3 - Not Started */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 border-2 border-[#E5E7EB] rounded-full flex-shrink-0 mt-0.5"></div>
                <div className="flex-1">
                  <div className="text-[#6B7280]">{t("dashboard.goal3")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Added missing import
import { BookOpen } from "lucide-react";