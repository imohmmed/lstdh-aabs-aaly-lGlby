import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import { useGetBannerVideos, useCreateBannerVideo, useDeleteBannerVideo } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Video, Link } from "lucide-react";

export default function AdminBanner() {
  usePageTitle("بانر");
  const { toast } = useToast();
  const { data: videos = [], refetch } = useGetBannerVideos();
  const createMutation = useCreateBannerVideo();
  const deleteMutation = useDeleteBannerVideo();
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) return;
    try {
      await createMutation.mutateAsync({ data: { url, order: videos.length } });
      setNewUrl("");
      refetch();
      toast({ title: "تم إضافة المقطع بنجاح" });
    } catch {
      toast({ title: "فشل إضافة المقطع", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقطع؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast({ title: "تم حذف المقطع" });
    } catch {
      toast({ title: "فشل الحذف", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-8">

        {/* Add new video form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            إضافة مقطع فيديو جديد
          </h2>
          <p className="text-sm text-gray-500">
            أضف رابطاً مباشراً لملف فيديو (مثل .mp4). إذا أضفت أكثر من مقطع، يتنقل البانر بينها كل 5 ثواني.
          </p>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="relative flex-1">
              <Link className="absolute inset-y-0 end-3 my-auto w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                dir="ltr"
                className="w-full p-3 pe-10 border border-gray-300 rounded-xl outline-none focus:border-primary text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {createMutation.isPending ? "..." : "إضافة"}
            </button>
          </form>
        </div>

        {/* Video list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">مقاطع البانر ({videos.length})</h2>
          </div>

          {videos.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">لا توجد مقاطع بعد</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {videos.map((video, i) => (
                <div key={video.id} className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <video
                    src={video.url}
                    className="w-24 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                    muted
                    preload="metadata"
                  />
                  <p
                    className="flex-1 text-xs text-gray-500 truncate font-mono"
                    dir="ltr"
                    title={video.url}
                  >
                    {video.url}
                  </p>
                  <button
                    onClick={() => handleDelete(video.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
