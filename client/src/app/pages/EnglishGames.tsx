import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Gamepad2, Brain, Search, BookOpen, MessageSquare, X, Sparkles, Trophy, Coins, Star, FileText } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function EnglishGames() {
  const { t } = useLanguage();
  const navigate = useNavigate();

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
      icon: BookOpen,
      difficulty: "Medium",
      description: t("games.sentence_desc"),
      color: "bg-orange-50 text-orange-600",
      borderColor: "hover:border-orange-200",
      key: 'sentence'
    },
    {
      title: t("games.memory_title"),
      icon: Brain,
      difficulty: "Medium",
      description: t("games.memory_desc"),
      color: "bg-green-50 text-green-600",
      borderColor: "hover:border-green-200",
      key: 'memory'
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

  // Sentence Master State
  const [sentenceItems, setSentenceItems] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<{ level: number; xp: number } | null>(null);

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

  const startSentenceMaster = async () => {
    try {
      const res = await fetch("/api/games/sentence?count=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSentenceItems(data);
        setPlayingGame("sentence");
        setCurrentIndex(0);
        setSelectedWords([]);
        setGameFeedback(null);
      }
    } catch (error) {
      toast.error("Failed to start game");
    }
  };

  const startMemoryMatch = async () => {
    try {
      const res = await fetch("/api/games/memory?count=6", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMemoryCards(data);
        setPlayingGame("memory");
        setMatchedPairs([]);
        setFlippedCards([]);
      }
    } catch (error) {
      toast.error("Failed to start game");
    }
  };

  const handleVerify = async () => {
    const isDaily = playingGame === "daily";
    const isSentence = playingGame === "sentence";
    
    let answer = userInput;
    if (isSentence) {
      answer = selectedWords.join(" ");
    }
    
    if (!answer) return;

    const endpoint = isDaily ? "/api/games/daily/verify" : isSentence ? "/api/games/sentence/verify" : "/api/games/scramble/verify";
    const body = isDaily ? { id: dailyStatus.id, answer } : isSentence ? { id: sentenceItems[currentIndex].id, answer } : { id: scrambleItems[currentIndex].id, answer };

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
        if (result.stats) {
            const cached = localStorage.getItem("user");
            if (cached) {
                const u = JSON.parse(cached);
                u.xp = result.stats.totalXp;
                u.coins = result.stats.totalCoins;
                localStorage.setItem("user", JSON.stringify(u));
                // Fire storage event for UI sync
                window.dispatchEvent(new Event('storage'));
            }
        }
        if (result.stats?.levelUp) {
            setShowLevelUp({ level: result.stats.currentLevel, xp: result.stats.totalXp });
        }
        if (result.success) {
          toast.success(t("games.correct"));
          if (isDaily) {
            setDailyStatus({ ...dailyStatus, completed: true });
          } else {
            setTimeout(() => {
              const currentList = isSentence ? sentenceItems : scrambleItems;
              if (currentIndex < currentList.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setUserInput("");
                setSelectedWords([]);
                setGameFeedback(null);
              } else {
                toast.success(t("games.congrats"));
                setPlayingGame(null);
              }
            }, 1500);
          }
        } else {
          toast.error(t("games.wrong"));
          if (isSentence) {
            setSelectedWords([]); // Reset on wrong
          }
        }
      }
    } catch (error) {
      toast.error("Error verifying answer");
    }
  };

  const handleCardClick = (index: number) => {
    if (isProcessing || flippedCards.includes(index) || matchedPairs.includes(memoryCards[index].vocabId)) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const firstCard = memoryCards[newFlipped[0]];
      const secondCard = memoryCards[newFlipped[1]];

      if (firstCard.vocabId === secondCard.vocabId) {
        setMatchedPairs([...matchedPairs, firstCard.vocabId]);
        setFlippedCards([]);
        setIsProcessing(false);
        toast.success("Match found!");
        
        if (matchedPairs.length + 1 === memoryCards.length / 2) {
          setTimeout(async () => {
            try {
              const res = await fetch("/api/games/reward", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ mode: 'memory' })
              });
              if (res.ok) {
                const result = await res.json();
                setGameFeedback(result);
                if (result.stats) {
                    const cached = localStorage.getItem("user");
                    if (cached) {
                        const u = JSON.parse(cached);
                        u.xp = result.stats.totalXp;
                        u.coins = result.stats.totalCoins;
                        localStorage.setItem("user", JSON.stringify(u));
                        window.dispatchEvent(new Event('storage'));
                    }
                }
                if (result.stats?.levelUp) {
                  setShowLevelUp({ level: result.stats.currentLevel, xp: result.stats.totalXp });
                }
              }
            } catch (e) {
              console.error("Reward error", e);
            }
            toast.success(t("games.congrats"));
            setPlayingGame(null);
          }, 1000);
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
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

  if (playingGame === "sentence" && sentenceItems.length > 0) {
    const current = sentenceItems[currentIndex];
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {t("games.back")}
          </button>
          <div className="text-sm font-bold text-gray-400">
            {currentIndex + 1} / {sentenceItems.length}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-orange-100 p-10 shadow-xl shadow-orange-50/50">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("games.sentence_title")}</h2>
            <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest">
              {current.hint}
            </div>
          </div>

          <div className="min-h-[120px] p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mb-8 flex flex-wrap gap-2 items-center justify-center">
            {selectedWords.length > 0 ? selectedWords.map((word, i) => (
              <button
                key={i}
                onClick={() => setSelectedWords(selectedWords.filter((_, idx) => idx !== i))}
                className="px-4 py-2 bg-white border-2 border-orange-200 text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-sm"
              >
                {word}
              </button>
            )) : (
              <p className="text-gray-400 italic">Click words below to build the sentence...</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {current.scrambledWords.map((word: string, i: number) => {
              const instancesInScrambled = current.scrambledWords.filter((w: string) => w === word).length;
              const instancesInSelected = selectedWords.filter((w: string) => w === word).length;
              const isUsed = instancesInSelected >= instancesInScrambled;
              
              return (
                <button
                  key={i}
                  disabled={isUsed}
                  onClick={() => setSelectedWords([...selectedWords, word])}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isUsed 
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:scale-105 active:scale-95 shadow-sm'
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setSelectedWords([])}
              className="flex-1 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Reset
            </button>
            <button
              onClick={handleVerify}
              disabled={selectedWords.length === 0}
              className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
            >
              {t("games.verify_btn")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (playingGame === "memory" && memoryCards.length > 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {t("games.back")}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm font-bold text-gray-400">
              Matches: {matchedPairs.length} / {memoryCards.length / 2}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {memoryCards.map((card, index) => {
            const isFlipped = flippedCards.includes(index);
            const isMatched = matchedPairs.includes(card.vocabId);
            
            return (
              <div
                key={index}
                onClick={() => handleCardClick(index)}
                className={`aspect-square cursor-pointer transition-all duration-300 ${isMatched ? 'opacity-0 pointer-events-none' : ''}`}
              >
                <div className={`relative w-full h-full text-center transition-all duration-500 ${isFlipped ? '[transform:rotateY(180deg)]' : ''} [transform-style:preserve-3d]`}>
                  <div className="absolute w-full h-full bg-green-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg [backface-visibility:hidden]">
                    <Brain className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="absolute w-full h-full bg-white rounded-2xl flex items-center justify-center p-4 border-4 border-green-100 shadow-md [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className={`text-xs md:text-sm font-bold leading-tight ${card.type === 'WORD' ? 'text-green-700 text-lg' : 'text-gray-600'}`}>
                      {card.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (showLevelUp) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
        <div className="relative bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-1 rounded-[3rem] shadow-2xl shadow-orange-500/50 animate-in zoom-in-95 duration-500 scale-110">
          <div className="bg-white rounded-[2.8rem] p-12 text-center relative overflow-hidden">
             <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
             <div className="absolute bottom-10 right-10 w-6 h-6 bg-blue-400 rounded-full animate-bounce" />
             <div className="absolute top-1/2 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
             
             <div className="relative z-10">
                <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Star className="w-16 h-16 text-yellow-600" />
                </div>
                <h2 className="text-5xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Level Up!</h2>
                <div className="inline-block px-8 py-2 bg-yellow-500 text-white rounded-full text-2xl font-black mb-6">
                  LEVEL {showLevelUp.level}
                </div>
                <p className="text-gray-500 font-bold text-lg mb-10">
                    You've reached a new milestone! Keep up the great work.
                </p>
                <button 
                  onClick={() => setShowLevelUp(null)}
                  className="w-full py-5 bg-[#111827] text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl"
                >
                  AWESOME!
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
            onClick={() => {
              if (game.key === 'scramble') startScramble();
              else if (game.key === 'sentence') startSentenceMaster();
              else if (game.key === 'memory') startMemoryMatch();
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 ${game.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                {game.icon && <game.icon className="w-7 h-7" />}
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
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${game.key 
                  ? 'bg-[#1A73E8] text-white hover:bg-[#1557B0] shadow-lg shadow-blue-100'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (game.key === 'scramble') startScramble();
                else if (game.key === 'sentence') startSentenceMaster();
                else if (game.key === 'memory') startMemoryMatch();
              }}
            >
              {game.key ? t("games.play_now") : t("games.coming_soon")}
            </button>
          </div>
        ))}
      </div>

      {/* Secret Store Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group cursor-pointer border border-white/10"
           onClick={() => navigate("/secret-store")}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full -mr-48 -mt-48 blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">Premium Store</span>
                </div>
                <h3 className="text-4xl font-black mb-4 tracking-tight">Monthly Secret Store</h3>
                <p className="text-gray-400 font-medium text-lg max-w-lg">
                    Exchange your earned <span className="text-yellow-400 font-bold">EduCoins</span> for limited-edition avatars, gift cards, and exclusive real-world vouchers. 
                </p>
            </div>
            <div className="flex items-center gap-10">
                 <div className="text-center group-hover:scale-110 transition-transform duration-500">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-3 backdrop-blur-md border border-white/20">
                        <Trophy className="w-10 h-10 text-yellow-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Prizes</span>
                 </div>
                 <div className="text-center group-hover:scale-110 transition-transform duration-500 delay-75">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-3 backdrop-blur-md border border-white/20">
                        <Coins className="w-10 h-10 text-yellow-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Currency</span>
                 </div>
            </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#111827] to-[#374151] rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Brain className="w-6 h-6 text-blue-400" />
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
