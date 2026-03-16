import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, MessageCircle, Send, Key, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";

async function fetchSettings(): Promise<Record<string, string>> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/api/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function saveSettings(data: Record<string, string>): Promise<void> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const token = localStorage.getItem("admin_token") || "";
  const res = await fetch(`${base}/api/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save settings");
}

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminSettings() {
  usePageTitle("الإعدادات");
  const { toast } = useToast();

  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setWhatsapp(s.whatsapp || "");
        setTelegram(s.telegram || "");
        setApiKey(s.bot_api_key || "");
      })
      .catch(() => toast({ title: "فشل تحميل الإعدادات", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      await saveSettings({ whatsapp: whatsapp.trim(), telegram: telegram.trim() });
      toast({ title: "تم حفظ معلومات التواصل" });
    } catch {
      toast({ title: "فشل الحفظ", variant: "destructive" });
    } finally {
      setSavingContact(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      await saveSettings({ bot_api_key: apiKey.trim() });
      toast({ title: "تم حفظ مفتاح API" });
    } catch {
      toast({ title: "فشل حفظ المفتاح", variant: "destructive" });
    } finally {
      setSavingKey(false);
    }
  };

  const handleGenerate = () => {
    setApiKey(generateKey());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const base = typeof window !== "undefined"
    ? window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "")
    : "";

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto space-y-6">

        {/* ─── Bot API Key ─── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">مفتاح API للبوت</h2>
          </div>
          <p className="text-xs text-gray-500">البوت يستخدم هذا المفتاح للوصول إلى بيانات الملازم. لا تشاركه مع أحد.</p>

          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Key Input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="اضغط «توليد» لإنشاء مفتاح جديد"
                    dir="ltr"
                    className="flex-1 px-3 py-3 text-sm outline-none bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="px-3 py-3 text-gray-400 hover:text-gray-700 border-r border-gray-200 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!apiKey}
                  title="نسخ المفتاح"
                  className="p-3 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> توليد مفتاح جديد
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={savingKey || !apiKey.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all disabled:opacity-60 text-sm"
                >
                  {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingKey ? "جاري الحفظ..." : "حفظ المفتاح"}
                </button>
              </div>

              {/* API Docs */}
              {apiKey && (
                <div className="bg-gray-900 rounded-xl p-4 text-xs font-mono text-gray-300 space-y-3 select-all" dir="ltr">
                  <p className="text-green-400 font-bold text-sm mb-2"># تعليمات الاستخدام</p>

                  <div>
                    <p className="text-yellow-400 mb-1">## كل الملازم</p>
                    <p className="text-white break-all">GET {base}/api/bot/notes</p>
                  </div>

                  <div>
                    <p className="text-yellow-400 mb-1">## ملزمة واحدة</p>
                    <p className="text-white break-all">GET {base}/api/bot/notes/<span className="text-blue-400">&#123;id&#125;</span></p>
                  </div>

                  <div>
                    <p className="text-yellow-400 mb-1">## المصادقة (Header مطلوب)</p>
                    <p className="text-white">X-API-Key: <span className="text-green-300">{showKey ? apiKey : "••••••••••••••••"}</span></p>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-yellow-400 mb-1">## مثال curl</p>
                    <p className="text-white break-all">curl -H "X-API-Key: {showKey ? apiKey : "YOUR_KEY"}" \</p>
                    <p className="text-white break-all pl-4">{base}/api/bot/notes</p>
                  </div>

                  <div className="border-t border-gray-700 pt-3">
                    <p className="text-yellow-400 mb-1">## الحقول المُرجَعة لكل ملزمة</p>
                    <p className="text-gray-400">id, title, category, version,</p>
                    <p className="text-gray-400">teacherName, price, pageCount,</p>
                    <p className="text-gray-400">coverImageUrl, pdfUrl,</p>
                    <p className="text-gray-400">averageRating, ratingCount,</p>
                    <p className="text-gray-400">createdAt, updatedAt</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Contact Settings ─── */}
        <form onSubmit={handleSaveContact} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
          <h2 className="text-lg font-bold text-gray-800">معلومات التواصل للشراء</h2>

          {loading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" /> رقم واتساب
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+9647766699669"
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Send className="w-4 h-4 text-[#2AABEE]" /> رابط تيليكرام
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/username"
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={savingContact}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
              >
                {savingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingContact ? "جاري الحفظ..." : "حفظ معلومات التواصل"}
              </button>
            </>
          )}
        </form>

      </div>
    </AdminLayout>
  );
}
