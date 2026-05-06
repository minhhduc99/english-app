import { Mic, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const targetWords = [
  { word: "Hello", pronounced: true },
  { word: "Family", pronounced: false },
  { word: "Friend", pronounced: false },
  { word: "School", pronounced: false },
  { word: "Teacher", pronounced: false },
  { word: "Student", pronounced: false },
];

interface ChatMessage {
  sender: "user" | "ai";
  message: string;
  time: string;
}

export function AISpeaking() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: "ai",
      message: "Hello! I'm your AI speaking coach. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add user message to UI immediately
    const updatedHistory = [
      ...chatHistory,
      { sender: "user" as const, message: userMessage, time: currentTime }
    ];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      // 2. Format history for the AI service
      const apiHistory = updatedHistory.slice(0, -1).map(msg => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.message
      }));

      // 3. Send request to Core Service which proxies to AI Service
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ai-chat/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          history: apiHistory,
          language: language === "en" ? "en" : "vi"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
      // 4. Add AI response to UI
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          message: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          message: t("Sorry, I am having trouble connecting right now. Please try again later."),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#F8FBFF]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full">
        {/* AI Character Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 md:p-6 shadow-sm z-10">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-md">
              AI
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">{t("AI Speaking Coach")}</h2>
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#22C55E] font-medium">
                <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
                {t("Ready to help")}
              </div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] ${
                    chat.sender === "user"
                      ? "bg-gradient-to-r from-[#1A73E8] to-[#2563EB] text-white rounded-br-none"
                      : "bg-white border border-[#E5E7EB] text-[#111827] shadow-sm rounded-bl-none"
                  } rounded-2xl px-5 py-3.5`}
                >
                  <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{chat.message}</div>
                  <div
                    className={`text-[11px] mt-1.5 ${
                      chat.sender === "user" ? "text-blue-100" : "text-[#9CA3AF]"
                    } flex justify-end font-medium`}
                  >
                    {chat.time}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex gap-2 items-center">
                  <div className="w-2 h-2 bg-[#1A73E8] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#1A73E8] rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-[#1A73E8] rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white border-t border-[#E5E7EB] p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-4">
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("Type your message here...")}
                className="w-full bg-[#F3F4F6] border border-transparent focus:border-[#1A73E8] focus:bg-white focus:ring-2 focus:ring-[#1A73E8]/20 rounded-full px-5 py-3 md:py-3.5 text-[15px] outline-none transition-all pr-12"
                disabled={isLoading}
              />
            </div>
            
            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading
                  ? "bg-[#1A73E8] hover:bg-[#1557B0] hover:scale-105 shadow-md"
                  : "bg-[#E5E7EB] text-[#9CA3AF]"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-white animate-spin" />
              ) : (
                <Send className={`w-5 h-5 md:w-6 md:h-6 ${inputText.trim() ? "text-white" : "text-[#9CA3AF]"}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target Words Panel (Sidebar) */}
      <div className="w-full md:w-80 bg-white border-t md:border-l border-[#E5E7EB] p-6 overflow-y-auto hidden lg:block">
        <h3 className="font-semibold text-[#111827] mb-1">{t("Target Words")}</h3>
        <p className="text-sm text-[#6B7280] mb-6">{t("Practice these vocabulary words")}</p>

        <div className="space-y-2">
          {targetWords.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all ${
                item.pronounced
                  ? "bg-[#DCFCE7] border-[#22C55E]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-medium ${
                    item.pronounced ? "text-[#166534]" : "text-[#111827]"
                  }`}
                >
                  {item.word}
                </span>
                {item.pronounced && (
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-[#F8FBFF] rounded-xl">
          <div className="text-sm text-[#6B7280] mb-2">{t("Session Progress")}</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-[#1A73E8]">1/6</span>
            <span className="text-sm text-[#6B7280]">{t("words completed")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
