import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, FolderTree } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const { data: categories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "", order: 0 });

  const resetForm = () => {
    setFormData({ name: "", icon: "", order: 0 });
    setEditingId(null);
  };

  const handleOpenEdit = (category: any) => {
    setFormData({ name: category.name, icon: category.icon || "", order: category.order });
    setEditingId(category.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: formData });
        toast({ title: "تم تحديث القسم بنجاح" });
      } else {
        await createMutation.mutateAsync({ data: formData });
        toast({ title: "تم إنشاء القسم بنجاح" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "تم الحذف بنجاح" });
    } catch (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="text-primary w-6 h-6" /> الأقسام الدراسية
          </h1>
          
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                <Plus className="w-5 h-5" /> إضافة قسم
              </button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "تعديل قسم" : "قسم جديد"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم القسم</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="مثال: وزاريات السادس الإعدادي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الأيقونة (Emoji)</label>
                  <input 
                    value={formData.icon} 
                    onChange={e => setFormData({...formData, icon: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-2xl"
                    placeholder="📚"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">الترتيب</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">
                    {(createMutation.isPending || updateMutation.isPending) ? "جاري الحفظ..." : "حفظ القسم"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
              <tr>
                <th className="px-6 py-4">الأيقونة</th>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">الترتيب</th>
                <th className="px-6 py-4 w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></td></tr>
              ) : categories?.length ? categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-2xl">{cat.icon}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-600">{cat.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا توجد أقسام</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
