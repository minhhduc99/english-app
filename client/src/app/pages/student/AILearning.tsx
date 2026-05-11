import { useNavigate } from "react-router";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Ear, PenTool } from "lucide-react";

export function AILearning() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="h-full bg-slate-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-500" />
            {t("ai_learning.title")}
          </h1>
          <p className="text-lg text-slate-600">
            {t("ai_learning.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Speaking Module */}
          <div 
            onClick={() => navigate("/ai-learning/speaking")}
            className="group cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Ear className="w-32 h-32" />
            </div>
            
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Ear className="w-12 h-12 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
              {t("ai_learning.speaking")}
            </h2>
            <p className="text-slate-600 mb-6">
              {t("ai_learning.speaking_desc")}
            </p>
            
            <button className="mt-auto px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl opacity-90 group-hover:opacity-100 transition-opacity">
              {t("ai_learning.start")}
            </button>
          </div>

          {/* Writing Module */}
          <div 
            onClick={() => navigate("/ai-learning/writing")}
            className="group cursor-pointer bg-white rounded-3xl p-8 border-2 border-transparent hover:border-purple-500 shadow-sm hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className="absolute top-0 left-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <PenTool className="w-32 h-32" />
            </div>
            
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <PenTool className="w-12 h-12 text-purple-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors">
              {t("ai_learning.writing")}
            </h2>
            <p className="text-slate-600 mb-6">
              {t("ai_learning.writing_desc")}
            </p>
            
            <button className="mt-auto px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl opacity-90 group-hover:opacity-100 transition-opacity">
              {t("ai_learning.start")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
