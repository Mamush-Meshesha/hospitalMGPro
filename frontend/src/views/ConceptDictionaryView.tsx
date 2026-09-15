import React, { useState, useMemo, useEffect } from 'react';
import { Search, BookOpen, Plus, Filter, Database, Edit, Info, X, Hash, Tag, ChevronRight, ToggleLeft, ListChecks, Trash2 } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Types matching DB schema ─────────────────────────────────────────────────
interface Concept {
  concept_id: number;
  // concept_name (fully specified)
  name: string;
  short_name: string | null;     // concept.short_name
  description: string | null;    // concept.description
  // concept.datatype_id → concept_datatype.name
  datatype: string;
  // concept.class_id → concept_class.name
  class: string;
  is_set: boolean;               // concept.is_set
  retired: boolean;              // concept.retired
  version: string | null;        // concept.version
  // concept_numeric (if datatype = Numeric)
  hiNormal: number | null;
  lowNormal: number | null;
  hiCritical: number | null;
  lowCritical: number | null;
  hiAbsolute: number | null;
  lowAbsolute: number | null;
  units: string | null;
  allowDecimal: boolean;
  // concept_reference_map / ICD-10 / SNOMED
  mapping: string;
  // concept_name.locale
  locale: string;
}

// No seed data - always fetch from backend
const initialConcepts: Concept[] = [];

const CONCEPT_CLASSES = ['All', 'Diagnosis', 'Procedure', 'Drug', 'Lab Test', 'Finding', 'Anatomy', 'Symptom', 'Misc'];
const CONCEPT_DATATYPES = ['N/A', 'Numeric', 'Text', 'Coded', 'Boolean', 'Date', 'Time', 'Datetime', 'Complex'];
const LOCALES = ['en', 'fr', 'es', 'pt', 'am', 'sw'];

const CLASS_COLORS: Record<string, string> = {
  'Diagnosis':  'bg-rose-500/10 text-rose-600',
  'Lab Test':   'bg-sky-500/10 text-sky-600',
  'Drug':       'bg-violet-500/10 text-violet-600',
  'Finding':    'bg-amber-500/10 text-amber-600',
  'Procedure':  'bg-teal-500/10 text-teal-600',
  'Anatomy':    'bg-emerald-500/10 text-emerald-600',
  'Symptom':    'bg-orange-500/10 text-orange-600',
  'Misc':       'bg-muted text-muted-foreground',
};

const blankForm = (): Partial<Concept> => ({
  name: '', short_name: '', description: '', datatype: 'N/A', class: 'Diagnosis',
  is_set: false, retired: false, version: '', mapping: '', locale: 'en',
  hiNormal: null, lowNormal: null, hiCritical: null, lowCritical: null,
  hiAbsolute: null, lowAbsolute: null, units: '', allowDecimal: false,
});

