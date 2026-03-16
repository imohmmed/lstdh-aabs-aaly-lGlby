import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [, navigate] = useLocation();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetch(`${import.meta.env.BASE_URL}api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.ok) {
          setVerified(true);
        } else {
          localStorage.removeItem("admin_token");
          navigate("/admin/login");
        }
      })
      .catch(() => {
        navigate("/admin/login");
      });
  }, [navigate]);

  if (verified === null) {
    return (
      <div className="min-h-screen bg-[#1A2744] flex items-center justify-center" dir="rtl">
        <div className="text-white/50 text-sm animate-pulse">جاري التحقق...</div>
      </div>
    );
  }

  return <>{children}</>;
}
