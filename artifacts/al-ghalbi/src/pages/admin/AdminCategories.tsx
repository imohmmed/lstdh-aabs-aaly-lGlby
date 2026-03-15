import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, FolderTree, ChevronLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type FormData = { name: string; icon: string; order: number; parentId: number | null };

export default function AdminCategories() {
  const { data: categories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "", icon: "", order: 0, parentId: null });

  const sections = categories?.filter((c) => !c.parentId) ?? [];

  const resetForm = () => {
    setFormData({ name: "", icon: "", order: 0, parentId: null });
    setEditingId(null);
  };

  const handleOpenEdit = (category: any) => {
    setFormData({
      name: category.name,
      icon: category.icon || "",
      order: category.order,
      parentId: category.parentId ?? null,
    });
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      icon: formData.icon || null,
      order: formData.order,
      parentId: formData.parentId,
    };
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast({ title: "تم تحديث القسم بنجاح" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "تم إنشاء القسم بنجاح" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsOpen(false);
      resetForm();
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم الحذف بنجاح" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="text-primary w-5 h-5" /> الأقسام الدراسية
          </h1>

          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all text-sm">
                <Plus className="w-4 h-4" /> إضافة قسم
              </button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل قسم" : "قسم جديد"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {/* Parent selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">النوع</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, parentId: null })}
                      className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                        formData.parentId === null
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                      }`}
                    >
                      📂 قسم رئيسي
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, parentId: sections[0]?.id ?? null })}
                      className={`py-3 rounded-xl font-bold border transition-all text-sm ${
                        formData.parentId !== null
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                      }`}
                    >
                      📁 قسم فرعي
                    </button>
                  </div>
                </div>

                {/* Parent section picker */}
                {formData.parentId !== null && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">القسم الرئيسي</label>
                    <select
                      required
                      value={formData.parentId ?? ""}
                      onChange={(e) => setFormData({ ...formData, parentId: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="" disabled>اختر القسم الرئيسي</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الاسم</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder={formData.parentId === null ? "مثال: المراحل الدراسية" : "مثال: سادس إعدادي"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الأيقونة (Emoji)</label>
                    <input
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-2xl text-center"
                      placeholder="📚"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الترتيب</label>
                    <input
                      type="number"
                      required
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ القسم"}
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hierarchical display */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : sections.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500">لا توجد أقسام</div>
          ) : (
            sections.map((section) => {
              const subs = categories?.filter((c) => c.parentId === section.id) ?? [];
              return (
                <div key={section.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Section row */}
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <div>
                        <span className="font-bold text-gray-900">{section.name}</span>
                        <span className="mr-2 text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">قسم رئيسي</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(section)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(section.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-sections */}
                  {subs.length > 0 && (
                    <div className="divide-y divide-gray-100">
                      {subs.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50">
                          <div className="flex items-center gap-3">
                            <ChevronLeft className="w-4 h-4 text-gray-300 mr-2" />
                            <span className="text-xl">{sub.icon}</span>
                            <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
                            <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">فرعي</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleOpenEdit(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDelete(sub.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {subs.length === 0 && (
                    <div className="px-6 py-3 text-sm text-gray-400 italic">لا توجد أقسام فرعية</div>
                  )}
                </div>
              );
            })
          )}

          {/* Orphan sub-categories (parentId set but parent not found) */}
          {(() => {
            const orphans = categories?.filter(
              (c) => c.parentId !== null && c.parentId !== undefined && !sections.find((s) => s.id === c.parentId)
            ) ?? [];
            if (orphans.length === 0) return null;
            return (
              <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-orange-50 border-b border-orange-200 text-sm font-bold text-orange-700">
                  ⚠️ أقسام بدون قسم رئيسي
                </div>
                {orphans.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 divide-y">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-medium text-gray-700 text-sm">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </AdminLayout>
  );
}
