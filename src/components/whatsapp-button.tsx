import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/27110000000?text=Hi%20Auren%2C%20I%27d%20like%20assistance"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] text-white pl-3 pr-4 py-3 shadow-luxe hover:scale-105 transition"
      aria-label="WhatsApp support"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="text-sm font-medium hidden sm:inline">WhatsApp</span>
    </a>
  );
}
