import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Gamepad2, Brain, Search, BookOpen, MessageSquare, X, Sparkles, Trophy, Star, FileText, CheckCircle2, XCircle, Car } from "lucide-react";
import { StickerIcon } from "../components/StickerIcon";
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
    {
      title: t("games.translation_title"),
      icon: MessageSquare,
      difficulty: t("games.translation_difficulty"),
      description: t("games.translation_desc"),
      color: "bg-red-50 text-red-600",
      borderColor: "hover:border-red-200",
      key: 'translation'
    },
    {
      title: t("games.typing_title"),
      icon: Car,
      difficulty: t("games.typing_difficulty"),
      description: t("games.typing_desc"),
      color: "bg-teal-50 text-teal-600",
      borderColor: "hover:border-teal-200",
      key: 'typing'
    },
  ];

  const [playingGame, setPlayingGame] = useState<string | null>(null);
  const [scrambleItems, setScrambleItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameFeedback, setGameFeedback] = useState<{ success?: boolean; message?: string; rewards?: { xp: number; stickers: number } } | null>(null);
  const [dailyStatus, setDailyStatus] = useState<any>(null);

  // Sentence Master State
  const [sentenceItems, setSentenceItems] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Memory Match State
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Translation Quiz State
  const [translationItems, setTranslationItems] = useState<any[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState<{ level: number; xp: number } | null>(null);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  // Typing Game State
  const [typingState, setTypingState] = useState<'select_char' | 'playing' | 'game_over'>('select_char');
  const [typingCharacter, setTypingCharacter] = useState<'boy' | 'girl' | null>(null);
  const [typingWords, setTypingWords] = useState<any[]>([]);
  const [typingCurrentIndex, setTypingCurrentIndex] = useState(0);
  const [typingInput, setTypingInput] = useState("");
  const [typingTimeLeft, setTypingTimeLeft] = useState(60);
  const [wordTimeLeft, setWordTimeLeft] = useState(6);
  const [typingCorrectCount, setTypingCorrectCount] = useState(0);
  const [typingWrongCount, setTypingWrongCount] = useState(0);
  const [typingScore, setTypingScore] = useState(0);
  const [typingCarSpeed, setTypingCarSpeed] = useState<'normal' | 'boost' | 'hit'>('normal');
  const [typingFeedbackList, setTypingFeedbackList] = useState<{ id: number; type: 'correct' | 'wrong' | 'slow'; amount: number }[]>([]);
  const [typingSubmitFeedback, setTypingSubmitFeedback] = useState<any>(null);
  const [typingScrambledWord, setTypingScrambledWord] = useState("");
  const [wordBonusType, setWordBonusType] = useState<'NORMAL' | 'X2' | 'X3' | 'PLUS100' | 'PLUS200'>('NORMAL');

  const playSound = (success: boolean, textToSpeak?: string, lang: string = 'en-US', onFinish?: () => void) => {
    if (success) {
      if (textToSpeak && 'speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(textToSpeak);
        msg.lang = lang;
        if (onFinish) {
          msg.onend = onFinish;
          msg.onerror = onFinish;
        }
        window.speechSynthesis.speak(msg);
      } else {
        const audio = new Audio("/sounds/correct.mp3");
        if (onFinish) {
          audio.onended = onFinish;
          audio.onerror = onFinish;
        }
        audio.play().catch(e => {
          console.log("Sound play prevented");
          if (onFinish) onFinish();
        });
      }
    } else {
      if ('speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance("Try again");
        msg.lang = 'en-US';
        window.speechSynthesis.speak(msg);
      } else {
        const audio = new Audio("/sounds/wrong.mp3");
        audio.play().catch(e => console.log("Sound play prevented"));
      }
    }
  };

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

  const startTranslationMaster = async () => {
    try {
      const res = await fetch("/api/games/translation?count=5", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTranslationItems(data);
        setPlayingGame("translation");
        setCurrentIndex(0);
        setUserInput("");
        setGameFeedback(null);
      }
    } catch (error) {
      toast.error("Failed to start game");
    }
  };

  // Typing Racing Game Implementation
  const startTypingGame = () => {
    setPlayingGame("typing");
    setTypingState("select_char");
    setTypingCharacter(null);
    setTypingWords([]);
    setTypingCurrentIndex(0);
    setTypingInput("");
    setTypingTimeLeft(60);
    setWordTimeLeft(6);
    setTypingCorrectCount(0);
    setTypingWrongCount(0);
    setTypingScore(0);
    setTypingCarSpeed("normal");
    setTypingFeedbackList([]);
    setTypingSubmitFeedback(null);
    setWordBonusType("NORMAL");
  };

  const selectCharacterAndStart = async (char: 'boy' | 'girl') => {
    setTypingCharacter(char);
    try {
      const res = await fetch("/api/games/typing/words", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      let words = [];
      if (res.ok) {
        words = await res.json();
      }
      
      // Fallback if empty or failed
      if (!words || words.length === 0) {
        words = [
          { id: "f1", word: "apple", definition: "A round red or green fruit" },
          { id: "f2", word: "banana", definition: "A long curved yellow fruit" },
          { id: "f3", word: "orange", definition: "A round citrus fruit with orange skin" },
          { id: "f4", word: "computer", definition: "An electronic device for storing data" },
          { id: "f5", word: "keyboard", definition: "Keys used to input text into a computer" },
          { id: "f6", word: "english", definition: "The language originally spoken in England" },
          { id: "f7", word: "student", definition: "A person studying at school or college" },
          { id: "f8", word: "teacher", definition: "A person who teaches in a school" },
          { id: "f9", word: "classroom", definition: "A room in which students are taught" },
          { id: "f10", word: "library", definition: "A building containing collections of books" },
          { id: "f11", word: "challenge", definition: "A test of ability or contest" },
          { id: "f12", word: "racing", definition: "Competing in speed races" },
          { id: "f13", word: "sticker", definition: "Adhesive paper with a design" },
          { id: "f14", word: "pothole", definition: "A deep hole in a road surface" },
          { id: "f15", word: "success", definition: "Accomplishment of an aim" }
        ].sort(() => 0.5 - Math.random());
      }
      
      setTypingWords(words);
      setTypingState("playing");
      setTypingTimeLeft(60);
      setWordTimeLeft(6);
      setTypingCurrentIndex(0);
      setTypingInput("");
      setTypingCorrectCount(0);
      setTypingWrongCount(0);
      setTypingScore(0);
      setTypingFeedbackList([]);
    } catch (e) {
      toast.error("Failed to load game vocabulary");
    }
  };

  const goToNextTypingWord = () => {
    setTypingInput("");
    setWordTimeLeft(6);
    setTypingCurrentIndex((prev) => {
      if (prev + 1 >= typingWords.length) {
        return 0; // wrap around vocabulary pool
      }
      return prev + 1;
    });
  };

  const handleWordTimeout = () => {
    setTypingWrongCount((prev) => prev + 1);
    setTypingScore((prev) => Math.max(0, prev - 200));
    
    const feedbackId = Date.now();
    setTypingFeedbackList((prev) => [...prev, { id: feedbackId, type: 'slow', amount: -200 }]);
    setTimeout(() => {
      setTypingFeedbackList((prev) => prev.filter(f => f.id !== feedbackId));
    }, 1500);

    setTypingCarSpeed("hit");
    setTimeout(() => setTypingCarSpeed("normal"), 800);

    playSound(false);
    goToNextTypingWord();
  };

  const handleTypingGameOver = () => {
    setTypingState("game_over");
  };

  const submitTypingGameResults = async (correct: number, wrong: number, score: number) => {
    try {
      const res = await fetch("/api/games/typing/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ correctCount: correct, wrongCount: wrong, score: Math.max(0, score) })
      });
      if (res.ok) {
        const result = await res.json();
        setTypingSubmitFeedback(result);
        
        if (result.stats) {
          const cached = localStorage.getItem("user");
          if (cached) {
            const u = JSON.parse(cached);
            u.stickers = result.stats.totalStickers;
            localStorage.setItem("user", JSON.stringify(u));
            window.dispatchEvent(new Event('storage'));
          }
        }
      } else {
        toast.error("Failed to save score");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving score");
    }
  };

  const handleTypingSubmit = () => {
    if (!typingWords.length) return;
    const currentWord = typingWords[typingCurrentIndex].word.trim().toLowerCase();
    const isCorrect = typingInput.trim().toLowerCase() === currentWord;

    if (isCorrect) {
      setTypingCorrectCount((prev) => prev + 1);
      
      let rewardAmount = 100;
      if (wordBonusType === 'X2') rewardAmount = 200;
      else if (wordBonusType === 'X3') rewardAmount = 300;
      else if (wordBonusType === 'PLUS100') rewardAmount = 200;
      else if (wordBonusType === 'PLUS200') rewardAmount = 300;

      setTypingScore((prev) => prev + rewardAmount);

      const feedbackId = Date.now();
      setTypingFeedbackList((prev) => [...prev, { id: feedbackId, type: 'correct', amount: rewardAmount }]);
      setTimeout(() => {
        setTypingFeedbackList((prev) => prev.filter(f => f.id !== feedbackId));
      }, 1500);

      setTypingCarSpeed("boost");
      setTimeout(() => setTypingCarSpeed("normal"), 800);

      playSound(true, currentWord);
      goToNextTypingWord();
    } else {
      setTypingWrongCount((prev) => prev + 1);
      setTypingScore((prev) => Math.max(0, prev - 200));

      const feedbackId = Date.now();
      setTypingFeedbackList((prev) => [...prev, { id: feedbackId, type: 'wrong', amount: -200 }]);
      setTimeout(() => {
        setTypingFeedbackList((prev) => prev.filter(f => f.id !== feedbackId));
      }, 1500);

      setTypingCarSpeed("hit");
      setTimeout(() => setTypingCarSpeed("normal"), 800);

      playSound(false);
      goToNextTypingWord();
    }
  };

  // Scramble typing word & pick random bonus when current word changes
  useEffect(() => {
    if (playingGame === "typing" && typingWords.length > 0 && typingWords[typingCurrentIndex]) {
      const original = typingWords[typingCurrentIndex].word;
      let scrambled = original;
      let attempts = 0;
      // Keep shuffling until it's different from the original word (if length > 1)
      while (scrambled.toLowerCase() === original.toLowerCase() && original.length > 1 && attempts < 20) {
        scrambled = original.split('').sort(() => 0.5 - Math.random()).join('');
        attempts++;
      }
      setTypingScrambledWord(scrambled);

      // Random bonus allocation: 10% X2, 5% X3, 10% PLUS100, 5% PLUS200, 70% NORMAL
      const rand = Math.random();
      if (rand < 0.10) {
        setWordBonusType('X2');
      } else if (rand < 0.15) {
        setWordBonusType('X3');
      } else if (rand < 0.25) {
        setWordBonusType('PLUS100');
      } else if (rand < 0.30) {
        setWordBonusType('PLUS200');
      } else {
        setWordBonusType('NORMAL');
      }
    }
  }, [playingGame, typingCurrentIndex, typingWords]);

  // Typing game timers
  useEffect(() => {
    if (playingGame !== "typing" || typingState !== "playing") return;

    const gameTimer = setInterval(() => {
      setTypingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          handleTypingGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const wordTimer = setInterval(() => {
      setWordTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleWordTimeout();
          return 6;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => {
      clearInterval(gameTimer);
      clearInterval(wordTimer);
    };
  }, [playingGame, typingState, typingCurrentIndex, typingWords]);

  // Handle score submission on game over
  useEffect(() => {
    if (playingGame === "typing" && typingState === "game_over") {
      submitTypingGameResults(typingCorrectCount, typingWrongCount, typingScore);
    }
  }, [typingState]);

  const renderWordHighlight = () => {
    if (!typingWords.length) return null;
    const word = typingWords[typingCurrentIndex].word;
    
    return (
      <div className="flex justify-center items-center gap-1.5 flex-wrap text-4xl font-extrabold select-none mb-6">
        {word.split('').map((char, index) => {
          let displayChar = "_";
          let colorClass = "text-gray-300";
          if (index < typingInput.length) {
            const inputChar = typingInput[index];
            displayChar = char; // Reveal the correct letter when typed!
            if (inputChar.toLowerCase() === char.toLowerCase()) {
              colorClass = "text-green-500 underline decoration-2 decoration-green-400";
            } else {
              colorClass = "text-red-500 line-through decoration-2 decoration-red-400";
            }
          }
          return (
            <span key={index} className={`${colorClass} px-1.5 py-1 rounded transition-colors duration-150`}>
              {displayChar}
            </span>
          );
        })}
      </div>
    );
  };

  const renderTypingGame = () => {
    if (typingState === "select_char") {
      return (
        <div className="p-6 max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
              <X className="w-5 h-5" /> {t("games.back")}
            </button>
            <span className="px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-black uppercase tracking-widest">
              {t("games.typing_difficulty")}
            </span>
          </div>

          <div className="bg-white rounded-3xl border-2 border-teal-100 p-10 text-center shadow-xl shadow-teal-50/50">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{t("games.typing_select_char")}</h2>
            <p className="text-gray-500 mb-8">{t("games.typing_desc")}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-xl mx-auto mb-8">
              {/* Racing Boy Card */}
              <div 
                onClick={() => selectCharacterAndStart('boy')}
                className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-100 hover:border-blue-500 cursor-pointer shadow-md hover:shadow-xl transition-all group flex flex-col items-center"
              >
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <svg viewBox="0 0 40 40" className="w-20 h-20">
                    <circle cx="20" cy="20" r="16" fill="#1E40AF" />
                    <path d="M20,8 C27,8 32,13 32,20 L20,20 Z" fill="#1E293B" />
                    <circle cx="20" cy="14" r="2" fill="#38BDF8" />
                    <path d="M12,24 C12,24 15,28 20,28 C25,28 28,24 28,24" stroke="#FFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">{t("games.typing_boy")}</span>
                <span className="text-xs text-blue-500 font-bold mt-2 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Blue Storm Car</span>
              </div>

              {/* Racing Girl Card */}
              <div 
                onClick={() => selectCharacterAndStart('girl')}
                className="bg-gradient-to-b from-pink-50 to-white rounded-2xl p-6 border-2 border-pink-100 hover:border-pink-500 cursor-pointer shadow-md hover:shadow-xl transition-all group flex flex-col items-center"
              >
                <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <svg viewBox="0 0 40 40" className="w-20 h-20">
                    <path d="M8,22 C4,16 4,8 12,10 C12,10 10,18 8,22" fill="#F59E0B" />
                    <circle cx="20" cy="20" r="16" fill="#DB2777" />
                    <path d="M20,8 C27,8 32,13 32,20 L20,20 Z" fill="#1E293B" />
                    <circle cx="20" cy="14" r="2" fill="#F472B6" />
                    <path d="M12,24 C12,24 15,28 20,28 C25,28 28,24 28,24" stroke="#FFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">{t("games.typing_girl")}</span>
                <span className="text-xs text-pink-500 font-bold mt-2 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">Pink Flame Car</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (typingState === "playing" && typingWords.length > 0) {
      const current = typingWords[typingCurrentIndex];
      const carColor = typingCharacter === 'boy' ? '#3B82F6' : '#EC4899';
      
      let carAnimation = 'driveBob 0.6s infinite ease-in-out';
      if (typingCarSpeed === 'boost') carAnimation = 'driveBoost 0.2s infinite ease-in-out';
      if (typingCarSpeed === 'hit') carAnimation = 'shakeCar 0.15s infinite linear';

      return (
        <div className={`p-6 max-w-4xl mx-auto space-y-6 animate-in zoom-in-95 duration-300 ${typingCarSpeed === 'hit' ? 'animate-[shakeScreen_0.3s_ease-in-out]' : ''}`}>
          <style>{`
            @keyframes driveBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            @keyframes driveBoost {
              0%, 100% { transform: translateY(-2px) scale(1.05) rotate(1deg); }
              50% { transform: translateY(-4px) scale(1.05) rotate(2deg); }
            }
            @keyframes shakeCar {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              20% { transform: translate(-3px, 2px) rotate(-1deg); }
              40% { transform: translate(3px, -1px) rotate(1deg); }
              60% { transform: translate(-2px, -2px) rotate(-1deg); }
              80% { transform: translate(2px, 1px) rotate(1deg); }
            }
            @keyframes moveRoad {
              0% { background-position-x: 0px; }
              100% { background-position-x: -80px; }
            }
            @keyframes floatSticker {
              0% { transform: translateY(0) scale(0.8); opacity: 0; }
              10% { opacity: 1; }
              100% { transform: translateY(-80px) scale(1.3); opacity: 0; }
            }
            @keyframes shakeScreen {
              0%, 100% { transform: translate(0, 0); }
              20% { transform: translate(-4px, 4px); }
              40% { transform: translate(4px, -4px); }
              60% { transform: translate(-2px, -2px); }
              80% { transform: translate(2px, 2px); }
            }
          `}</style>

          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => {
                setPlayingGame(null);
              }} 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 font-bold"
            >
              <X className="w-5 h-5" /> {t("games.back")}
            </button>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">{t("games.typing_time_left")}:</span>
                <span className="text-xl font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 animate-pulse">
                  {typingTimeLeft}s
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">{t("games.typing_score")}:</span>
                <span className={`text-xl font-black px-3 py-1 rounded-lg border flex items-center gap-1.5 ${typingScore >= 0 ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                  <StickerIcon className="w-5 h-5 text-yellow-500" />
                  {Math.max(0, typingScore)}
                </span>
              </div>
            </div>
          </div>

          {/* Road Visuals */}
          <div className="relative bg-slate-900 rounded-3xl h-56 border-4 border-slate-800 overflow-hidden shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-teal-900 to-slate-900 opacity-60 flex justify-around overflow-hidden select-none">
              <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[40px] border-b-teal-800" />
              <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[50px] border-b-teal-700" />
              <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[35px] border-b-teal-800" />
              <div className="w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[60px] border-b-teal-700" />
            </div>

            <div className="absolute inset-x-0 top-12 h-1 bg-slate-500 opacity-50" />
            <div className="absolute inset-x-0 bottom-8 h-1 bg-slate-500 opacity-50" />

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 overflow-hidden">
              <div 
                className="w-[200%] h-full flex" 
                style={{
                  backgroundImage: 'linear-gradient(90deg, #FACC15 50%, transparent 50%)',
                  backgroundSize: '60px 100%',
                  animation: 'moveRoad 0.4s linear infinite',
                  animationPlayState: typingCarSpeed === 'hit' ? 'paused' : 'running'
                }}
              />
            </div>

            {typingCarSpeed === 'hit' && (
              <div className="absolute left-[8%] bottom-6 z-0 animate-in zoom-in-50">
                <svg width="140" height="30" viewBox="0 0 100 20">
                  <ellipse cx="50" cy="10" rx="40" ry="8" fill="#1E293B" />
                  <ellipse cx="50" cy="10" rx="35" ry="6" fill="#0F172A" />
                  <path d="M25,10 Q50,4 75,10" stroke="#334155" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            )}

            {typingCarSpeed === 'boost' && (
              <div className="absolute left-[-20px] bottom-10 z-0 animate-pulse flex items-center gap-1">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-cyan-400 rounded-full opacity-70" />
                <div className="w-16 h-1 bg-gradient-to-r from-transparent to-yellow-400 rounded-full opacity-60" />
              </div>
            )}

            <div 
              className="absolute left-[6%] bottom-6 w-44 h-24 z-10"
              style={{ animation: carAnimation }}
            >
              <svg viewBox="0 0 160 80" className="w-full h-full drop-shadow-lg">
                <g className={typingCarSpeed === 'hit' ? '' : 'animate-spin'} style={{ transformOrigin: '35px 65px', animationDuration: typingCarSpeed === 'boost' ? '0.15s' : '0.3s' }}>
                  <circle cx="35" cy="65" r="13" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  <circle cx="35" cy="65" r="6" fill="#94A3B8" />
                  <line x1="35" y1="52" x2="35" y2="78" stroke="#64748B" strokeWidth="2" />
                  <line x1="22" y1="65" x2="48" y2="65" stroke="#64748B" strokeWidth="2" />
                </g>
                <g className={typingCarSpeed === 'hit' ? '' : 'animate-spin'} style={{ transformOrigin: '125px 65px', animationDuration: typingCarSpeed === 'boost' ? '0.15s' : '0.3s' }}>
                  <circle cx="125" cy="65" r="13" fill="#0F172A" stroke="#475569" strokeWidth="2" />
                  <circle cx="125" cy="65" r="6" fill="#94A3B8" />
                  <line x1="125" y1="52" x2="125" y2="78" stroke="#64748B" strokeWidth="2" />
                  <line x1="112" y1="65" x2="138" y2="65" stroke="#64748B" strokeWidth="2" />
                </g>
                
                <path 
                  d="M12,54 L20,30 L55,22 L110,22 L140,36 L154,48 L154,60 L140,60 L132,54 L28,54 L20,60 L12,60 Z" 
                  fill={carColor} 
                />
                
                <path d="M140,60 L154,60 L154,54 Z" fill="#1E293B" />
                <rect x="142" y="44" width="8" height="4" rx="2" fill="#FDE047" />
                <rect x="10" y="46" width="6" height="4" rx="1" fill="#EF4444" />
                
                <path d="M22,34 L45,26 L65,34 Z" fill="#FFFFFF" opacity="0.3" />
                
                <path d="M58,26 L94,26 L108,36 L58,36 Z" fill="#E2E8F0" opacity="0.85" stroke="#475569" strokeWidth="1.5" />
                
                {typingCharacter === 'boy' ? (
                  <g transform="translate(66, 23)">
                    <circle cx="12" cy="11" r="9" fill="#1D4ED8" />
                    <path d="M12,3 C17,3 21,7 21,11 L12,11 Z" fill="#0F172A" />
                    <circle cx="13" cy="7" r="1.5" fill="#38BDF8" />
                  </g>
                ) : (
                  <g transform="translate(66, 23)">
                    <path d="M2,14 C-2,10 -2,4 4,6 C4,6 3,12 2,14" fill="#F59E0B" />
                    <circle cx="12" cy="11" r="9" fill="#DB2777" />
                    <path d="M12,3 C17,3 21,7 21,11 L12,11 Z" fill="#0F172A" />
                    <circle cx="13" cy="7" r="1.5" fill="#F472B6" />
                  </g>
                )}
              </svg>
            </div>

            {typingCarSpeed === 'boost' && (
              <div className="absolute left-[3%] bottom-[30px] z-10 animate-bounce">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2,12 C2,12 6,8 10,10 C14,12 18,6 22,12 C18,18 14,12 10,14 C6,16 2,12 2,12 Z" fill="#F59E0B" />
                  <path d="M6,12 C6,12 8,10 10,11 C12,12 14,9 16,12 C14,15 12,12 10,13 C8,14 6,12 6,12 Z" fill="#EF4444" />
                </svg>
              </div>
            )}

            {typingCarSpeed === 'hit' && (
              <div className="absolute left-[4%] bottom-[35px] z-20 flex flex-col gap-1 items-center animate-ping">
                <div className="w-6 h-6 bg-slate-400 rounded-full opacity-60 blur-sm" />
                <div className="w-8 h-8 bg-slate-500 rounded-full opacity-40 blur-md" />
              </div>
            )}

            {typingFeedbackList.map((f) => (
              <div 
                key={f.id}
                className="absolute left-[18%] bottom-[80px] z-30 font-black text-2xl drop-shadow-md select-none"
                style={{
                  animation: 'floatSticker 1.2s forwards ease-out',
                  color: f.type === 'correct' ? '#EAB308' : '#EF4444'
                }}
              >
                {f.amount > 0 ? `+${f.amount}` : f.amount}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-xl shadow-slate-100/50 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100">
              <div 
                className={`h-full transition-all duration-100 ${wordTimeLeft > 2 ? 'bg-teal-500' : 'bg-red-500'}`}
                style={{ width: `${(wordTimeLeft / 6) * 100}%` }}
              />
            </div>

            <div className="text-sm uppercase tracking-widest text-teal-600 font-bold mt-2">
              {t("games.hint_label")}
            </div>

            <div className="bg-slate-50 rounded-2xl py-4 px-6 inline-block border border-slate-100 text-lg font-bold text-slate-700 italic max-w-lg mx-auto">
              "{current.definition}"
            </div>

            {wordBonusType !== 'NORMAL' && (
              <div className="flex justify-center mb-2">
                {wordBonusType === 'X2' && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-md shadow-amber-100 flex items-center gap-1.5 animate-bounce">
                    ⚡ x2 BONUS (+200 STICKERS)
                  </span>
                )}
                {wordBonusType === 'X3' && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-md shadow-purple-100 flex items-center gap-1.5 animate-bounce">
                    🔥 x3 SUPER BONUS (+300 STICKERS)
                  </span>
                )}
                {wordBonusType === 'PLUS100' && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-md shadow-teal-100 flex items-center gap-1.5 animate-bounce">
                    💎 +100 EXTRA (+200 STICKERS)
                  </span>
                )}
                {wordBonusType === 'PLUS200' && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-green-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-md shadow-emerald-100 flex items-center gap-1.5 animate-bounce">
                    👑 +200 MEGA EXTRA (+300 STICKERS)
                  </span>
                )}
              </div>
            )}

            {typingScrambledWord && (
              <div className="flex justify-center gap-2 mb-2 flex-wrap">
                {typingScrambledWord.split('').map((char, idx) => (
                  <span key={idx} className="w-12 h-12 flex items-center justify-center bg-teal-50 border-2 border-teal-100 rounded-xl text-2xl font-black text-teal-700 shadow-sm uppercase select-none">
                    {char}
                  </span>
                ))}
              </div>
            )}

            {renderWordHighlight()}

            <div className="max-w-md mx-auto space-y-4">
              <input
                type="text"
                autoFocus
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (typingInput.trim()) {
                      handleTypingSubmit();
                    }
                  }
                }}
                className="w-full text-center text-3xl font-extrabold px-6 py-4 border-2 border-slate-200 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-50 outline-none transition-all tracking-wider font-mono uppercase"
                placeholder={t("games.input_placeholder")}
                disabled={typingState !== 'playing'}
              />

              <button
                onClick={() => {
                  if (typingInput.trim()) {
                    handleTypingSubmit();
                  }
                }}
                disabled={!typingInput.trim()}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-teal-100 disabled:opacity-50"
              >
                {t("games.verify_btn")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (typingState === "game_over") {
      const isPositive = typingScore >= 0;
      
      return (
        <div className="p-6 max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-200 animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-2">{t("games.typing_game_over")}</h2>
          <p className="text-gray-500 text-lg">{t("games.rewards_title")}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-xl mx-auto mb-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-2xl font-black text-slate-800">{typingCorrectCount}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("games.typing_correct_words")}</div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-2xl font-black text-slate-800">{typingWrongCount}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("games.typing_potholes")}</div>
            </div>

            <div className={`rounded-2xl p-6 border shadow-sm ${isPositive ? 'bg-yellow-50 border-yellow-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`text-2xl font-black ${isPositive ? 'text-yellow-600' : 'text-red-600'}`}>
                {isPositive ? `+${typingScore}` : '0'}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t("games.typing_net_change")}</div>
            </div>
          </div>

          {typingSubmitFeedback ? (
            <div className="bg-teal-50 border-2 border-teal-100 rounded-2xl p-6 max-w-md mx-auto mb-10 animate-in fade-in duration-300">
              <p className="text-teal-800 font-bold text-lg mb-2">Stickers Saved!</p>
              <div className="flex justify-center items-center gap-2 font-black text-teal-700 text-2xl">
                <StickerIcon className="w-8 h-8 text-yellow-500" />
                <span>{typingSubmitFeedback.stats?.totalStickers || 0} Total</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 italic mb-10">{t("common.loading")}</div>
          )}

          <div className="flex gap-4 max-w-md mx-auto">
            <button
              onClick={() => {
                setPlayingGame(null);
                setTypingState("select_char");
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all text-lg"
            >
              {t("games.back")}
            </button>
            <button
              onClick={() => startTypingGame()}
              className="flex-[2] py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-2xl transition-all shadow-lg text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const handleVerify = async () => {
    const isDaily = playingGame === "daily";
    const isSentence = playingGame === "sentence";
    const isTranslation = playingGame === "translation";
    
    let answer = userInput;
    if (isSentence) {
      answer = selectedWords.join(" ");
    }
    
    if (!answer) return;

    const endpoint = isDaily ? "/api/games/daily/verify" : isSentence ? "/api/games/sentence/verify" : isTranslation ? "/api/games/translation/verify" : "/api/games/scramble/verify";
    const body = isDaily ? { id: dailyStatus.id, answer } : isSentence ? { id: sentenceItems[currentIndex].id, answer } : isTranslation ? { id: translationItems[currentIndex].id, answer, type: translationItems[currentIndex].type } : { id: scrambleItems[currentIndex].id, answer };

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
                u.stickers = result.stats.totalStickers;
                localStorage.setItem("user", JSON.stringify(u));
                // Fire storage event for UI sync
                window.dispatchEvent(new Event('storage'));
            }
        }
        if (result.stats?.levelUp) {
            setShowLevelUp({ level: result.stats.currentLevel, xp: result.stats.totalXp });
        }
        
        let textToSpeak = answer;
        if (isTranslation && translationItems[currentIndex]?.type === 'EN_VN') {
            textToSpeak = translationItems[currentIndex].question;
        }
        
        if (result.success) {
          const proceedToNext = () => {
            if (isDaily) {
              setDailyStatus((prev: any) => ({ ...prev, completed: true }));
            } else {
              const currentList = isSentence ? sentenceItems : isTranslation ? translationItems : scrambleItems;
              if (currentIndex < currentList.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setUserInput("");
                setSelectedWords([]);
                setGameFeedback(null);
              } else {
                setLastPlayed(playingGame);
                toast.success(t("games.congrats"));
                setShowPlayAgain(true);
              }
            }
          };
          playSound(true, textToSpeak, 'en-US', proceedToNext);
        } else {
          playSound(false);
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
        toast.success("Match found!");
        setTimeout(() => {
          setMatchedPairs([...matchedPairs, firstCard.vocabId]);
          setFlippedCards([]);
          setIsProcessing(false);
          
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
                          u.stickers = result.stats.totalStickers;
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
              setLastPlayed(playingGame);
              toast.success(t("games.congrats"));
              setShowPlayAgain(true);
            }, 500);
          }
        }, 800);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const renderContent = () => {
    if (playingGame === "typing") {
      return renderTypingGame();
    }
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

        <div className="relative bg-white rounded-3xl border-2 border-blue-100 p-12 text-center shadow-xl shadow-blue-50/50">
          {gameFeedback && (
            <div className="absolute top-6 right-6 animate-in zoom-in-50 duration-300">
              {gameFeedback.success ? (
                <CheckCircle2 className="w-12 h-12 text-green-500 fill-green-50" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500 fill-red-50" />
              )}
            </div>
          )}
          <div className="text-sm uppercase tracking-widest text-[#1A73E8] font-bold mb-4">{t("games.scrambled_word")}</div>
          
          <div className="mb-8">
            <div className="text-4xl md:text-5xl font-black tracking-[0.1em] md:tracking-[0.2em] text-[#111827] select-none break-all">
              {current.scrambled.toUpperCase()}
            </div>
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
              <div className="text-yellow-600 font-black text-4xl mb-2">+{gameFeedback.rewards.stickers}</div>
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
            {gameFeedback && (
              <div className="absolute top-6 right-6 animate-in zoom-in-50 duration-300 z-20">
                {gameFeedback.success ? (
                  <CheckCircle2 className="w-12 h-12 text-green-500 fill-green-50" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500 fill-red-50" />
                )}
              </div>
            )}
            <div className="text-sm uppercase tracking-widest text-purple-500 font-bold mb-4">{t("games.scrambled_word")}</div>
            
            <div className="mb-8">
              <div className="text-4xl md:text-6xl font-black tracking-[0.1em] md:tracking-[0.2em] text-[#111827] select-none break-all">
                {dailyStatus.scrambled.toUpperCase()}
              </div>
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

        <div className="relative bg-white rounded-3xl border-2 border-orange-100 p-10 shadow-xl shadow-orange-50/50">
          {gameFeedback && (
            <div className="absolute top-6 right-6 animate-in zoom-in-50 duration-300">
              {gameFeedback.success ? (
                <CheckCircle2 className="w-12 h-12 text-green-500 fill-green-50" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500 fill-red-50" />
              )}
            </div>
          )}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t("games.sentence_title")}</h2>
            <div className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold uppercase tracking-widest">
              {current.hint}
            </div>
          </div>

          <div className="mb-8">
            <div className="min-h-[120px] p-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-wrap gap-2 items-center justify-center">
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

  if (playingGame === "translation" && translationItems.length > 0) {
    const current = translationItems[currentIndex];
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => setPlayingGame(null)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <X className="w-5 h-5" /> {t("games.back")}
          </button>
          <div className="text-sm font-bold text-gray-400">
            {currentIndex + 1} / {translationItems.length}
          </div>
        </div>

        <div className="relative bg-white rounded-3xl border-2 border-red-100 p-12 text-center shadow-xl shadow-red-50/50">
          {gameFeedback && (
            <div className="absolute top-6 right-6 animate-in zoom-in-50 duration-300">
              {gameFeedback.success ? (
                <CheckCircle2 className="w-12 h-12 text-green-500 fill-green-50" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500 fill-red-50" />
              )}
            </div>
          )}
          <div className="text-sm uppercase tracking-widest text-red-600 font-bold mb-6">
            {current.type === 'EN_VN' ? t("games.translate_to_vn") : t("games.translate_to_en")}
          </div>
          
          <div className="mb-10">
            <div className="text-4xl font-bold text-gray-900">{current.question}</div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              className="w-full text-center text-2xl font-bold px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
              placeholder={t("games.input_placeholder")}
            />
            <button
              onClick={handleVerify}
              disabled={!userInput.trim()}
              className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 disabled:opacity-50"
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
  // Modals moved to bottom

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
                    <StickerIcon className="w-5 h-5 text-yellow-500" />
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
              else if (game.key === 'translation') startTranslationMaster();
              else if (game.key === 'typing') startTypingGame();
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
                else if (game.key === 'translation') startTranslationMaster();
                else if (game.key === 'typing') startTypingGame();
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
                    Exchange your earned <span className="text-yellow-400 font-bold">EduStickers</span> for limited-edition avatars, gift cards, and exclusive real-world vouchers. 
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
                        <StickerIcon className="w-10 h-10 text-yellow-400" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Currency</span>
                 </div>
            </div>
        </div>
      </div>

      
    </div>
  );
  };

  return (
    <>
      {renderContent()}
      
      {showPlayAgain && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Play Again?</h2>
            <p className="text-gray-500 mb-8">Do you want to play another round?</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowPlayAgain(false);
                  setPlayingGame(null);
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowPlayAgain(false);
                  if (lastPlayed === 'scramble') startScramble();
                  else if (lastPlayed === 'sentence') startSentenceMaster();
                  else if (lastPlayed === 'memory') startMemoryMatch();
                  else if (lastPlayed === 'translation') startTranslationMaster();
                  else if (lastPlayed === 'typing') startTypingGame();
                }}
                className="flex-[2] py-3 bg-[#1A73E8] text-white font-bold rounded-xl hover:bg-[#1557B0] transition-all shadow-lg"
              >
                Yes, let's play!
              </button>
            </div>
          </div>
        </div>
      )}

      {showLevelUp && (
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
      )}
    </>
  );
}
