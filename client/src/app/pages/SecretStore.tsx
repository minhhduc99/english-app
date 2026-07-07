import { Trophy, Star, Package, Sparkles, Gift, LayoutGrid, Clock } from "lucide-react";
import { StickerIcon } from "../components/StickerIcon";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export function SecretStore() {
  const { t } = useLanguage();

  const items = [
    {
      id: 1,
      name: "Legendary Fire Dragon Avatar",
      type: "AVATAR",
      price: 2500,
      image: "🔥",
       rarity: "LEGENDARY",
      description: "Show off your fire learning spirit with this limited edition avatar."
    },
    {
      id: 2,
      name: "7-Day XP Multiplier (2x)",
      type: "BOOST",
      price: 1200,
      image: "⚡",
      rarity: "EPIC",
      description: "Double your XP for an entire week and level up faster than ever!"
    },
    {
      id: 3,
      name: "$5 Highlands Coffee Voucher",
      type: "REAL_WORLD",
      price: 15000,
      image: "☕",
      rarity: "RARE",
      description: "Enjoy a physical reward for your hard work. Valid at all locations."
    },
    {
      id: 4,
      name: "Mystery Reward Box",
      type: "MYSTERY",
      price: 800,
      image: "🎁",
      rarity: "UNCOMMON",
      description: "Take a chance! Could contain XP boosts, stickers, or rare avatars."
    }
  ];

  return (
    <div className="p-6 space-y-12 animate-in fade-in duration-700">
      {/* Premium Header */}
      <div className="relative h-64 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-[#111827] shadow-2xl flex items-center px-12 border border-white/10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent animate-pulse" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full">
            <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">Secret Store</span>
                    <span className="flex items-center gap-1 text-purple-300 text-xs font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">
                        <Clock className="w-3 h-3" /> Ends in 12 days
                    </span>
                </div>
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter italic">MYSTERY MARKET</h1>
                <p className="text-purple-200 font-medium">Exclusive rewards for our top learners</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/20 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                    <StickerIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-500/70">Your EduStickers Balance</span>
                </div>
            </div>
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.id} className="group bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            {/* Rarity Tag */}
             <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                    item.rarity === 'LEGENDARY' ? 'bg-orange-100 text-orange-600' :
                    item.rarity === 'EPIC' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                }`}>
                    {item.rarity}
                </span>
             </div>

             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto group-hover:scale-125 transition-transform duration-500 shadow-inner">
                {item.image}
             </div>

             <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{item.name}</h3>
             <p className="text-gray-500 text-sm mb-8 text-center leading-relaxed h-12 overflow-hidden">
                {item.description}
             </p>

             <button 
                onClick={() => toast.success(`You purchased ${item.name}!`)}
                className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black flex items-center justify-center gap-3 group-hover:bg-black transition-colors"
             >
                <StickerIcon className="w-5 h-5 text-yellow-400" />
                {item.price}
             </button>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50/50 rounded-[3rem] p-12 text-center border-2 border-dashed border-blue-100">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">How to earn more EduStickers?</h2>
          <div className="flex flex-wrap justify-center gap-10">
              <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-blue-600">Daily</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Secret Challenges</div>
              </div>
              <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-blue-600">20+</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Games per week</div>
              </div>
              <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-blue-600">Streak</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">7-Day Multiplier</div>
              </div>
          </div>
      </div>
    </div>
  );
}
