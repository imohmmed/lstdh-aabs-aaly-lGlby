import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { useToast } from "@/hooks/use-toast";
import { Save, Loader2, MessageCircle, Send } from "lucide-react";

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

export default function AdminSettings() {
  usePageTitle("الإعدادات");
  const { toast } = useToast();
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setWhatsapp(s.whatsapp || "");
        setTelegram(s.telegram || "");
      })
      .catch(() => toast({ title: "فشل تحميل الإعدادات", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({ whatsapp: whatsapp.trim(), telegram: telegram.trim() });
      toast({ title: "تم حفظ الإعدادات بنجاح" });
    } catch {
      toast({ title: "فشل حفظ الإعدادات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">إعدادات التواصل للشراء</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
            {/* WhatsApp */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                رقم واتساب
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-l border-gray-300 select-none">
                  wa.me/
                </span>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+9647766699669"
                  dir="ltr"
                  className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">اكتب الرقم مع رمز الدولة، مثال: +9647766699669</p>
            </div>

            {/* Telegram */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Send className="w-4 h-4 text-[#2AABEE]" />
                رابط تيليكرام
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="https://t.me/username"
                dir="ltr"
                className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">يمكن كتابة الرابط الكامل أو اسم المستخدم فقط مثل @username</p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-3">معاينة الأزرار</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-[#25D366] text-white font-bold py-3 px-4 rounded-xl text-sm">
                  <MessageCircle className="w-5 h-5" /> واتساب
                </div>
                <div className="flex items-center gap-3 bg-[#2AABEE] text-white font-bold py-3 px-4 rounded-xl text-sm">
                  <Send className="w-5 h-5" /> تيليكرام
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
