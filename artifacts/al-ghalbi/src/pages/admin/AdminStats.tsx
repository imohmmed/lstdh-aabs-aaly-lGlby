import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetAllStats } from "@workspace/api-client-react";
import { Eye, Download, FileText, Star, Loader2 } from "lucide-react";

export default function AdminStats() {
  const { data: stats, isLoading } = useGetAllStats();

  const totalViews = stats?.reduce((acc, curr) => acc + curr.viewCount, 0) || 0;
  const totalDownloads = stats?.reduce((acc, curr) => acc + curr.downloadClickCount, 0) || 0;
  const totalPreviews = stats?.reduce((acc, curr) => acc + curr.previewClickCount, 0) || 0;

  const statCards = [
    { title: "إجمالي المشاهدات", value: totalViews, icon: Eye, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "إجمالي التحميلات", value: totalDownloads, icon: Download, color: "text-green-500", bg: "bg-green-50" },
    { title: "ضغطات عرض PDF", value: totalPreviews, icon: FileText, color: "text-teal-500", bg: "bg-teal-50" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
              <div className={`w-14 h-14 ${card.bg} rounded-xl flex items-center justify-center`}>
                <card.icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-1">{card.title}</p>
                <h3 className="font-display text-3xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Details Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900">إحصائيات الملازم التفصيلية</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">الملزمة</th>
                  <th className="px-6 py-4">المشاهدات</th>
                  <th className="px-6 py-4">ضغطات العرض</th>
                  <th className="px-6 py-4">ضغطات التحميل</th>
                  <th className="px-6 py-4">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : stats && stats.length > 0 ? (
                  stats.map((stat) => (
                    <tr key={stat.noteId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{stat.noteTitle}</td>
                      <td className="px-6 py-4 text-gray-600">{stat.viewCount}</td>
                      <td className="px-6 py-4 text-gray-600">{stat.previewClickCount}</td>
                      <td className="px-6 py-4 text-gray-600">{stat.downloadClickCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-500" />
                          {stat.averageRating ? Number(stat.averageRating).toFixed(1) : "-"}
                          <span className="text-gray-400 text-xs font-normal">({stat.ratingCount})</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا توجد بيانات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
