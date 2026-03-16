import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Loader2, MessageCircle, Send, Key, Eye, EyeOff,
  RefreshCw, Copy, Check, BookOpen, Filter, AlertCircle,
  Terminal, FileJson, Shield, Zap
} from "lucide-react";

async function fetchSettings(): Promise<Record<string, string>> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/api/settings`);
  if (!res.ok) throw new Error();
  return res.json();
}

async function patchSettings(data: Record<string, string>): Promise<void> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const token = localStorage.getItem("admin_token") || "";
  const res = await fetch(`${base}/api/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error();
}

function generateKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 48 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function CopyBtn({ text, className = "" }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      title="نسخ"
      className={`p-1.5 rounded-lg transition-colors ${done ? "text-green-500" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"} ${className}`}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "green" | "blue" | "orange" | "gray" | "red" }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold font-mono ${colors[color]}`}>
      {children}
    </span>
  );
}

function CodeBlock({ children, copyText }: { children: React.ReactNode; copyText?: string }) {
  return (
    <div className="relative group bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
      {copyText && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyBtn text={copyText} className="bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700" />
        </div>
      )}
      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed" dir="ltr">
        {children}
      </pre>
    </div>
  );
}

export default function AdminSettings() {
  usePageTitle("الإعدادات");
  const { toast } = useToast();

  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://swagy.world";

  useEffect(() => {
    fetchSettings()
      .then((s) => { setWhatsapp(s.whatsapp || ""); setTelegram(s.telegram || ""); setApiKey(s.bot_api_key || ""); })
      .catch(() => toast({ title: "فشل تحميل الإعدادات", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try { await patchSettings({ whatsapp: whatsapp.trim(), telegram: telegram.trim() }); toast({ title: "✓ تم حفظ معلومات التواصل" }); }
    catch { toast({ title: "فشل الحفظ", variant: "destructive" }); }
    finally { setSavingContact(false); }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try { await patchSettings({ bot_api_key: apiKey.trim() }); toast({ title: "✓ تم حفظ مفتاح API" }); }
    catch { toast({ title: "فشل الحفظ", variant: "destructive" }); }
    finally { setSavingKey(false); }
  };

  const maskedKey = apiKey ? (showKey ? apiKey : apiKey.slice(0, 4) + "••••••••••••••••••••••••" + apiKey.slice(-4)) : "";

  const curlAll = `curl -X GET "${baseUrl}/api/bot/notes" \\\n  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}"`;
  const curlOne = `curl -X GET "${baseUrl}/api/bot/notes/1" \\\n  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}"`;
  const curlFilter = `curl -X GET "${baseUrl}/api/bot/notes?category=سادس&hasFile=true" \\\n  -H "X-API-Key: ${apiKey || "YOUR_API_KEY"}"`;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6" dir="rtl">

        {/* ══════════════════════════════════════════
            قسم ١: إدارة مفتاح API
        ══════════════════════════════════════════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">مفتاح API للبوت</h2>
              <p className="text-xs text-gray-500">البوت يستخدم هذا المفتاح للوصول إلى بيانات الملازم</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all bg-white">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="اضغط «توليد» لإنشاء مفتاح جديد"
                      dir="ltr"
                      className="flex-1 px-4 py-3 text-sm outline-none font-mono"
                    />
                    <button onClick={() => setShowKey(!showKey)} className="px-3 text-gray-400 hover:text-gray-700 border-r border-gray-200 py-3 transition-colors">
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(apiKey).then(() => { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }); }}
                    disabled={!apiKey}
                    className="p-3 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setApiKey(generateKey())} className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <RefreshCw className="w-4 h-4" /> توليد مفتاح جديد
                  </button>
                  <button onClick={handleSaveKey} disabled={savingKey || !apiKey.trim()} className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-60 text-sm">
                    {savingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingKey ? "جاري الحفظ..." : "حفظ المفتاح"}
                  </button>
                </div>

                {!apiKey && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700">لم يتم تعيين مفتاح بعد. اضغط «توليد» ثم «حفظ» لتفعيل الـ API.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            قسم ٢: توثيق API الكامل
        ══════════════════════════════════════════ */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">توثيق API البوت</h2>
              <p className="text-xs text-gray-500">شرح كامل لكيفية استخدام API مع البوت</p>
            </div>
          </div>

          <div className="p-6 space-y-8">

            {/* ── نظرة عامة ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-gray-700">نظرة عامة</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                API البوت يتيح لك استرجاع بيانات الملازم من قاعدة البيانات مباشرةً، ويمكن استخدامه مع بوت تيليكرام أو أي تطبيق آخر. جميع الطلبات تحتاج مفتاح API في الـ Header.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"><Shield className="w-3 h-3" /> محمي بمفتاح API</span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"><FileJson className="w-3 h-3" /> الردود بصيغة JSON</span>
                <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"><Filter className="w-3 h-3" /> يدعم الفلترة</span>
              </div>
            </section>

            {/* ── المصادقة ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-gray-700">المصادقة (Authentication)</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                أضف المفتاح في كل طلب داخل الـ Header باسم <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">X-API-Key</code>:
              </p>
              <CodeBlock copyText={`X-API-Key: ${apiKey || "YOUR_API_KEY"}`}>
                <span className="text-gray-500">Header:</span>{"\n"}
                <span className="text-yellow-300">X-API-Key</span>: <span className="text-green-300">{maskedKey || "YOUR_API_KEY"}</span>
              </CodeBlock>
              <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
                ⚠️ لا تشارك المفتاح مع أحد — من يملكه يستطيع قراءة جميع بيانات الملازم.
              </div>
            </section>

            {/* ── الـ Endpoints ── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-gray-700">الـ Endpoints</h3>
              </div>

              {/* Endpoint 1 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <Badge color="green">GET</Badge>
                  <code className="text-sm font-mono text-gray-800 break-all">/api/bot/notes</code>
                  <span className="text-xs text-gray-500 mr-auto">جلب كل الملازم</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600">يُرجع قائمة بجميع الملازم مع إمكانية الفلترة.</p>
                  <CodeBlock copyText={curlAll}>
                    <span className="text-gray-500"># جلب كل الملازم</span>{"\n"}
                    <span className="text-blue-300">curl</span> -X GET <span className="text-green-300">"{baseUrl}/api/bot/notes"</span> \{"\n"}
                    {"  "}<span className="text-yellow-300">-H</span> <span className="text-green-300">"X-API-Key: {maskedKey || "YOUR_API_KEY"}"</span>
                  </CodeBlock>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <Badge color="green">GET</Badge>
                  <code className="text-sm font-mono text-gray-800 break-all">/api/bot/notes/<span className="text-blue-600">&#123;id&#125;</span></code>
                  <span className="text-xs text-gray-500 mr-auto">جلب ملزمة واحدة</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600">يُرجع بيانات ملزمة واحدة بواسطة رقمها <code className="bg-gray-100 px-1 rounded text-xs">id</code>.</p>
                  <CodeBlock copyText={curlOne}>
                    <span className="text-gray-500"># جلب ملزمة رقم 1</span>{"\n"}
                    <span className="text-blue-300">curl</span> -X GET <span className="text-green-300">"{baseUrl}/api/bot/notes/1"</span> \{"\n"}
                    {"  "}<span className="text-yellow-300">-H</span> <span className="text-green-300">"X-API-Key: {maskedKey || "YOUR_API_KEY"}"</span>
                  </CodeBlock>
                </div>
              </div>
            </section>

            {/* ── الفلاتر ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-gray-700">الفلاتر (Query Parameters)</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                يمكنك إضافة فلاتر اختيارية بعد رابط <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/api/bot/notes</code> لتصفية النتائج. تدعم الفلاتر البحث الجزئي (لا يشترط تطابق كامل).
              </p>

              <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                <table className="w-full text-sm" dir="rtl">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">الفلتر</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">النوع</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">الوصف</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">مثال</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { param: "category", type: "نص", desc: "فلترة باسم القسم (جزئي)", example: "?category=سادس" },
                      { param: "categoryId", type: "رقم", desc: "فلترة برقم القسم (دقيق)", example: "?categoryId=1" },
                      { param: "teacher", type: "نص", desc: "فلترة باسم الأستاذ (جزئي)", example: "?teacher=عباس" },
                      { param: "search", type: "نص", desc: "بحث في عنوان الملزمة", example: "?search=انكليزي" },
                      { param: "hasFile", type: "true/false", desc: "فقط الملازم التي تملك PDF", example: "?hasFile=true" },
                    ].map((f) => (
                      <tr key={f.param} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5"><code className="text-xs font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{f.param}</code></td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{f.type}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-700">{f.desc}</td>
                        <td className="px-4 py-2.5"><code className="text-xs font-mono text-gray-600">{f.example}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mb-2">مثال — فلاتر مجمّعة (يمكن دمج أكثر من فلتر):</p>
              <CodeBlock copyText={curlFilter}>
                <span className="text-gray-500"># ملازم قسم "سادس" ولديها PDF</span>{"\n"}
                <span className="text-blue-300">curl</span> -X GET \{"\n"}
                {"  "}<span className="text-green-300">"{baseUrl}/api/bot/notes?category=سادس&hasFile=true"</span> \{"\n"}
                {"  "}<span className="text-yellow-300">-H</span> <span className="text-green-300">"X-API-Key: {maskedKey || "YOUR_API_KEY"}"</span>
              </CodeBlock>
            </section>

            {/* ── الحقول المُرجَعة ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileJson className="w-4 h-4 text-green-600" />
                <h3 className="font-bold text-gray-700">الحقول المُرجَعة (Response)</h3>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                <table className="w-full text-sm" dir="rtl">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">الحقل</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">النوع</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500">الوصف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { field: "id", type: "number", desc: "الرقم التعريفي للملزمة" },
                      { field: "title", type: "string", desc: "اسم الملزمة" },
                      { field: "category", type: "string | null", desc: "اسم القسم (مثال: سادس ابتدائي)" },
                      { field: "version", type: "string | null", desc: "الإصدار أو سنة الطبع" },
                      { field: "teacherName", type: "string | null", desc: "اسم الأستاذ المُعِد" },
                      { field: "price", type: "string | null", desc: "سعر الملزمة بالدينار العراقي" },
                      { field: "pageCount", type: "number | null", desc: "عدد صفحات PDF" },
                      { field: "fileSize", type: "string | null", desc: "حجم الملف (مثال: 2.1 MB)" },
                      { field: "coverImageUrl", type: "string | null", desc: "رابط كامل لصورة الغلاف" },
                      { field: "pdfUrl", type: "string | null", desc: "رابط كامل لملف PDF (قابل للتحميل مباشرة)" },
                      { field: "averageRating", type: "string | null", desc: "متوسط التقييم من 5" },
                      { field: "ratingCount", type: "number", desc: "عدد التقييمات" },
                      { field: "createdAt", type: "string (ISO)", desc: "تاريخ إضافة الملزمة" },
                      { field: "updatedAt", type: "string (ISO)", desc: "تاريخ آخر تعديل" },
                    ].map((f) => (
                      <tr key={f.field} className="hover:bg-gray-50">
                        <td className="px-4 py-2"><code className="text-xs font-mono text-green-700 bg-green-50 px-1.5 py-0.5 rounded">{f.field}</code></td>
                        <td className="px-4 py-2 text-xs text-gray-400 font-mono">{f.type}</td>
                        <td className="px-4 py-2 text-xs text-gray-700">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mb-2">مثال على الرد:</p>
              <CodeBlock>
                <span className="text-gray-500">{"["}</span>{"\n"}
                {"  "}<span className="text-gray-500">{"{"}</span>{"\n"}
                {"    "}<span className="text-yellow-300">"id"</span>: <span className="text-blue-300">1</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"title"</span>: <span className="text-green-300">"ملزمة انكليزي"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"category"</span>: <span className="text-green-300">"سادس ابتدائي"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"version"</span>: <span className="text-green-300">"2026"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"teacherName"</span>: <span className="text-green-300">"الأستاذ عباس علي الغالبي"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"price"</span>: <span className="text-green-300">"5000"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"pageCount"</span>: <span className="text-blue-300">57</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"coverImageUrl"</span>: <span className="text-green-300">"{baseUrl}/api/uploads/abc.webp"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"pdfUrl"</span>: <span className="text-green-300">"{baseUrl}/api/uploads/abc.pdf"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"averageRating"</span>: <span className="text-green-300">"4.5"</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"ratingCount"</span>: <span className="text-blue-300">12</span>,{"\n"}
                {"    "}<span className="text-yellow-300">"createdAt"</span>: <span className="text-green-300">"2026-03-15T05:10:22.660Z"</span>{"\n"}
                {"  "}<span className="text-gray-500">{"}"}</span>{"\n"}
                <span className="text-gray-500">{"]"}</span>
              </CodeBlock>
            </section>

            {/* ── أكواد الأخطاء ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-gray-700">أكواد الأخطاء</h3>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm" dir="rtl">
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { code: "200", color: "green" as const, desc: "الطلب نجح وتم إرجاع البيانات" },
                      { code: "401", color: "orange" as const, desc: "مفتاح API مفقود أو غير صحيح" },
                      { code: "404", color: "orange" as const, desc: "الملزمة غير موجودة (عند طلب ملزمة بـ id)" },
                      { code: "503", color: "red" as const, desc: "لم يتم تعيين مفتاح API من الأدمن بعد" },
                      { code: "500", color: "red" as const, desc: "خطأ في السيرفر، حاول لاحقاً" },
                    ].map((e) => (
                      <tr key={e.code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 w-24"><Badge color={e.color}>{e.code}</Badge></td>
                        <td className="px-4 py-3 text-xs text-gray-700">{e.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── مثال بوت تيليكرام ── */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-4 h-4 text-[#2AABEE]" />
                <h3 className="font-bold text-gray-700">مثال — بوت تيليكرام (Python)</h3>
              </div>
              <CodeBlock copyText={`import requests\n\nAPI_KEY = "${apiKey || "YOUR_API_KEY"}"\nBASE_URL = "${baseUrl}/api/bot"\n\ndef get_all_notes():\n    res = requests.get(\n        f"{"{BASE_URL}"}/notes",\n        headers={"X-API-Key": API_KEY}\n    )\n    return res.json()\n\ndef get_note(note_id):\n    res = requests.get(\n        f"{"{BASE_URL}"}/notes/{"{note_id}"}",\n        headers={"X-API-Key": API_KEY}\n    )\n    return res.json()\n\ndef get_by_category(name):\n    res = requests.get(\n        f"{"{BASE_URL}"}/notes",\n        params={"category": name, "hasFile": "true"},\n        headers={"X-API-Key": API_KEY}\n    )\n    return res.json()`}>
                <span className="text-blue-300">import</span> requests{"\n\n"}
                <span className="text-yellow-300">API_KEY</span> = <span className="text-green-300">"{maskedKey || "YOUR_API_KEY"}"</span>{"\n"}
                <span className="text-yellow-300">BASE_URL</span> = <span className="text-green-300">"{baseUrl}/api/bot"</span>{"\n\n"}
                <span className="text-gray-500"># جلب كل الملازم</span>{"\n"}
                <span className="text-blue-300">def</span> <span className="text-yellow-300">get_all_notes</span>():{"\n"}
                {"    "}res = requests.get({"\n"}
                {"        "}f<span className="text-green-300">"{"{BASE_URL}"}/notes"</span>,{"\n"}
                {"        "}headers=<span className="text-orange-300">{"{"}</span><span className="text-green-300">"X-API-Key"</span>: API_KEY<span className="text-orange-300">{"}"}</span>{"\n"}
                {"    "}){"\n"}
                {"    "}<span className="text-blue-300">return</span> res.json(){"\n\n"}
                <span className="text-gray-500"># جلب ملزمة بالرقم</span>{"\n"}
                <span className="text-blue-300">def</span> <span className="text-yellow-300">get_note</span>(note_id):{"\n"}
                {"    "}res = requests.get({"\n"}
                {"        "}f<span className="text-green-300">"{"{BASE_URL}"}/notes/{"{note_id}"}"</span>,{"\n"}
                {"        "}headers=<span className="text-orange-300">{"{"}</span><span className="text-green-300">"X-API-Key"</span>: API_KEY<span className="text-orange-300">{"}"}</span>{"\n"}
                {"    "}){"\n"}
                {"    "}<span className="text-blue-300">return</span> res.json(){"\n\n"}
                <span className="text-gray-500"># فلتر على القسم + ملف PDF موجود</span>{"\n"}
                <span className="text-blue-300">def</span> <span className="text-yellow-300">get_by_category</span>(name):{"\n"}
                {"    "}res = requests.get({"\n"}
                {"        "}f<span className="text-green-300">"{"{BASE_URL}"}/notes"</span>,{"\n"}
                {"        "}params=<span className="text-orange-300">{"{"}</span><span className="text-green-300">"category"</span>: name, <span className="text-green-300">"hasFile"</span>: <span className="text-green-300">"true"</span><span className="text-orange-300">{"}"}</span>,{"\n"}
                {"        "}headers=<span className="text-orange-300">{"{"}</span><span className="text-green-300">"X-API-Key"</span>: API_KEY<span className="text-orange-300">{"}"}</span>{"\n"}
                {"    "}){"\n"}
                {"    "}<span className="text-blue-300">return</span> res.json()
              </CodeBlock>
            </section>

          </div>
        </div>

        {/* ══════════════════════════════════════════
            قسم ٣: معلومات التواصل
        ══════════════════════════════════════════ */}
        <form onSubmit={handleSaveContact} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">معلومات التواصل للشراء</h2>
              <p className="text-xs text-gray-500">تظهر عند الضغط على زر «شراء» في صفحة الملزمة</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" /> رقم واتساب
                  </label>
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+9647766699669" dir="ltr"
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Send className="w-4 h-4 text-[#2AABEE]" /> رابط تيليكرام
                  </label>
                  <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/username" dir="ltr"
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <button type="submit" disabled={savingContact}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
                  {savingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingContact ? "جاري الحفظ..." : "حفظ معلومات التواصل"}
                </button>
              </>
            )}
          </div>
        </form>

      </div>
    </AdminLayout>
  );
}
