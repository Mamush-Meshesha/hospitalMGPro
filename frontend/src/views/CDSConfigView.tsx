import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, ShieldAlert, Code, Play, CheckCircle2, AlertTriangle, AlertCircle, X, Edit, Trash2, Info, Activity } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CDSRule {
  id: number;
  name: string;
  category: string;
  severity: 'INFO' | 'MODERATE' | 'SEVERE';
  condition: string;
  message: string;
  status: 'Active' | 'Testing' | 'Inactive';
  lastTriggered?: string;
}

// ─── Constants & Seed Data ────────────────────────────────────────────────────

const CATEGORIES = ['Allergy Alert', 'Drug-Drug Interaction', 'Dosing Guideline', 'Duplicate Therapy', 'Age/Weight Check', 'Contraindication'];
const SEVERITIES = ['INFO', 'MODERATE', 'SEVERE'] as const;
const STATUSES = ['Active', 'Testing', 'Inactive'] as const;

const initialRules: CDSRule[] = [
  { id: 1, name: 'Penicillin Allergy Check', category: 'Allergy Alert', severity: 'SEVERE', condition: 'Order ∈ [Penicillins] AND Patient.Allergies ⊃ [Penicillin]', message: 'Patient has a documented severe allergy to Penicillin.', status: 'Active', lastTriggered: '2 mins ago' },
  { id: 2, name: 'Sulfa Drug Allergy', category: 'Allergy Alert', severity: 'SEVERE', condition: 'Order ∈ [Sulfonamides] AND Patient.Allergies ⊃ [Sulfa]', message: 'Patient is allergic to Sulfa drugs.', status: 'Active', lastTriggered: '1 hour ago' },
  { id: 3, name: 'Latex Allergy Warning', category: 'Allergy Alert', severity: 'MODERATE', condition: 'Encounter.Type == "Surgery" AND Patient.Allergies ⊃ [Latex]', message: 'Ensure a latex-free environment for this procedure.', status: 'Active', lastTriggered: 'Yesterday' },
  { id: 4, name: 'Iodine Contrast Alert', category: 'Allergy Alert', severity: 'SEVERE', condition: 'Order.Type == "Radiology" AND Patient.Allergies ⊃ [Iodine]', message: 'Risk of anaphylaxis with iodine contrast.', status: 'Testing' },
  { id: 5, name: 'Aspirin / Warfarin Interaction', category: 'Drug-Drug Interaction', severity: 'SEVERE', condition: 'Order ∈ [Warfarin] AND Patient.Meds ⊃ [Aspirin]', message: 'High risk of bleeding. Consider alternative or adjust dose.', status: 'Active', lastTriggered: '4 hours ago' },
  { id: 6, name: 'Pediatric Paracetamol Dosing', category: 'Dosing Guideline', severity: 'MODERATE', condition: 'Patient.Age < 12 AND Order.Drug == "Paracetamol" AND Order.Dose > 15mg/kg', message: 'Dose exceeds recommended 15mg/kg for pediatric patients.', status: 'Testing' },
];

const blankRule = (): Partial<CDSRule> => ({
  name: '',
  category: 'Allergy Alert',
  severity: 'MODERATE',
  condition: '',
  message: '',
  status: 'Testing'
});