export default function ConceptDictionaryView() {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadConcepts = () => {
    fetchApi('/concept?v=full')
      .then(data => {
        if (data && data.results) {
          setConcepts(data.results);
        }
      })
      .catch(err => console.error("Failed to fetch concepts:", err));
  };

  useEffect(() => {
    loadConcepts();
  }, []);

  const [activeClass, setActiveClass] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailConcept, setDetailConcept] = useState<Concept | null>(null);
  const [editConcept, setEditConcept] = useState<Concept | null>(null);

  // Form state (used for both Add and Edit)
  const [form, setForm] = useState<Partial<Concept>>(blankForm());

  const set = (key: keyof Concept, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const openAdd = () => { setForm(blankForm()); setIsAddOpen(true); };
  const openEdit = (c: Concept) => { setForm({ ...c }); setEditConcept(c); };
  const closeAll = () => { setIsAddOpen(false); setDetailConcept(null); setEditConcept(null); };

  const handleSave = async () => {
    if (!form.name || !form.class || !form.datatype) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        short_name: form.short_name,
        description: form.description,
        mapping: form.mapping,
        className: form.class,
        datatypeName: form.datatype,
        is_set: form.is_set ? 1 : 0,
        version: form.version,
        creator: 1
      };

      if (editConcept) {
        await fetchApi(`/concept/${editConcept.concept_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/concept', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      closeAll();
      loadConcepts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save concept');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to retire this concept?')) return;
    try {
      await fetchApi(`/concept/${id}`, { method: 'DELETE' });
      loadConcepts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete concept');
    }
  };

  const classCounts = useMemo(() => {
    const map: Record<string, number> = { All: concepts.filter(c => !c.retired).length };
    CONCEPT_CLASSES.slice(1).forEach(cls => { map[cls] = concepts.filter(c => c.class === cls && !c.retired).length; });
    return map;
  }, [concepts]);

  const filtered = useMemo(() => concepts.filter(c => {
    const matchesClass = activeClass === 'All' || c.class === activeClass;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.mapping.toLowerCase().includes(search.toLowerCase()) || String(c.concept_id).includes(search);
    return matchesClass && matchesSearch && !c.retired;
  }), [concepts, activeClass, search]);

  const renderFormModal = (title: string, onClose: () => void) => (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> {title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">

            {/* Section 1: concept + concept_name */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded">concept / concept_name</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Fully Specified Name <span className="text-[10px] text-muted-foreground">concept_name.name · REQUIRED</span>
                </label>
                <input value={form.name ?? ''} onChange={e => set('name', e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., Acute myocardial infarction" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex justify-between">
                    Short Name <span className="text-[10px] text-muted-foreground">concept.short_name</span>
                  </label>
                  <input value={form.short_name ?? ''} onChange={e => set('short_name', e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="e.g., AMI" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex justify-between">
                    Locale <span className="text-[10px] text-muted-foreground">concept_name.locale</span>
                  </label>
                  <select value={form.locale ?? 'en'} onChange={e => set('locale', e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    {LOCALES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Description <span className="text-[10px] text-muted-foreground">concept_description.description</span>
                </label>
                <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="Brief clinical description..." />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Version <span className="text-[10px] text-muted-foreground">concept.version</span>
                </label>
                <input value={form.version ?? ''} onChange={e => set('version', e.target.value)}
                  className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  placeholder="e.g., 2.1" />
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Section 2: Classification */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded">concept.class_id / datatype_id</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex justify-between">
                    Concept Class <span className="text-[10px] text-rose-500 font-normal">REQUIRED</span>
                  </label>
                  <select value={form.class ?? 'Diagnosis'} onChange={e => set('class', e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    {CONCEPT_CLASSES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex justify-between">
                    Datatype <span className="text-[10px] text-rose-500 font-normal">REQUIRED</span>
                  </label>
                  <select value={form.datatype ?? 'N/A'} onChange={e => set('datatype', e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    {CONCEPT_DATATYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_set ?? false} onChange={e => set('is_set', e.target.checked)} className="rounded border-border accent-primary" />
                  <span className="text-sm text-foreground">Is Set <span className="text-[10px] text-muted-foreground">(concept.is_set)</span></span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.retired ?? false} onChange={e => set('retired', e.target.checked)} className="rounded border-border accent-primary" />
                  <span className="text-sm text-foreground">Retired <span className="text-[10px] text-muted-foreground">(concept.retired)</span></span>
                </label>
              </div>
            </div>

            {/* Section 3: concept_numeric — only shown when Datatype = Numeric */}
            <AnimatePresence>
              {form.datatype === 'Numeric' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div className="border-t border-border" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="bg-muted px-2 py-1 rounded">concept_numeric</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Units</label>
                      <input value={form.units ?? ''} onChange={e => set('units', e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="mg/dL" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Hi Normal</label>
                      <input type="number" value={form.hiNormal ?? ''} onChange={e => set('hiNormal', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Low Normal</label>
                      <input type="number" value={form.lowNormal ?? ''} onChange={e => set('lowNormal', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Hi Critical</label>
                      <input type="number" value={form.hiCritical ?? ''} onChange={e => set('hiCritical', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Low Critical</label>
                      <input type="number" value={form.lowCritical ?? ''} onChange={e => set('lowCritical', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Hi Absolute</label>
                      <input type="number" value={form.hiAbsolute ?? ''} onChange={e => set('hiAbsolute', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Low Absolute</label>
                      <input type="number" value={form.lowAbsolute ?? ''} onChange={e => set('lowAbsolute', e.target.valueAsNumber)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.allowDecimal ?? false} onChange={e => set('allowDecimal', e.target.checked)} className="rounded border-border accent-primary" />
                    <span className="text-sm text-foreground">Allow Decimal <span className="text-[10px] text-muted-foreground">(concept_numeric.allow_decimal)</span></span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-border" />

            {/* Section 4: concept_reference_map */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <span className="bg-muted px-2 py-1 rounded">concept_reference_map</span>
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex justify-between">
                  Reference Mapping <span className="text-[10px] text-muted-foreground">Source and Code</span>
                </label>
                <div className="flex gap-2">
                  <select 
                    value={(form.mapping || '').includes(': ') ? (form.mapping || '').split(': ')[0] : 'ICD-10'}
                    onChange={e => {
                      const currentCode = (form.mapping || '').includes(': ') ? (form.mapping || '').split(': ')[1] : (form.mapping || '');
                      set('mapping', currentCode.trim() ? `${e.target.value}: ${currentCode}` : '');
                    }}
                    className="w-1/3 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                  >
                    <option value="ICD-10">ICD-10</option>
                    <option value="SNOMED">SNOMED</option>
                    <option value="LOINC">LOINC</option>
                    <option value="CIEL">CIEL</option>
                  </select>
                  <input 
                    value={(form.mapping || '').includes(': ') ? (form.mapping || '').split(': ')[1] : (form.mapping || '')} 
                    onChange={e => {
                      const val = e.target.value;
                      const currentSource = (form.mapping || '').includes(': ') ? (form.mapping || '').split(': ')[0] : 'ICD-10';
                      set('mapping', val.trim() ? `${currentSource}: ${val}` : '');
                    }}
                    className="w-2/3 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono"
                    placeholder="Code (e.g., I10)" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name || !form.class || !form.datatype || isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : 'Save Concept'}
          </button>
        </div>
      </motion.div>
    </>
  );

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Concept Dictionary</h1>
          <p className="text-muted-foreground text-sm">Manage medical terminologies, diagnoses, and procedures</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Plus size={16} /> New Concept
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* Left Sidebar: Classes */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Database size={16} className="text-primary" /> Concept Classes</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {CONCEPT_CLASSES.map((cls) => (
              <button key={cls} onClick={() => setActiveClass(cls)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${activeClass === cls ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}>
                <span className={`font-medium text-sm ${activeClass === cls ? 'text-primary' : 'text-foreground'}`}>{cls}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{classCounts[cls] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Concepts Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30 gap-3">
            <div className="relative w-72 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input type="text" placeholder="Search by name, ID, or mapping..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm" />
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} concepts</span>
          </div>

          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0">
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Fully Specified Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Datatype</th>
                  <th className="px-4 py-3">Mapping</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-sm">
                <AnimatePresence>
                  {filtered.map(row => (
                    <motion.tr key={row.concept_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.concept_id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{row.name}</div>
                        {row.short_name && <div className="text-xs text-muted-foreground mt-0.5">{row.short_name}</div>}
                        {row.is_set && <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded ml-0 mt-0.5 inline-block">SET</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${CLASS_COLORS[row.class] ?? 'bg-muted text-muted-foreground'}`}>{row.class}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {row.datatype === 'Numeric' && <Hash size={12} className="text-sky-500" />}
                          {row.datatype === 'Coded' && <ListChecks size={12} className="text-violet-500" />}
                          {row.datatype === 'Boolean' && <ToggleLeft size={12} className="text-amber-500" />}
                          {row.datatype === 'Text' && <Tag size={12} className="text-emerald-500" />}
                          {row.datatype}
                          {row.datatype === 'Numeric' && row.units && <span className="text-[10px] text-muted-foreground ml-1">({row.units})</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.mapping ? (
                          <span className="bg-muted border border-border px-2 py-0.5 rounded text-xs font-mono text-foreground">{row.mapping}</span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button onClick={() => setDetailConcept(row)} className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10" title="Details">
                          <Info size={16} />
                        </button>
                        <button onClick={() => openEdit(row)} className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(row.uuid)} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No concepts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isAddOpen && renderFormModal("Create New Concept", closeAll)}
        {editConcept && renderFormModal(`Edit: ${editConcept.name}`, closeAll)}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailConcept && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAll} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" /> Concept Detail
                </h2>
                <button onClick={closeAll} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[65vh]">
                <div className="flex items-start gap-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${CLASS_COLORS[detailConcept.class] ?? ''}`}>{detailConcept.class}</div>
                  {detailConcept.is_set && <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">Set</div>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{detailConcept.name}</h3>
                  {detailConcept.short_name && <p className="text-sm text-muted-foreground mt-1">Short: {detailConcept.short_name}</p>}
                  {detailConcept.description && <p className="text-sm text-foreground mt-2 leading-relaxed">{detailConcept.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['concept_id', String(detailConcept.concept_id)],
                    ['datatype', detailConcept.datatype],
                    ['locale', detailConcept.locale],
                    ['version', detailConcept.version ?? '—'],
                    ['retired', detailConcept.retired ? 'Yes' : 'No'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{k}</div>
                      <div className="font-medium text-foreground mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>

                {detailConcept.mapping && (
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Reference Mapping</div>
                    <code className="text-sm font-mono text-foreground">{detailConcept.mapping}</code>
                  </div>
                )}

                {detailConcept.datatype === 'Numeric' && (
                  <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-4 space-y-2">
                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Numeric Ranges (concept_numeric)</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        ['Units', detailConcept.units],
                        ['Hi Normal', detailConcept.hiNormal],
                        ['Low Normal', detailConcept.lowNormal],
                        ['Hi Critical', detailConcept.hiCritical],
                        ['Low Critical', detailConcept.lowCritical],
                        ['Hi Absolute', detailConcept.hiAbsolute],
                        ['Low Absolute', detailConcept.lowAbsolute],
                      ].map(([lbl, val]) => (
                        <div key={String(lbl)} className="bg-background border border-border rounded p-2">
                          <div className="text-[10px] text-muted-foreground">{lbl}</div>
                          <div className="font-mono font-medium text-foreground mt-0.5">{val ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between gap-3">
                <button onClick={() => { closeAll(); openEdit(detailConcept); }} className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  <Edit size={14} /> Edit Concept
                </button>
                <button onClick={closeAll} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


