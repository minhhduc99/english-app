import { useEffect, useState } from "react";
import { Sticker } from "lucide-react";

export function StickerIcon({ className }: { className?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    
    fetch("/api/settings/SYSTEM_STICKER_IMAGE", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data && data.value) setImageUrl(data.value);
      })
      .catch((e) => console.error("Failed to load sticker image", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Sticker className={className || "w-5 h-5"} />;

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Sticker"
      className={`object-cover rounded-full overflow-hidden shadow-sm ${className || "w-5 h-5"}`}
    />
  ) : (
    <Sticker className={className || "w-5 h-5"} />
  );
}
