import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search, Plus, LayoutTemplate, Settings, FileText, CheckCircle2, X,
  Edit, Info, Trash2, GripVertical, ToggleLeft, BookOpen, Link2,
  AlignLeft, Hash, List, Calendar, ToggleRight, Star, Copy, Eye, EyeOff
} from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types mapped to DB schema ────────────────────────────────────────────────

// field_type table
const FIELD_TYPES = ['Concept', 'Database', 'Coded', 'Set', 'Numeric', 'Text', 'Date', 'Boolean'];

// encounter_type options (form.encounter_type → encounter_type.encounter_type_id)
const ENCOUNTER_TYPES = [
  { id: 1, name: 'Consultation' },
  { id: 2, name: 'Admission' },
  { id: 3, name: 'Discharge' },
  { id: 4, name: 'Triage' },
  { id: 5, name: 'Vitals' },
  { id: 6, name: 'Follow-Up' },
];

// form.published colors
const FORM_COLORS = ['bg-blue-500/10 text-blue-500', 'bg-purple-500/10 text-purple-500',
  'bg-emerald-500/10 text-emerald-500', 'bg-amber-500/10 text-amber-500',
  'bg-rose-500/10 text-rose-500', 'bg-teal-500/10 text-teal-500'];

// field type → icon
const FIELD_ICON: Record<string, React.ReactNode> = {
  'Numeric': <Hash size={12} className="text-sky-500" />,
  'Text': <AlignLeft size={12} className="text-emerald-500" />,
  'Coded': <List size={12} className="text-violet-500" />,
  'Date': <Calendar size={12} className="text-amber-500" />,
  'Boolean': <ToggleLeft size={12} className="text-rose-500" />,
  'Concept': <BookOpen size={12} className="text-primary" />,
  'Database': <Link2 size={12} className="text-muted-foreground" />,
  'Set': <Star size={12} className="text-orange-500" />,
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface FormField {
  form_field_id: number;
  field_id: number;
  field_number: number | null;      // form_field.field_number
  field_part: string | null;        // form_field.field_part
  page_number: number | null;       // form_field.page_number
  parent_form_field: number | null; // form_field.parent_form_field
  min_occurs: number | null;        // form_field.min_occurs
  max_occurs: number | null;        // form_field.max_occurs
  required: boolean;                // form_field.required
  sort_weight: number | null;       // form_field.sort_weight
  // denormalized from field table:
  fieldName: string;                // field.name
  fieldType: string;                // field_type.name
  description: string | null;       // field.description
  concept_id: number | null;        // field.concept_id
  default_value: string | null;     // field.default_value
  select_multiple: boolean;         // field.select_multiple
  retired: boolean;                 // field.retired
}

interface HospForm {
  form_id: number;
  name: string;                     // form.name
  version: string;                  // form.version
  build: number | null;             // form.build
  published: boolean;               // form.published
  description: string | null;       // form.description
  encounter_type: number | null;    // form.encounter_type → encounter_type.encounter_type_id
  template: string | null;          // form.template
  xslt: string | null;              // form.xslt
  retired: boolean;                 // form.retired
  retired_reason: string | null;    // form.retired_reason
  date_changed: string | null;
  fields: FormField[];              // form_field[]
}

// ─── Seed data ────────────────────────────────────────────────────────────────

let fieldIdCounter = 10;
const seedForms: HospForm[] = [
  {
    form_id: 1, name: 'Vitals Intake Form', version: '2.1', build: 4, published: true,
    description: 'Captures patient vital signs at intake', encounter_type: 5,
    template: null, xslt: null, retired: false, retired_reason: null, date_changed: '2026-09-07',
    fields: [
      { form_field_id: 1, field_id: 1, field_number: 1, field_part: 'A', page_number: 1, parent_form_field: null, min_occurs: 1, max_occurs: 1, required: true, sort_weight: 1, fieldName: 'Blood Pressure Systolic', fieldType: 'Numeric', description: 'Systolic BP in mmHg', concept_id: 5085, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 2, field_id: 2, field_number: 2, field_part: 'A', page_number: 1, parent_form_field: null, min_occurs: 1, max_occurs: 1, required: true, sort_weight: 2, fieldName: 'Blood Pressure Diastolic', fieldType: 'Numeric', description: 'Diastolic BP in mmHg', concept_id: 5086, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 3, field_id: 3, field_number: 3, field_part: 'B', page_number: 1, parent_form_field: null, min_occurs: 0, max_occurs: 1, required: false, sort_weight: 3, fieldName: 'Temperature', fieldType: 'Numeric', description: 'Body temperature in °C', concept_id: 5088, default_value: null, select_multiple: false, retired: false },
    ]
  },
  {
    form_id: 2, name: 'Triage Questionnaire', version: '1.0', build: 1, published: false,
    description: 'Initial triage assessment form', encounter_type: 4,
    template: null, xslt: null, retired: false, retired_reason: null, date_changed: '2026-09-09',
    fields: [
      { form_field_id: 4, field_id: 4, field_number: 1, field_part: null, page_number: 1, parent_form_field: null, min_occurs: 1, max_occurs: 1, required: true, sort_weight: 1, fieldName: 'Chief Complaint', fieldType: 'Text', description: 'Primary reason for visit', concept_id: null, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 5, field_id: 5, field_number: 2, field_part: null, page_number: 1, parent_form_field: null, min_occurs: 1, max_occurs: 1, required: true, sort_weight: 2, fieldName: 'Acuity Level', fieldType: 'Coded', description: 'ESI triage level 1-5', concept_id: 160235, default_value: '3', select_multiple: false, retired: false },
    ]
  },
  {
    form_id: 3, name: 'Diabetes Flowsheet', version: '3.4', build: 12, published: true,
    description: 'Longitudinal diabetes management form', encounter_type: 6,
    template: null, xslt: null, retired: false, retired_reason: null, date_changed: '2026-08-01',
    fields: [
      { form_field_id: 6, field_id: 6, field_number: 1, field_part: null, page_number: 1, parent_form_field: null, min_occurs: 1, max_occurs: 1, required: true, sort_weight: 1, fieldName: 'Fasting Blood Glucose', fieldType: 'Numeric', description: 'mg/dL fasting', concept_id: 887, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 7, field_id: 7, field_number: 2, field_part: null, page_number: 1, parent_form_field: null, min_occurs: 0, max_occurs: 1, required: false, sort_weight: 2, fieldName: 'HbA1c', fieldType: 'Numeric', description: 'Haemoglobin A1c %', concept_id: 856, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 8, field_id: 8, field_number: 3, field_part: null, page_number: 2, parent_form_field: null, min_occurs: 0, max_occurs: 1, required: false, sort_weight: 3, fieldName: 'Insulin Regimen', fieldType: 'Coded', description: 'Current insulin type', concept_id: 1499, default_value: null, select_multiple: false, retired: false },
      { form_field_id: 9, field_id: 9, field_number: 4, field_part: null, page_number: 2, parent_form_field: null, min_occurs: 0, max_occurs: 5, required: false, sort_weight: 4, fieldName: 'Complications', fieldType: 'Coded', description: 'Diabetes-related complications', concept_id: 160753, default_value: null, select_multiple: true, retired: false },
    ]
  },
];

// ─── Blank helpers ────────────────────────────────────────────────────────────

const blankForm = (): Omit<HospForm, 'form_id' | 'fields'> => ({
  name: '', version: '1.0', build: 1, published: false, description: '',
  encounter_type: null, template: '', xslt: '', retired: false, retired_reason: '', date_changed: null,
});

const blankField = (): Omit<FormField, 'form_field_id'> => ({
  field_id: ++fieldIdCounter, field_number: null, field_part: null, page_number: 1,
  parent_form_field: null, min_occurs: 0, max_occurs: 1, required: false, sort_weight: null,
  fieldName: '', fieldType: 'Text', description: '', concept_id: null, default_value: '',
  select_multiple: false, retired: false,
});

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ published }: { published: boolean }) {
  return published
    ? <span className="flex items-center gap-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded"><CheckCircle2 size={11} /> Published</span>
    : <span className="text-xs font-medium bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">Draft</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FormBuilderView() {
  const [forms, setForms] = useState<HospForm[]>(seedForms);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadForms = () => {
    fetchApi('/form')
      .then(data => {
        if (data && data.results && data.results.length > 0) {
          setForms(data.results);
        }
      })
      .catch(err => console.error("Failed to fetch forms:", err));
  };

  useEffect(() => {
    loadForms();
  }, []);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modals
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editForm, setEditForm] = useState<HospForm | null>(null);
  const [detailForm, setDetailForm] = useState<HospForm | null>(null);
  const [builderForm, setBuilderForm] = useState<HospForm | null>(null);

  // Field editor inside builder
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editField, setEditField] = useState<FormField | null>(null);

  // Form-level form state
  const [formState, setFormState] = useState<Partial<HospForm>>(blankForm());
  const setF = (k: keyof HospForm, v: any) => setFormState(p => ({ ...p, [k]: v }));

  // Field-level form state
  const [fieldState, setFieldState] = useState<Partial<FormField>>(blankField());
  const setFld = (k: keyof FormField, v: any) => setFieldState(p => ({ ...p, [k]: v }));

  // ── Form CRUD ──
  const openAddForm = () => { setFormState(blankForm()); setIsAddFormOpen(true); };
  const openEditForm = (f: HospForm) => { setFormState({ ...f }); setEditForm(f); };
  const closeFormModal = () => { setIsAddFormOpen(false); setEditForm(null); };

  const saveForm = async () => {
    if (!formState.name || !formState.version) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formState.name,
        version: formState.version,
        build: formState.build || 1,
        published: formState.published ? 1 : 0,
        description: formState.description || '',
        encounter_type: formState.encounter_type || null,
        creator: 1
      };

      if (editForm) {
        await fetchApi(`/form/${editForm.form_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/form', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      closeFormModal();
      loadForms();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteForm = (id: number) => setForms(prev => prev.filter(f => f.form_id !== id));

  const togglePublish = (id: number) =>
    setForms(prev => prev.map(f => f.form_id === id ? { ...f, published: !f.published } : f));

  // ── Field CRUD (inside builder) ──
  const openAddField = () => {
    if (!builderForm) return;
    setFieldState(blankField());
    setIsAddFieldOpen(true);
  };
  const openEditField = (ff: FormField) => { setFieldState({ ...ff }); setEditField(ff); };
  const closeFieldModal = () => { setIsAddFieldOpen(false); setEditField(null); };

  const saveField = () => {
    if (!fieldState.fieldName || !builderForm) return;
    if (editField) {
      const updated = builderForm.fields.map(ff =>
        ff.form_field_id === editField.form_field_id ? { ...ff, ...fieldState } as FormField : ff
      );
      const updatedForm = { ...builderForm, fields: updated };
      setBuilderForm(updatedForm);
      setForms(prev => prev.map(f => f.form_id === builderForm.form_id ? updatedForm : f));
    } else {
      const newId = Math.max(...builderForm.fields.map(ff => ff.form_field_id), 0) + 1;
      const newField = { ...blankField(), ...fieldState, form_field_id: newId } as FormField;
      const updatedForm = { ...builderForm, fields: [...builderForm.fields, newField] };
      setBuilderForm(updatedForm);
      setForms(prev => prev.map(f => f.form_id === builderForm.form_id ? updatedForm : f));
    }
    closeFieldModal();
  };

  const deleteField = (ffId: number) => {
    if (!builderForm) return;
    const updatedForm = { ...builderForm, fields: builderForm.fields.filter(ff => ff.form_field_id !== ffId) };
    setBuilderForm(updatedForm);
    setForms(prev => prev.map(f => f.form_id === builderForm.form_id ? updatedForm : f));
  };

  // ── Filtering ──
  const filtered = useMemo(() => forms.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'published' ? f.published : !f.published);
    return matchSearch && matchStatus && !f.retired;
  }), [forms, search, filterStatus]);

  // ── Helpers ──
  const encounterName = (id: number | null) => ENCOUNTER_TYPES.find(e => e.id === id)?.name ?? '—';
  const pageGroups = (fields: FormField[]) => {
    const map: Record<number, FormField[]> = {};
    fields.forEach(ff => {
      const p = ff.page_number ?? 1;
      if (!map[p]) map[p] = [];
      map[p].push(ff);
    });
    return map;
  };

  // ─── Form Modal ───────────────────────────────────────────────────────────

  const FormModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <LayoutTemplate size={20} className="text-primary" /> {title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Section: form core */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="bg-muted px-2 py-1 rounded">form</span></h3>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex justify-between">
                Form Name <span className="text-[10px] text-rose-500">REQUIRED · form.name</span>
              </label>
              <input value={formState.name ?? ''} onChange={e => setF('name', e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., General Intake Vitals" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex justify-between">
                Description <span className="text-[10px] text-muted-foreground">form.description</span>
              </label>
              <textarea value={formState.description ?? ''} onChange={e => setF('description', e.target.value)} rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Purpose of this form..." />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Version <span className="text-[10px] text-rose-500">REQUIRED</span>
                </label>
                <input value={formState.version ?? ''} onChange={e => setF('version', e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="1.0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Build # <span className="text-[10px] text-muted-foreground">form.build</span>
                </label>
                <input type="number" value={formState.build ?? ''} onChange={e => setF('build', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Encounter Type <span className="text-[10px] text-muted-foreground">form.encounter_type</span>
                </label>
                <select value={formState.encounter_type ?? ''} onChange={e => setF('encounter_type', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                  <option value="">— None —</option>
                  {ENCOUNTER_TYPES.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formState.published ?? false} onChange={e => setF('published', e.target.checked)} className="rounded border-border accent-primary" />
                <span className="text-sm text-foreground">Published <span className="text-[10px] text-muted-foreground">(form.published)</span></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formState.retired ?? false} onChange={e => setF('retired', e.target.checked)} className="rounded border-border accent-primary" />
                <span className="text-sm text-foreground">Retired <span className="text-[10px] text-muted-foreground">(form.retired)</span></span>
              </label>
            </div>

            {formState.retired && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Retire Reason <span className="text-[10px] text-muted-foreground">(form.retired_reason)</span></label>
                <input value={formState.retired_reason ?? ''} onChange={e => setF('retired_reason', e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="Reason for retiring this form..." />
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Section: Template / XSLT */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="bg-muted px-2 py-1 rounded">form.template / form.xslt</span></h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Template (HTML/XML) <span className="text-[10px] text-muted-foreground">form.template</span></label>
              <textarea value={formState.template ?? ''} onChange={e => setF('template', e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Paste form HTML/XML template..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">XSLT Stylesheet <span className="text-[10px] text-muted-foreground">form.xslt</span></label>
              <textarea value={formState.xslt ?? ''} onChange={e => setF('xslt', e.target.value)} rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Paste XSLT transformation..." />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={saveForm} disabled={!formState.name || !formState.version || isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : (editForm ? 'Update Form' : 'Create Form')}
          </button>
        </div>
      </motion.div>
    </>
  );

  // ─── Field Modal ──────────────────────────────────────────────────────────

  const FieldModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl z-[70] flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" /> {title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* field table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="bg-muted px-2 py-1 rounded">field</span></h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex justify-between">
                Field Name <span className="text-[10px] text-rose-500">REQUIRED · field.name</span>
              </label>
              <input value={fieldState.fieldName ?? ''} onChange={e => setFld('fieldName', e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., Systolic Blood Pressure" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Description <span className="text-[10px] text-muted-foreground">field.description</span></label>
              <textarea value={fieldState.description ?? ''} onChange={e => setFld('description', e.target.value)} rows={2}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                placeholder="Field description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Field Type <span className="text-[10px] text-rose-500">REQUIRED · field_type</span>
                </label>
                <select value={fieldState.fieldType ?? 'Text'} onChange={e => setFld('fieldType', e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                  {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Concept ID <span className="text-[10px] text-muted-foreground">field.concept_id</span></label>
                <input type="number" value={fieldState.concept_id ?? ''} onChange={e => setFld('concept_id', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., 5085" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Value <span className="text-[10px] text-muted-foreground">field.default_value</span></label>
              <input value={fieldState.default_value ?? ''} onChange={e => setFld('default_value', e.target.value)}
                className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g., 37" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fieldState.select_multiple ?? false} onChange={e => setFld('select_multiple', e.target.checked)} className="rounded border-border accent-primary" />
              <span className="text-sm text-foreground">Select Multiple <span className="text-[10px] text-muted-foreground">(field.select_multiple)</span></span>
            </label>
          </div>

          <div className="border-t border-border" />

          {/* form_field table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground"><span className="bg-muted px-2 py-1 rounded">form_field</span></h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Page # <span className="text-[10px] text-muted-foreground">form_field.page_number</span></label>
                <input type="number" value={fieldState.page_number ?? 1} onChange={e => setFld('page_number', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min={1} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Field # <span className="text-[10px] text-muted-foreground">form_field.field_number</span></label>
                <input type="number" value={fieldState.field_number ?? ''} onChange={e => setFld('field_number', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Field Part <span className="text-[10px] text-muted-foreground">form_field.field_part</span></label>
                <input value={fieldState.field_part ?? ''} onChange={e => setFld('field_part', e.target.value || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., A or B" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Min Occurs <span className="text-[10px] text-muted-foreground">form_field.min_occurs</span></label>
                <input type="number" value={fieldState.min_occurs ?? 0} onChange={e => setFld('min_occurs', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min={0} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Max Occurs <span className="text-[10px] text-muted-foreground">form_field.max_occurs</span></label>
                <input type="number" value={fieldState.max_occurs ?? 1} onChange={e => setFld('max_occurs', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" min={1} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Sort Weight <span className="text-[10px] text-muted-foreground">form_field.sort_weight</span></label>
                <input type="number" value={fieldState.sort_weight ?? ''} onChange={e => setFld('sort_weight', parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., 1.5" step="0.1" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={fieldState.required ?? false} onChange={e => setFld('required', e.target.checked)} className="rounded border-border accent-primary" />
              <span className="text-sm text-foreground font-medium">Required <span className="text-[10px] text-muted-foreground">(form_field.required)</span></span>
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={saveField} disabled={!fieldState.fieldName}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {editField ? 'Update Field' : 'Add Field'}
          </button>
        </div>
      </motion.div>
    </>
  );

  // ─── Builder Panel ────────────────────────────────────────────────────────

  if (builderForm) {
    const groups = pageGroups(builderForm.fields);
    const pages = Object.keys(groups).map(Number).sort();
    return (
      <div className="w-full flex flex-col h-full">
        {/* Builder header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setBuilderForm(null)} className="p-2 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
            <div>
              <h2 className="font-bold text-foreground text-lg">{builderForm.name}</h2>
              <p className="text-xs text-muted-foreground">v{builderForm.version} · {builderForm.fields.length} fields</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge published={builderForm.published} />
            <button onClick={() => { togglePublish(builderForm.form_id); setBuilderForm(prev => prev ? { ...prev, published: !prev.published } : prev); }}
              className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors">
              {builderForm.published ? <EyeOff size={14} /> : <Eye size={14} />}
              {builderForm.published ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={openAddField} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Plus size={16} /> Add Field
            </button>
          </div>
        </div>

        {/* Field list by page */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {pages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                <FileText size={28} />
              </div>
              <p className="text-muted-foreground text-sm">No fields yet. Click <strong>Add Field</strong> to start building.</p>
            </div>
          )}
          {pages.map(page => (
            <div key={page} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{page}</div>
                <h3 className="text-sm font-semibold text-foreground">Page {page}</h3>
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">{groups[page].length} fields</span>
              </div>
              <div className="space-y-2">
                {groups[page].sort((a, b) => (a.sort_weight ?? 0) - (b.sort_weight ?? 0)).map(ff => (
                  <motion.div key={ff.form_field_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/30 transition-all group">
                    <GripVertical size={16} className="text-muted-foreground cursor-grab flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-shrink-0 w-20">
                      {FIELD_ICON[ff.fieldType] ?? <FileText size={12} />}
                      <span className="text-[10px] text-muted-foreground font-mono uppercase">{ff.fieldType}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">{ff.fieldName}</span>
                        {ff.required && <span className="text-[10px] bg-rose-500/10 text-rose-600 px-1.5 rounded flex-shrink-0">required</span>}
                        {ff.select_multiple && <span className="text-[10px] bg-violet-500/10 text-violet-600 px-1.5 rounded flex-shrink-0">multi</span>}
                        {ff.field_part && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded flex-shrink-0">Part {ff.field_part}</span>}
                      </div>
                      {ff.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{ff.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs font-mono flex-shrink-0">
                      {ff.concept_id && <span className="bg-muted px-1.5 py-0.5 rounded">#{ff.concept_id}</span>}
                      {ff.min_occurs !== null && <span className="bg-muted px-1.5 py-0.5 rounded">{ff.min_occurs}–{ff.max_occurs}</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => openEditField(ff)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors"><Edit size={14} /></button>
                      <button onClick={() => deleteField(ff.form_field_id)} className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-md transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Field modals */}
        <AnimatePresence>
          {isAddFieldOpen && <FieldModal title="Add Field" onClose={closeFieldModal} />}
          {editField && <FieldModal title={`Edit: ${editField.fieldName}`} onClose={closeFieldModal} />}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Main List View ───────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Form Engine</h1>
          <p className="text-muted-foreground text-sm">Design custom encounter and observation forms</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search forms..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm w-56" />
          </div>
          <div className="flex rounded-md border border-border overflow-hidden text-xs font-medium">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 transition-colors capitalize ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} /> Create Form
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Forms', value: forms.filter(f => !f.retired).length, color: 'text-primary' },
          { label: 'Published', value: forms.filter(f => f.published && !f.retired).length, color: 'text-emerald-500' },
          { label: 'Drafts', value: forms.filter(f => !f.published && !f.retired).length, color: 'text-amber-500' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex flex-col">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Grid of form cards + create card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 content-start">
        {/* Create Card */}
        <motion.div onClick={openAddForm} whileHover={{ scale: 1.01 }}
          className="bg-muted/10 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-muted/20 hover:border-primary/30 transition-all min-h-[220px]">
          <div className="h-14 w-14 rounded-full bg-card shadow-sm border border-border flex items-center justify-center text-primary mb-4">
            <Plus size={26} />
          </div>
          <h3 className="font-semibold text-foreground">Design New Form</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[180px]">Start from scratch or import an existing template.</p>
        </motion.div>

        {/* Form Cards */}
        <AnimatePresence>
          {filtered.map((f, i) => (
            <motion.div key={f.form_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:border-primary/30 hover:shadow-md transition-all">
              <div className="p-5 flex items-start gap-4 flex-1">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${FORM_COLORS[f.form_id % FORM_COLORS.length]}`}>
                  <FileText size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground leading-tight truncate">{f.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    v{f.version} {f.build != null ? `· build ${f.build}` : ''} · {encounterName(f.encounter_type)}
                  </p>
                  {f.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{f.description}</p>}
                  <div className="flex items-center gap-2 mt-3">
                    <StatusBadge published={f.published} />
                    <span className="text-[11px] text-muted-foreground">{f.fields.length} fields</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-3 flex gap-2 bg-muted/20">
                <button onClick={() => setBuilderForm(f)}
                  className="flex-1 text-sm font-medium hover:bg-primary/10 text-primary py-1.5 rounded-md transition-colors flex items-center justify-center gap-2">
                  <LayoutTemplate size={14} /> Open Builder
                </button>
                <button onClick={() => setDetailForm(f)} className="px-3 text-muted-foreground hover:bg-muted py-1.5 rounded-md transition-colors" title="Details">
                  <Info size={14} />
                </button>
                <button onClick={() => openEditForm(f)} className="px-3 text-muted-foreground hover:bg-primary/10 hover:text-primary py-1.5 rounded-md transition-colors" title="Edit">
                  <Edit size={14} />
                </button>
                <button onClick={() => togglePublish(f.form_id)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${f.published ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                  title={f.published ? 'Unpublish' : 'Publish'}>
                  {f.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => deleteForm(f.form_id)} className="px-3 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 py-1.5 rounded-md transition-colors" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && search && (
          <div className="col-span-3 text-center py-16 text-muted-foreground text-sm">No forms match your search.</div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {isAddFormOpen && <FormModal title="Create New Form" onClose={closeFormModal} />}
        {editForm && <FormModal title={`Edit: ${editForm.name}`} onClose={closeFormModal} />}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailForm(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <LayoutTemplate size={20} className="text-primary" /> Form Details
                </h2>
                <button onClick={() => setDetailForm(null)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                <div className="flex items-center gap-3">
                  <StatusBadge published={detailForm.published} />
                  {detailForm.retired && <span className="text-xs bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded">Retired</span>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{detailForm.name}</h3>
                  {detailForm.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{detailForm.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['form_id', String(detailForm.form_id)],
                    ['version', detailForm.version],
                    ['build', detailForm.build != null ? `#${detailForm.build}` : '—'],
                    ['encounter_type', encounterName(detailForm.encounter_type)],
                    ['fields', `${detailForm.fields.length} fields`],
                    ['date_changed', detailForm.date_changed ?? '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{k}</div>
                      <div className="font-medium text-foreground mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
                {/* Field summary table */}
                {detailForm.fields.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fields</div>
                    <div className="divide-y divide-border/50">
                      {detailForm.fields.map(ff => (
                        <div key={ff.form_field_id} className="px-4 py-2.5 flex items-center gap-3 text-sm">
                          <span className="flex-shrink-0">{FIELD_ICON[ff.fieldType] ?? <FileText size={12} />}</span>
                          <span className="flex-1 text-foreground font-medium truncate">{ff.fieldName}</span>
                          <span className="text-xs text-muted-foreground">p.{ff.page_number ?? 1}</span>
                          {ff.required && <span className="text-[10px] bg-rose-500/10 text-rose-600 px-1.5 rounded">req</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between gap-3">
                <button onClick={() => { setDetailForm(null); openEditForm(detailForm); }}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  <Edit size={14} /> Edit Form
                </button>
                <button onClick={() => { setDetailForm(null); setBuilderForm(detailForm); }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  <LayoutTemplate size={14} /> Open Builder
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
