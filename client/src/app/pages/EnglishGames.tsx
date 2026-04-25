import { useState, useEffect } from "react";
import { Gamepad2, Brain, Search, LayoutTemplate, BrainCircuit, MessageSquare, X, Sparkles, Trophy, Coins, Star } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function EnglishGames() {
  const { t } = useLanguage();

  const gameSuggestions = [
    {
      title: t("games.scramble_title"),
      icon: Search,
      difficulty: t("games.scramble_difficulty"),
      description: t("games.scramble_desc"),
      color: "bg-blue-50 text-blue-600",
      borderColor: "hover:border-blue-200",
      key: 'scramble'
    },
    {
      title: t("games.sentence_title"),
      icon: LayoutTemplate,
      difficulty: "Medium",
      description: t("games.sentence_desc"),
      color: "bg-orange-50 text-orange-600",
      borderColor: "hover:border-orange-200",
    },
    {
      title: t("games.memory_title"),
      icon: BrainCircuit,
      difficulty: "Medium",
      description: t("games.memory_desc"),
      color: "bg-green-50 text-green-600",
      borderColor: "hover:border-green-200",
    },
    {
      title: t("games.listen_title"),
      icon: MessageSquare,
      difficulty: "Hard",
      description: t("games.listen_desc"),
      color: "bg-purple-50 text-purple-600",
      borderColor: "hover:border-purple-200",
    },
  ];

  const [playingGame, setPlayingGame] = useState<string | null>(null);
  const [scrambleItems, setScrambleItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameFeedback, setGameFeedback] = useState<{ success?: boolean; message?: string; rewards?: { xp: number; coins: number } } | null>(null);
  const [dailyStatus, setDailyStatus] = useState<any>(null);

  useEffect(() => {
    fetchDailyStatus();
  }, []);

  const fetchDailyStatus = async () => {
    try {
      const res = await fetch("/api/games/daily", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDailyStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch daily status");
    }
  };

  const startScramble = async () => {
    try {
      const res = await fetch("/api/games/scramble?count=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScrambleItems(data);
        setPlayingGame("scramble");
        setCurrentIndex(0);
        setUserInput("");
        setGameFeedback(null);
      }
    } catch (error) {
      toast.error("Failed to start game");
    }
  };

  const startDailyChallenge = async () => {
    if (dailyStatus?.completed) return;
    setPlayingGame("daily");
    setUserInput("");
    setGameFeedback(null);
  };

  const handleVerify = async () => {
    if (!userInput) return;
    const isDaily = playingGame === "daily";
    const endpoint = isDaily ? "/api/games/daily/verify" : "/api/games/scramble/verify";
    const body = isDaily ? { id: dailyStatus.id, answer: userInput } : { id: scrambleItems[currentIndex].id, answer: userInput };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const result = await res.json();
        setGameFeedback(result);
        if (result.success) {
          toast.success(t("games.correct"));
          if (isDaily) {
            setDailyStatus({ ...dailyStatus, completed: true });
          } else {
            setTimeout(() => {
              if (currentIndex < scrambleItems.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setUserInput("");
                setGameFeedback(null);
              } else {
                toast.success(t("games.congrats"));
                setPlayingGame(null);
              }
            }, 1500);
          }
        } else {
          toast.error(t("games.wrong"));
        }
      }
    } catch (error) {
      toast.error("Error verifying answer");
    }
  };

  if (playingGame === "scramble" && scrambleItems.length > 0) {
    const current = scrambleItems[currentIndex];
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {t("games.back")}
          </button>
          <div className="text-sm font-bold text-gray-400">
            {t("flashcard.card")} {currentIndex + 1} / {scrambleItems.length}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-blue-100 p-12 text-center shadow-xl shadow-blue-50/50">
          <div className="text-sm uppercase tracking-widest text-[#1A73E8] font-bold mb-4">{t("games.scrambled_word")}</div>
          <div className="text-5xl font-black tracking-[0.2em] text-[#111827] mb-8 select-none">
            {current.scrambled.toUpperCase()}
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-gray-600 italic relative text-center">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gray-100 text-xs font-bold text-gray-400">{t("games.hint_label")}</span>
            "{current.hint}"
          </div>

          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full text-center text-2xl font-bold px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#1A73E8] focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              placeholder={t("games.input_placeholder")}
            />
            <button
              onClick={handleVerify}
              className="w-full py-4 bg-[#1A73E8] text-white rounded-2xl font-bold text-lg hover:bg-[#1557B0] transition-all shadow-lg shadow-blue-200"
            >
              {t("games.verify_btn")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (playingGame === "daily" && dailyStatus) {
    if (gameFeedback?.success && gameFeedback.rewards) {
      return (
        <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-200 animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">{t("games.congrats")}</h2>
          <p className="text-gray-500 text-lg mb-8">{t("games.rewards_title")}</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-blue-50 rounded-3xl p-8 border-2 border-blue-100">
              <div className="text-blue-600 font-black text-4xl mb-2">+{gameFeedback.rewards.xp}</div>
              <div className="text-blue-400 font-bold uppercase tracking-widest text-sm">{t("games.xp")}</div>
            </div>
            <div className="bg-yellow-50 rounded-3xl p-8 border-2 border-yellow-100">
              <div className="text-yellow-600 font-black text-4xl mb-2">+{gameFeedback.rewards.coins}</div>
              <div className="text-yellow-400 font-bold uppercase tracking-widest text-sm">{t("games.coins")}</div>
            </div>
          </div>

          <button
            onClick={() => setPlayingGame(null)}
            className="px-12 py-4 bg-[#111827] text-white rounded-2xl font-bold hover:bg-black transition-all"
          >
            {t("games.back")}
          </button>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {t("games.back")}
          </button>
          <div className="px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest">
            {t("games.daily_difficulty")}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-4 border-purple-100 p-12 text-center shadow-xl shadow-purple-50 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <div className="text-sm uppercase tracking-widest text-purple-500 font-bold mb-4">{t("games.scrambled_word")}</div>
            <div className="text-6xl font-black tracking-[0.2em] text-[#111827] mb-8 select-none">
              {dailyStatus.scrambled.toUpperCase()}
            </div>
            <div className="bg-purple-50/50 rounded-2xl p-6 mb-8 text-gray-600 italic relative text-center border border-purple-100">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-purple-100 text-xs font-bold text-purple-400">{t("games.hint_label")}</span>
              "{dailyStatus.hint}"
            </div>

            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="w-full text-center text-2xl font-bold px-6 py-4 border-2 border-purple-100 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                placeholder={t("games.input_placeholder")}
              />
              <button
                onClick={handleVerify}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                {t("games.verify_btn")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-[#E8F0FE] rounded-2xl flex items-center justify-center mx-auto mb-4 scale-110 shadow-lg shadow-blue-50">
          <Gamepad2 className="w-8 h-8 text-[#1A73E8]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("menu.english_games")}</h1>
      </div>

      {/* Daily Secret Challenge Section */}
      <div 
        className={`relative group cursor-pointer ${dailyStatus?.completed ? 'opacity-75' : ''}`}
        onClick={startDailyChallenge}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse" />
        <div className="relative bg-white rounded-[2.2rem] p-8 border border-gray-100 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Star className={`w-8 h-8 ${dailyStatus?.completed ? 'text-gray-400' : 'text-purple-600'}`} />
            </div>
          </div>
          
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest">
                {t("games.daily_difficulty")}
              </span>
              {dailyStatus?.completed && (
                <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4" />
                  {t("games.daily_claimed")}
                </span>
              )}
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-3">{t("games.daily_title")}</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {t("games.daily_desc")}
            </p>

            <div className="flex items-center gap-6">
              <button 
                disabled={dailyStatus?.completed}
                className={`px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-lg flex items-center gap-3 ${
                  dailyStatus?.completed 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-[#111827] text-white hover:bg-black shadow-gray-200'
                }`}
              >
                {dailyStatus?.completed ? t("games.daily_claimed") : t("games.play_now")}
                {!dailyStatus?.completed && <Sparkles className="w-5 h-5 text-yellow-400" />}
              </button>
              
              {!dailyStatus?.completed && (
                <div className="flex items-center gap-4 text-gray-400 font-bold">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-xl">
                    <Star className="w-5 h-5 text-blue-400" />
                    <span>50-100 {t("games.xp")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-xl">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span>10-30 {t("games.coins")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameSuggestions.map((game, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl border border-gray-100 p-8 shadow-sm transition-all duration-300 border-l-4 ${game.borderColor.replace('hover:', '')} cursor-pointer hover:shadow-xl group relative overflow-hidden`}
            onClick={() => game.key === 'scramble' && startScramble()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                <game.icon className="w-7 h-7" />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${game.color} border border-gray-50`}>
                {game.difficulty}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#1A73E8] transition-colors">{game.title}</h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              {game.description}
            </p>
            <button
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${game.key === 'scramble'
                  ? 'bg-[#1A73E8] text-white hover:bg-[#1557B0] shadow-lg shadow-blue-100'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              onClick={(e) => { e.stopPropagation(); game.key === 'scramble' && startScramble(); }}
            >
              {game.key === 'scramble' ? t("games.play_now") : t("games.coming_soon")}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-blue-400" />
          {t("games.roadmap_title")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-black mb-2 opacity-20">01</div>
            <h4 className="font-bold mb-1 text-blue-300">{t("games.roadmap_step1_title")}</h4>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">{t("games.roadmap_step1_desc")}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-black mb-2 opacity-20">02</div>
            <h4 className="font-bold mb-1 text-pink-300">{t("games.roadmap_step2_title")}</h4>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">{t("games.roadmap_step2_desc")}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <div className="text-3xl font-black mb-2 opacity-20">03</div>
            <h4 className="font-bold mb-1 text-yellow-300">{t("games.roadmap_step3_title")}</h4>
            <p className="text-xs font-medium text-gray-400 leading-relaxed">{t("games.roadmap_step3_desc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
