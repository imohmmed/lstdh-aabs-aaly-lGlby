import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  useGetNotes, 
  useGetCategories,
  useCreateNote, 
  useUpdateNote, 
  useDeleteNote,
  useUploadPdf,
  useUploadImage
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Loader2, FileText, Image as ImageIcon, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminNotes() {
  const { data: notes, isLoading: loadingNotes } = useGetNotes();
  const { data: categories } = useGetCategories();
  
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const uploadPdfMutation = useUploadPdf();
  const uploadImageMutation = useUploadImage();
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const defaultForm = {
    title: "",
    teacherName: "الأستاذ عباس علي الغالبي",
    categoryId: 0,
    version: "",
    telegramDownloadUrl: "",
    telegramPurchaseUrl: "",
    pdfUrl: "",
    coverImageUrl: "",
    pageCount: null as number | null,
    fileSize: null as string | null
  };
  
  const [formData, setFormData] = useState(defaultForm);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleOpenEdit = (note: any) => {
    setFormData({
      title: note.title,
      teacherName: note.teacherName || "الأستاذ عباس علي الغالبي",
      categoryId: note.categoryId,
      version: note.version || "",
      telegramDownloadUrl: note.telegramDownloadUrl || "",
      telegramPurchaseUrl: note.telegramPurchaseUrl || "",
      pdfUrl: note.pdfUrl || "",
      coverImageUrl: note.coverImageUrl || "",
      pageCount: note.pageCount,
      fileSize: note.fileSize
    });
    setEditingId(note.id);
    setIsOpen(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      // Type assertion because generated orval expects a Blob 
      const res = await uploadPdfMutation.mutateAsync({ data: { file: file as unknown as Blob } });
      setFormData(prev => ({ 
        ...prev, 
        pdfUrl: res.url,
        pageCount: res.pageCount,
        fileSize: res.fileSize
      }));
      toast({ title: "تم رفع PDF بنجاح وحساب الصفحات" });
    } catch (err) {
      toast({ title: "فشل الرفع", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const res = await uploadImageMutation.mutateAsync({ data: { file: file as unknown as Blob } });
      setFormData(prev => ({ ...prev, coverImageUrl: res.url }));
      toast({ title: "تم رفع الغلاف بنجاح" });
    } catch (err) {
      toast({ title: "فشل الرفع", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast({ title: "الرجاء اختيار القسم", variant: "destructive" });
      return;
    }
    
    try {
      const payload = {
        ...formData,
        pageCount: formData.pageCount || null,
        fileSize: formData.fileSize || null
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast({ title: "تم الإنشاء بنجاح" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الملزمة؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
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
            <FileText className="text-primary w-6 h-6" /> الملازم الدراسية
          </h1>
          
          <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                <Plus className="w-5 h-5" /> إضافة ملزمة
              </button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingId ? "تعديل الملزمة" : "إضافة ملزمة جديدة"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الملزمة *</label>
                      <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">القسم *</label>
                      <select required value={formData.categoryId || ""} onChange={e => setFormData({...formData, categoryId: parseInt(e.target.value)})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary outline-none">
                        <option value="" disabled>اختر القسم الفرعي</option>
                        {categories?.filter(c => !c.parentId).map(section => {
                          const subs = categories?.filter(c => c.parentId === section.id) ?? [];
                          if (subs.length === 0) return null;
                          return (
                            <optgroup key={section.id} label={`${section.icon ?? ""} ${section.name}`}>
                              {subs.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.icon ?? ""} {sub.name}</option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الإصدار (سنة الطبع)</label>
                      <input value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary outline-none" placeholder="2025" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اسم الأستاذ</label>
                      <input value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-primary outline-none" />
                    </div>
                  </div>

                  {/* Links & Files */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رابط تيليكرام (التحميل المجاني)</label>
                      <input type="url" value={formData.telegramDownloadUrl} onChange={e => setFormData({...formData, telegramDownloadUrl: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl outline-none" dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رابط تيليكرام (شراء الأصلية)</label>
                      <input type="url" value={formData.telegramPurchaseUrl} onChange={e => setFormData({...formData, telegramPurchaseUrl: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl outline-none" dir="ltr" />
                    </div>

                    {/* File Uploads */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-4 space-y-4">
                      <div>
                        <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
                          <span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary"/> صورة الغلاف</span>
                          {formData.coverImageUrl && <span className="text-green-600 text-xs">مرفوع ✓</span>}
                        </label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm w-full" disabled={isUploading} />
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
                          <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-red-500"/> ملف PDF الداخلي</span>
                          {formData.pdfUrl && <span className="text-green-600 text-xs">مرفوع ✓ ({formData.pageCount} صفحة)</span>}
                        </label>
                        <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="text-sm w-full" disabled={isUploading} />
                      </div>
                    </div>
                  </div>

                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button type="submit" disabled={isUploading || createMutation.isPending || updateMutation.isPending} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50">
                    {isUploading ? "جاري الرفع..." : (editingId ? "حفظ التعديلات" : "إضافة الملزمة")}
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
                <th className="px-6 py-4">الغلاف</th>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">القسم</th>
                <th className="px-6 py-4">PDF</th>
                <th className="px-6 py-4 w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingNotes ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></td></tr>
              ) : notes?.length ? notes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    {note.coverImageUrl ? (
                      <img src={note.coverImageUrl} className="w-10 h-14 object-cover rounded shadow-sm border border-gray-200" alt="cover"/>
                    ) : (
                      <div className="w-10 h-14 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400"/></div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{note.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{note.categoryName}</span>
                  </td>
                  <td className="px-6 py-4">
                    {note.pdfUrl ? <span className="text-green-600 text-xs font-bold flex items-center gap-1"><FileText className="w-3 h-3"/>مرفوع</span> : <span className="text-gray-400 text-xs">لا يوجد</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenEdit(note)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">لا توجد ملازم</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