export default function CDSConfigView() {
  const [rules, setRules] = useState<CDSRule[]>(initialRules);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRules = () => {
    fetchApi('/alert')
      .then(data => {
        if (data && data.results && data.results.length > 0) {
          setRules(data.results);
        }
      })
      .catch(err => console.error("Failed to fetch alerts/rules:", err));
  };

  useEffect(() => {
    loadRules();
  }, []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Modals
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [editRule, setEditRule] = useState<CDSRule | null>(null);
  const [detailRule, setDetailRule] = useState<CDSRule | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<CDSRule>>(blankRule());
  const set = (k: keyof CDSRule, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  // ─── Actions ────────────────────────────────────────────────────────────────

  const openAdd = () => { setForm(blankRule()); setIsAddRuleOpen(true); };
  const openEdit = (r: CDSRule) => { setForm({ ...r }); setEditRule(r); };
  const closeAll = () => { setIsAddRuleOpen(false); setEditRule(null); setDetailRule(null); };

  const handleSave = async () => {
    if (!form.name || !form.condition) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || 'Allergy Alert',
        severity: form.severity || 'MODERATE',
        condition: form.condition,
        message: form.message || '',
        status: form.status || 'Testing',
        creator: 1
      };

      if (editRule) {
        await fetchApi(`/alert/${editRule.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi('/alert', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      closeAll();
      loadRules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save rule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRule = (id: number) => {
    setRules(prev => prev.filter(r => r.id !== id));
    closeAll();
  };

  const toggleStatus = (id: number) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'Active' ? 'Inactive' : r.status === 'Inactive' ? 'Testing' : 'Active';
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  // ─── Selectors ──────────────────────────────────────────────────────────────

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { All: rules.length };
    CATEGORIES.forEach(cat => {
      map[cat] = rules.filter(r => r.category === cat).length;
    });
    return map;
  }, [rules]);

  const filtered = useMemo(() => rules.filter(r => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.condition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  }), [rules, search, activeCategory]);

  // ─── Renderers ──────────────────────────────────────────────────────────────

  const severityBadge = (sev: string) => {
    if (sev === 'SEVERE') return <span className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max bg-rose-500/10 text-rose-600"><AlertCircle size={10} /> {sev}</span>;
    if (sev === 'MODERATE') return <span className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max bg-amber-500/10 text-amber-600"><AlertTriangle size={10} /> {sev}</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max bg-blue-500/10 text-blue-600"><Info size={10} /> {sev}</span>;
  };

  const statusBadge = (status: string) => {
    if (status === 'Active') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max bg-emerald-500/10 text-emerald-600">{status}</span>;
    if (status === 'Testing') return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max bg-blue-500/10 text-blue-600">{status}</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase w-max bg-muted text-muted-foreground">{status}</span>;
  };

  // ─── Form Modal Component ───────────────────────────────────────────────────

  const FormModal = ({ title, onClose }: { title: string; onClose: () => void }) => (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0">
          <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <ShieldAlert size={20} className="text-primary"/> {title}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex justify-between">
              Rule Name <span className="text-[10px] text-rose-500">REQUIRED</span>
            </label>
            <input value={form.name ?? ''} onChange={e => set('name', e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g., Aspirin/Warfarin Interaction Alert" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Severity</label>
              <select value={form.severity} onChange={e => set('severity', e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                {SEVERITIES.map(s => <option key={s} value={s}>{s === 'SEVERE' ? 'SEVERE (Hard Stop)' : s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex justify-between">
              Trigger Condition (JSONLogic or Expression) <span className="text-[10px] text-rose-500">REQUIRED</span>
            </label>
            <textarea value={form.condition ?? ''} onChange={e => set('condition', e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-24 font-mono text-xs resize-none" placeholder='{"and": [{"in": [{"var": "order.drug"}, ["warfarin"]]}, {"in": [{"var": "patient.active_meds"}, ["aspirin"]]}]}' />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Alert Message</label>
            <input value={form.message ?? ''} onChange={e => set('message', e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="High risk of bleeding. Consider alternative." />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.name || !form.condition || isSubmitting} className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : (editRule ? 'Update Rule' : 'Save Rule')}
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Clinical Decision Support</h1>
          <p className="text-muted-foreground text-sm">Configure real-time alerts, rules, and contraindications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search rules..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm" />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} /> New Rule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* Left Sidebar: Rule Categories */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Filter size={16} className="text-primary"/> Categories
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {['All', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${activeCategory === c ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}>
                <span className={`font-medium text-sm ${activeCategory === c ? 'text-primary' : 'text-foreground'}`}>{c}</span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{categoryCounts[c] ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content: Rules Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShieldAlert size={16} className="text-primary"/> {activeCategory === 'All' ? 'All Rules' : activeCategory}
            </h3>
            <span className="text-xs text-muted-foreground">{filtered.length} active rules</span>
          </div>
          <div className="overflow-x-auto flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm shadow-[0_1px_0_var(--border)]">
                <tr className="text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Rule Name</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Trigger Condition</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-sm">
                <AnimatePresence>
                  {filtered.map(row => (
                    <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                      <td className="px-5 py-4 font-bold text-foreground">
                        {row.name}
                        {activeCategory === 'All' && <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{row.category}</div>}
                      </td>
                      <td className="px-5 py-4">{severityBadge(row.severity)}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground break-all max-w-xs">{row.condition}</td>
                      <td className="px-5 py-4" onClick={() => toggleStatus(row.id)} title="Click to toggle status">
                        <div className="cursor-pointer hover:opacity-80 transition-opacity">
                          {statusBadge(row.status)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1">
                        <button onClick={() => setDetailRule(row)} className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10" title="View Details">
                          <Info size={16} />
                        </button>
                        <button onClick={() => openEdit(row)} className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10" title="Edit Rule">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteRule(row.id)} className="text-muted-foreground hover:text-rose-500 transition-colors p-1.5 rounded-md hover:bg-rose-500/10" title="Delete Rule">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">No rules found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isAddRuleOpen && <FormModal title="Create Decision Support Rule" onClose={closeAll} />}
        {editRule && <FormModal title={`Edit: ${editRule.name}`} onClose={closeAll} />}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailRule && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeAll} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden max-h-[90vh]">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <ShieldAlert size={20} className="text-primary"/> Rule Details
                </h2>
                <button onClick={closeAll} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex items-center justify-between">
                  {severityBadge(detailRule.severity)}
                  {statusBadge(detailRule.status)}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground">{detailRule.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{detailRule.category}</p>
                </div>

                <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Trigger Condition</div>
                  <code className="text-xs font-mono text-foreground break-all">{detailRule.condition}</code>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-2">
                  <div className="text-[10px] text-amber-600 uppercase tracking-wider font-bold">Alert Message Displayed to User</div>
                  <p className="text-sm text-foreground">{detailRule.message}</p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border/50">
                  <Activity size={14} />
                  <span>Last Triggered: {detailRule.lastTriggered ?? 'Never'}</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-between gap-3 flex-shrink-0">
                <button onClick={() => { closeAll(); openEdit(detailRule); }} className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  <Edit size={14} /> Edit Rule
                </button>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-md text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                    <Play size={14} /> Test
                  </button>
                  <button onClick={closeAll} className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


