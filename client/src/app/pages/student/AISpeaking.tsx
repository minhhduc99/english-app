import { Mic, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

const targetWords = [
  { word: "Hello", pronounced: true },
  { word: "Family", pronounced: true },
  { word: "Friend", pronounced: true },
  { word: "School", pronounced: false },
  { word: "Teacher", pronounced: false },
  { word: "Student", pronounced: false },
];

const chatHistory = [
  {
    sender: "ai",
    message: "Hello! I'm your AI speaking coach. Today we'll practice family and school vocabulary. Are you ready?",
    time: "10:30 AM"
  },
  {
    sender: "user",
    message: "Yes, I'm ready!",
    time: "10:31 AM"
  },
  {
    sender: "ai",
    message: "Great! Let's start with the word 'Hello'. Try to say it clearly.",
    time: "10:31 AM"
  },
  {
    sender: "user",
    message: "Hello",
    time: "10:31 AM"
  },
  {
    sender: "ai",
    message: "Excellent pronunciation! ✨ Now let's try 'Family'.",
    time: "10:32 AM"
  },
];

export function AISpeaking() {
  const [isRecording, setIsRecording] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8FBFF]">
        {/* AI Character Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-6">
          <div className="flex items-center gap-4 max-w-4xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] flex items-center justify-center text-white text-2xl font-bold">
              AI
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#111827]">{t("AI Speaking Coach")}</h2>
              <div className="flex items-center gap-2 text-sm text-[#22C55E]">
                <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
                {t("Ready to help")}
              </div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md ${
                    chat.sender === "user"
                      ? "bg-[#1A73E8] text-white"
                      : "bg-white border border-[#E5E7EB] text-[#111827]"
                  } rounded-2xl px-5 py-3 shadow-sm`}
                >
                  <div className="text-base">{t(chat.message)}</div>
                  <div
                    className={`text-xs mt-1 ${
                      chat.sender === "user" ? "text-blue-200" : "text-[#9CA3AF]"
                    }`}
                  >
                    {chat.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="bg-white border-t border-[#E5E7EB] p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {/* Microphone Button */}
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? "bg-[#EF4444] hover:bg-[#DC2626] animate-pulse"
                    : "bg-[#1A73E8] hover:bg-[#1557B0]"
                } shadow-lg`}
              >
                <Mic className="w-7 h-7 text-white" />
              </button>

              {/* Waveform Effect */}
              {isRecording && (
                <div className="flex items-center gap-1 flex-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#1A73E8] rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 20}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {!isRecording && (
                <div className="flex-1 text-[#6B7280]">
                  {t("Press the microphone to start speaking")}
                </div>
              )}

              {/* Send Button */}
              <button className="w-12 h-12 rounded-full bg-[#F8F9FA] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors">
                <Send className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="mt-4 text-center text-sm text-[#EF4444] font-medium">
                🔴 {t("Recording... Say the target word clearly")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Words Panel */}
      <div className="w-80 bg-white border-l border-[#E5E7EB] p-6 overflow-y-auto">
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
            <span className="text-2xl font-bold text-[#1A73E8]">3/6</span>
            <span className="text-sm text-[#6B7280]">{t("words completed")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
