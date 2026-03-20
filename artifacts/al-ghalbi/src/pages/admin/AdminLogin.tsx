import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Lock, User, RefreshCw } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export default function AdminLogin() {
  usePageTitle("تسجيل الدخول");
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaAnswer("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/captcha`);
      const data = await res.json();
      setCaptchaToken(data.token);
      setCaptchaImage(data.image);
    } catch {
      setError("تعذّر تحميل الكابتشا");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!captchaAnswer.trim()) {
      setError("يرجى حل المسألة الحسابية");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaToken, captchaAnswer }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "بيانات الدخول غير صحيحة");
        loadCaptcha();
        return;
      }
      localStorage.setItem("admin_token", data.token);
      navigate("/admin");
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#1A2744] px-4"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/30 mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">لوحة الإدارة</h1>
          <p className="text-white/50 text-sm mt-1">الأستاذ عباس علي الغالبي</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute inset-y-0 end-3 my-auto w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 pe-10 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="أدخل اسم المستخدم"
                  dir="ltr"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute inset-y-0 end-3 my-auto text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 pe-10 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">
                التحقق الأمني
              </label>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[48px]">
                  {captchaLoading ? (
                    <RefreshCw className="w-5 h-5 text-white/30 animate-spin" />
                  ) : captchaImage ? (
                    <img
                      src={captchaImage}
                      alt="كابتشا"
                      className="h-10 select-none pointer-events-none"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={loadCaptcha}
                  disabled={captchaLoading}
                  className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-white/50 hover:text-white hover:bg-white/15 transition-all disabled:opacity-40"
                  title="تحديث الكابتشا"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <input
                type="number"
                inputMode="numeric"
                value={captchaAnswer}
                onChange={e => setCaptchaAnswer(e.target.value)}
                className="w-full bg-white/10 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-center text-lg tracking-wider"
                placeholder="أدخل ناتج العملية الحسابية"
                dir="ltr"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/30 disabled:opacity-60 mt-2"
            >
              {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
