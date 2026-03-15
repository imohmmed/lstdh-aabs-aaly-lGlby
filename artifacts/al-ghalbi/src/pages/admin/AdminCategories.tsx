import { useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  FolderTree,
  GripVertical,
  X,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Cat = {
  id: number;
  name: string;
  icon?: string | null;
  order: number;
  parentId?: number | null;
  createdAt: string;
};

type InlineForm = { name: string; icon: string };

function SubSortableRow({
  sub,
  onEdit,
  onDelete,
}: {
  sub: Cat;
  onEdit: (cat: Cat) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sub.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 border-t border-gray-100 bg-white"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        {sub.icon && <span className="text-lg">{sub.icon}</span>}
        <span className="font-medium text-gray-700 text-sm">{sub.name}</span>
        <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
          فرعي
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(sub)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(sub.id)}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  subs,
  onEdit,
  onDelete,
  onSubReorder,
  onAddSub,
}: {
  section: Cat;
  subs: Cat[];
  onEdit: (cat: Cat) => void;
  onDelete: (id: number) => void;
  onSubReorder: (sectionId: number, newOrder: Cat[]) => void;
  onAddSub: (sectionId: number, data: InlineForm) => Promise<void>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<InlineForm>({ name: "", icon: "" });
  const [saving, setSaving] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSubDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = subs.findIndex((s) => s.id === active.id);
    const newIdx = subs.findIndex((s) => s.id === over.id);
    if (oldIdx !== -1 && newIdx !== -1) {
      onSubReorder(section.id, arrayMove(subs, oldIdx, newIdx));
    }
  };

  const handleAddSub = async () => {
    if (!addForm.name.trim()) return;
    setSaving(true);
    await onAddSub(section.id, addForm);
    setAddForm({ name: "", icon: "" });
    setShowAdd(false);
    setSaving(false);
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-200">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        {section.icon && <span className="text-xl">{section.icon}</span>}
        <div className="flex-1 min-w-0">
          <span className="font-bold text-gray-900">{section.name}</span>
          <span className="mr-2 text-xs text-gray-400 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
            قسم رئيسي
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="إضافة قسم فرعي"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(section)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-sections sortable */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
        <SortableContext items={subs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {subs.map((sub) => (
            <SubSortableRow key={sub.id} sub={sub} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Inline add sub-section */}
      {showAdd && (
        <div className="flex items-center gap-2 px-5 py-3 bg-primary/5 border-t border-primary/20">
          <input
            value={addForm.icon}
            onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
            placeholder="📁"
            className="w-12 p-2 text-center text-lg border border-gray-300 rounded-lg outline-none focus:border-primary"
          />
          <input
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            placeholder="اسم القسم الفرعي"
            onKeyDown={(e) => e.key === "Enter" && handleAddSub()}
            autoFocus
            className="flex-1 p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-primary"
          />
          <button
            onClick={handleAddSub}
            disabled={saving || !addForm.name.trim()}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setShowAdd(false); setAddForm({ name: "", icon: "" }); }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!showAdd && subs.length === 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full px-5 py-3 text-sm text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors text-right flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة قسم فرعي
        </button>
      )}
    </div>
  );
}

export default function AdminCategories() {
  usePageTitle("إدارة الأقسام");
  const { data: rawCategories, isLoading } = useGetCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [editForm, setEditForm] = useState({ name: "", icon: "" });
  const [newSectionForm, setNewSectionForm] = useState({ name: "", icon: "" });
  const [showNewSection, setShowNewSection] = useState(false);
  const [sectionsOrder, setSectionsOrder] = useState<Cat[] | null>(null);
  const [subsOrder, setSubsOrder] = useState<Record<number, Cat[]>>({});

  const categories = rawCategories as Cat[] | undefined;
  const sections: Cat[] = sectionsOrder ?? (categories?.filter((c) => !c.parentId).sort((a, b) => a.order - b.order) ?? []);

  const getSubsFor = useCallback(
    (sectionId: number): Cat[] => {
      if (subsOrder[sectionId]) return subsOrder[sectionId];
      return categories?.filter((c) => c.parentId === sectionId).sort((a, b) => a.order - b.order) ?? [];
    },
    [categories, subsOrder]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    setSectionsOrder(null);
    setSubsOrder({});
  };

  const handleAddSection = async () => {
    if (!newSectionForm.name.trim()) return;
    try {
      await createMutation.mutateAsync({
        data: { name: newSectionForm.name, icon: newSectionForm.icon || null, order: sections.length, parentId: null },
      });
      setNewSectionForm({ name: "", icon: "" });
      setShowNewSection(false);
      invalidate();
      toast({ title: "تم إنشاء القسم الرئيسي" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleAddSub = async (sectionId: number, form: InlineForm) => {
    const currentSubs = getSubsFor(sectionId);
    try {
      await createMutation.mutateAsync({
        data: { name: form.name, icon: form.icon || null, order: currentSubs.length, parentId: sectionId },
      });
      invalidate();
      toast({ title: "تم إنشاء القسم الفرعي" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleEdit = async () => {
    if (!editingCat) return;
    try {
      await updateMutation.mutateAsync({ id: editingCat.id, data: { name: editForm.name, icon: editForm.icon || null } });
      invalidate();
      setEditingCat(null);
      toast({ title: "تم التحديث" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      invalidate();
      toast({ title: "تم الحذف" });
    } catch {
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  };

  const handleSectionReorder = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const newOrder = arrayMove(sections, oldIdx, newIdx);
    setSectionsOrder(newOrder);
    await Promise.all(newOrder.map((s, i) => updateMutation.mutateAsync({ id: s.id, data: { order: i } })));
    invalidate();
  };

  const handleSubReorder = async (sectionId: number, newOrder: Cat[]) => {
    setSubsOrder((prev) => ({ ...prev, [sectionId]: newOrder }));
    await Promise.all(newOrder.map((s, i) => updateMutation.mutateAsync({ id: s.id, data: { order: i } })));
    invalidate();
  };

  const sectionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="text-primary w-5 h-5" /> الأقسام الدراسية
          </h1>
          <button
            onClick={() => setShowNewSection(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> قسم رئيسي جديد
          </button>
        </div>

        {/* New section inline form */}
        {showNewSection && (
          <div className="bg-white border-2 border-primary/30 rounded-2xl p-4 flex items-center gap-3">
            <input
              value={newSectionForm.icon}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, icon: e.target.value })}
              placeholder="📂"
              className="w-12 p-2 text-center text-xl border border-gray-300 rounded-xl outline-none focus:border-primary"
            />
            <input
              value={newSectionForm.name}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, name: e.target.value })}
              placeholder="اسم القسم الرئيسي (مثال: المراحل الدراسية)"
              onKeyDown={(e) => e.key === "Enter" && handleAddSection()}
              autoFocus
              className="flex-1 p-2 border border-gray-300 rounded-xl outline-none focus:border-primary text-sm"
            />
            <button
              onClick={handleAddSection}
              disabled={!newSectionForm.name.trim()}
              className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowNewSection(false); setNewSectionForm({ name: "", icon: "" }); }}
              className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Edit dialog */}
        {editingCat && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingCat(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()} dir="rtl">
              <h3 className="font-bold text-lg mb-4">تعديل القسم</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    value={editForm.icon}
                    onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                    placeholder="📁"
                    className="w-16 p-3 text-center text-2xl border border-gray-300 rounded-xl outline-none focus:border-primary"
                  />
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:border-primary"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleEdit} disabled={updateMutation.isPending} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold">
                    {updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                  </button>
                  <button onClick={() => setEditingCat(null)} className="px-4 py-3 border border-gray-300 rounded-xl text-gray-600">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories list */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
        ) : sections.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 border border-dashed border-gray-300">
            <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>لا توجد أقسام — اضغط على "قسم رئيسي جديد" للبدء</p>
          </div>
        ) : (
          <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionReorder}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    subs={getSubsFor(section.id)}
                    onEdit={(cat) => { setEditingCat(cat); setEditForm({ name: cat.name, icon: cat.icon || "" }); }}
                    onDelete={handleDelete}
                    onSubReorder={handleSubReorder}
                    onAddSub={handleAddSub}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}
