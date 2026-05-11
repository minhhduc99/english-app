import { Send, Loader2, ArrowLeft, PenTool } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNavigate } from "react-router";

const AI_FRIENDS = [
  { id: 'emma', name: 'Emma', role: 'Friendly Tutor', emoji: '👩🏼', color: 'from-pink-500 to-rose-400' },
  { id: 'alex', name: 'Alex', role: 'Strict Teacher', emoji: '👨🏻‍🏫', color: 'from-blue-600 to-indigo-700' },
  { id: 'mia', name: 'Mia', role: 'Casual Buddy', emoji: '👧🏻', color: 'from-amber-400 to-orange-500' }
];

interface ChatMessage {
  sender: "user" | "ai";
  message: string;
  time: string;
}

const renderMessage = (text: string) => {
  const parts = text.split(/(\*\*[\s\S]*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

export function WritingPractice() {
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedHistory = [
      ...chatHistory,
      { sender: "user" as const, message: userMessage, time: currentTime }
    ];
    setChatHistory(updatedHistory);
    setIsLoading(true);

    try {
      const apiHistory = updatedHistory.slice(0, -1).map(msg => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.message
      }));

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
          language: language === "en" ? "en" : "vi",
          persona: `${selectedFriend.name} - ${selectedFriend.role}`,
          module: "writing"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();
      
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedFriend) {
    return (
      <div className="h-full bg-[#F8FBFF] p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/ai-learning')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t("ai_learning.choose_friend")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {AI_FRIENDS.map(friend => (
              <div 
                key={friend.id}
                onClick={() => {
                  setSelectedFriend(friend);
                  setChatHistory([{
                    sender: "ai",
                    message: `Hi! I'm ${friend.name}, your ${friend.role}. Send me a paragraph or an essay, and I will help you correct your writing!`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                }}
                className="bg-white rounded-3xl p-8 cursor-pointer border-2 border-transparent hover:border-purple-500 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center group"
              >
                <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${friend.color} flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-md`}>
                  {friend.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{friend.name}</h3>
                <p className="text-gray-500 mt-2 font-medium">{friend.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8FBFF]">
      {/* AI Character Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4 md:p-6 shadow-sm z-10">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${selectedFriend.color} flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-md`}>
            {selectedFriend.emoji}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-[#111827]">{selectedFriend.name} - {selectedFriend.role}</h2>
            <div className="flex items-center gap-2 text-xs md:text-sm text-[#8B5CF6] font-medium">
              <PenTool className="w-4 h-4" />
              Writing Coach
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
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white rounded-br-none"
                    : "bg-white border border-[#E5E7EB] text-[#111827] shadow-sm rounded-bl-none"
                } rounded-2xl px-5 py-3.5`}
              >
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap">{renderMessage(chat.message)}</div>
                <div
                  className={`text-[11px] mt-1.5 ${
                    chat.sender === "user" ? "text-purple-100" : "text-[#9CA3AF]"
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
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Controls */}
      <div className="bg-white border-t border-[#E5E7EB] p-4 md:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-end gap-3 md:gap-4">
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your writing here... (Shift+Enter for new line)"
              className="w-full bg-[#F3F4F6] border border-transparent focus:border-[#8B5CF6] focus:bg-white focus:ring-2 focus:ring-[#8B5CF6]/20 rounded-2xl px-5 py-3.5 text-[15px] outline-none transition-all resize-none min-h-[80px] max-h-[200px]"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center transition-all ${
              inputText.trim() && !isLoading
                ? "bg-[#8B5CF6] hover:bg-[#6D28D9] hover:scale-105 shadow-md"
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
  );
}
