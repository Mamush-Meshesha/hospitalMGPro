import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TestTube, FlaskConical, Play, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchApi } from '../utils/api';

// Mock Lab Order Type
interface LabOrder {
  id: string;
  acc: string;
  patientName: string;
  mrn: string;
  testName: string;
  orderedBy: string;
  priority: string;
  status: string;
}

export default function LaboratoryView() {
  const [activeTab, setActiveTab] = useState('pending');
  const [labs, setLabs] = useState<LabOrder[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await fetchApi('/order');
        const apiOrders = data.results || data || [];
        const formattedLabs = apiOrders
          .filter((o: any) => o.order_type_id === 2) // Lab tests
          .map((o: any) => {
            const personNameObj = o.patient_order_for_patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
            const patientName = personNameObj ? `${personNameObj.given_name} ${personNameObj.family_name}` : `Patient ID: ${o.patient_id}`;
            const testName = o.concept?.reverse_concept_name_name_for_concept?.[0]?.name || o.concept?.short_name || `Concept ID: ${o.concept_id}`;
            
            // Extract the actual Medical Record Number from the identifiers array
            const identifiers = o.patient_order_for_patient?.reverse_patient_identifier_fk_patient_id_patient_identifier || [];
            const actualMrn = identifiers.length > 0 ? identifiers[0].identifier : `MRN-${o.patient_id}`;
            
            return {
              id: o.uuid,
              acc: o.order_number,
              patientName: patientName,
              mrn: actualMrn,
              testName: testName,
              orderedBy: `Provider ID: ${o.orderer}`,
              priority: o.urgency,
              status: (o.fulfiller_status || 'pending').toLowerCase()
            };
          });
        setLabs(formattedLabs);
      } catch (err) {
        console.error("Failed to fetch lab orders:", err);
        setLabs([]);
      }
    };
    fetchOrders();
  }, []);
  
  // Modals state
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  // New Lab Request Form (test_order)
  const [newPatientUuid, setNewPatientUuid] = useState('');
  const [newProviderUuid, setNewProviderUuid] = useState('');
  const [newConceptUuid, setNewConceptUuid] = useState('');
  const [newTargetLab, setNewTargetLab] = useState('');
  const [newPriority, setNewPriority] = useState('Routine');
  const [newSpecimenSource, setNewSpecimenSource] = useState('');
  const [newClinicalHistory, setNewClinicalHistory] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Live Data for Dropdowns
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [providersList, setProvidersList] = useState<any[]>([]);
  const [conceptsList, setConceptsList] = useState<any[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchApi('/patient').then(d => setPatientsList(d.results || d)).catch(console.error);
    fetchApi('/provider').then(d => setProvidersList(d.results || d)).catch(console.error);
    fetchApi('/concept').then(d => setConceptsList(d.results || d)).catch(console.error);
  }, []);

  // Enter Results Form (obs)
  const [obsNumeric1, setObsNumeric1] = useState('');
  const [obsNumeric2, setObsNumeric2] = useState('');
  const [obsComments, setObsComments] = useState('');
  const [markAbnormal, setMarkAbnormal] = useState(false);

  const handleCreateLab = async () => {
    if (!newPatientUuid || !newConceptUuid || !newProviderUuid || !newSpecimenSource) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const data = await fetchApi('/order', {
        method: 'POST',
        body: JSON.stringify({
          patientUuid: newPatientUuid,
          ordererUuid: newProviderUuid,
          conceptUuid: newConceptUuid,
          orderTypeId: 2, // Lab
          urgency: newPriority.toUpperCase(),
          instructions: newInstructions,
          testOrderDetails: { 
            clinicalHistory: newClinicalHistory,
            targetLabConceptUuid: newTargetLab || undefined
          }
        })
      });

      if (data) {
        // Optimistic update
        const patientName = patientsList.find(p => p.uuid === newPatientUuid)?.givenName || 'Added Patient';
        const testName = conceptsList.find(c => c.uuid === newConceptUuid)?.name || 'Lab Test';
        const providerName = providersList.find(p => p.uuid === newProviderUuid)?.name || 'Self';
        
        const newLab: LabOrder = {
          id: data.uuid || Date.now().toString(),
          acc: `LAB-${Math.floor(Math.random() * 90000) + 10000}`,
          mrn: data.patient_id?.toString() || 'Unknown',
          patientName: patientName,
          testName: testName,
          orderedBy: providerName,
          priority: newPriority as 'Routine' | 'STAT',
          status: 'pending'
        };
        setLabs([newLab, ...labs]);
        setIsAddLabOpen(false);
        setNewPatientUuid(''); setNewConceptUuid(''); setNewProviderUuid(''); setNewTargetLab('');
        setNewPriority('Routine'); setNewSpecimenSource(''); setNewClinicalHistory(''); setNewInstructions('');
        toast.success('Lab order created successfully');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create lab order');
      console.error(e);
    }
  };

  const handleStartProcessing = async (id: string) => {
    try {
      await fetchApi(`/order/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fulfiller_status: 'PROCESSING' })
      });
      setLabs(labs.map(l => l.id === id ? { ...l, status: 'processing' } : l));
      toast.success('Specimen processing started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start processing');
    }
  };

  const handleSubmitResults = async () => {
    if (selectedLabId) {
      const payload = {
        resultValue: obsNumeric1, // Using obsNumeric1 as the main result value
        comments: obsComments,
        abnormal: markAbnormal
      };

      try {
        const data = await fetchApi(`/order/${selectedLabId}/lab-result`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        
        if (data) {
          setLabs(labs.map(l => l.id === selectedLabId ? { ...l, status: 'completed' } : l));
          setSelectedLabId(null);
          setObsNumeric1(''); setObsNumeric2(''); setObsComments(''); setMarkAbnormal(false);
          setActiveTab('completed');
          toast.success('Lab results submitted successfully');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to submit lab results');
        console.error(err);
      }
    }
  };

  const displayLabs = labs.filter(l => l.status === activeTab);
  const selectedLab = labs.find(l => l.id === selectedLabId);

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Laboratory</h1>
          <p className="text-muted-foreground text-sm">Specimen tracking and result entry</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by accession # or patient..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
          <button 
            onClick={() => setIsAddLabOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Lab Request
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border px-2">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'pending' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Pending Specimens ({labs.filter(l => l.status === 'pending').length})
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('processing')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'processing' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          In Processing ({labs.filter(l => l.status === 'processing').length})
          {activeTab === 'processing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'completed' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Completed Results ({labs.filter(l => l.status === 'completed').length})
          {activeTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Accession #</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Test Ordered</th>
                <th className="px-5 py-3">Ordered By</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground text-sm">
              <AnimatePresence>
                {displayLabs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      No labs found in this queue.
                    </td>
                  </tr>
                ) : (
                  displayLabs.map((row) => (
                    <motion.tr 
                      key={row.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => navigate(`/lab/${row.id}`)}
                      className="hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4 font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <TestTube size={16} className="text-muted-foreground" />
                          {row.acc}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium">{row.patientName} <span className="text-muted-foreground text-xs font-normal">({row.mrn})</span></td>
                      <td className="px-5 py-4 text-muted-foreground">{row.testName}</td>
                      <td className="px-5 py-4 text-muted-foreground">{row.orderedBy}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.priority === 'STAT' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                        }`}>
                          {row.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {row.status === 'pending' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStartProcessing(row.id); }}
                            className="px-3 py-1.5 bg-muted text-foreground border border-border rounded text-xs font-medium hover:bg-muted/80 transition-colors shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <Play size={12} /> Start Processing
                          </button>
                        )}
                        {row.status === 'processing' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedLabId(row.id); }}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm ml-auto"
                          >
                            Enter Results
                          </button>
                        )}
                        {row.status === 'completed' && (
                          <div className="flex items-center justify-end gap-1 text-emerald-600 font-medium text-xs">
                            <CheckCircle2 size={14} /> Completed
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lab Request Modal */}
      <AnimatePresence>
        {isAddLabOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLabOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <FlaskConical size={20} className="text-primary"/> New Lab Request
                </h2>
                <button 
                  onClick={() => setIsAddLabOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Patient <span className="text-[10px] text-destructive ml-1">*</span>
                  </label>
                  <select value={newPatientUuid} onChange={e => setNewPatientUuid(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select Patient...</option>
                    {patientsList.map(p => (
                      <option key={p.uuid} value={p.uuid}>{p.givenName} {p.familyName}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Ordering Provider <span className="text-[10px] text-destructive ml-1">*</span>
                  </label>
                  <select value={newProviderUuid} onChange={e => setNewProviderUuid(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select Provider...</option>
                    {providersList.map(p => (
                      <option key={p.uuid} value={p.uuid}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Test Type (Concept) <span className="text-[10px] text-destructive ml-1">*</span>
                  </label>
                  <select value={newConceptUuid} onChange={e => setNewConceptUuid(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select Test...</option>
                    {conceptsList.map(c => (
                      <option key={c.uuid} value={c.uuid}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Target Lab (Routing) <span className="text-[10px] text-muted-foreground ml-1">Optional</span>
                  </label>
                  <select value={newTargetLab} onChange={e => setNewTargetLab(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Main Campus Laboratory (Default)</option>
                    <option value="STAT-LAB-UUID">STAT / Emergency Lab</option>
                    <option value="MICRO-LAB-UUID">Microbiology Lab</option>
                    <option value="PATH-LAB-UUID">Pathology Lab</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Specimen Source * <span className="text-[10px] text-muted-foreground font-normal">test_order.specimen_source</span>
                    </label>
                    <select value={newSpecimenSource} onChange={e => setNewSpecimenSource(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="">Select Source...</option>
                      <option value="Blood">Blood (Venous)</option>
                      <option value="Urine">Urine</option>
                      <option value="Swab">Swab</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Priority (Urgency)</label>
                    <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="Routine">Routine</option>
                      <option value="STAT">STAT (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Clinical History <span className="text-[10px] text-muted-foreground font-normal">Mapped to test_order.clinical_history</span>
                  </label>
                  <textarea value={newClinicalHistory} onChange={e => setNewClinicalHistory(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-16" placeholder="Suspected infection..." />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Special Instructions <span className="text-[10px] text-muted-foreground font-normal">Mapped to orders.instructions</span>
                  </label>
                  <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-16" placeholder="e.g., Fasting required for 12 hours..." />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddLabOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateLab}
                  disabled={!newPatientUuid || !newConceptUuid || !newProviderUuid || !newSpecimenSource}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Enter Results Modal */}
      <AnimatePresence>
        {selectedLab && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLabId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <TestTube size={20} className="text-primary"/> Enter Lab Results
                </h2>
                <button 
                  onClick={() => setSelectedLabId(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{selectedLab.testName}</div>
                    <div className="text-xs text-muted-foreground">Accession {selectedLab.acc} • {selectedLab.patientName}</div>
                  </div>
                  {selectedLab.priority === 'STAT' && (
                    <div className="px-2 py-1 bg-destructive/10 text-destructive text-[10px] font-bold rounded uppercase">STAT</div>
                  )}
                </div>

                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 mt-4">Mapped to obs table</div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Numeric Value 1 <span className="text-[9px] text-muted-foreground font-normal">obs.value_numeric</span>
                    </label>
                    <input type="number" value={obsNumeric1} onChange={e => setObsNumeric1(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. 14.5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Numeric Value 2 <span className="text-[9px] text-muted-foreground font-normal">obs.value_numeric</span>
                    </label>
                    <input type="number" value={obsNumeric2} onChange={e => setObsNumeric2(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g. 4.2" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Pathologist Notes <span className="text-[9px] text-muted-foreground font-normal">obs.comments / value_text</span>
                  </label>
                  <textarea value={obsComments} onChange={e => setObsComments(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-20 resize-none" placeholder="Add interpretation or observations..." />
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="markAbnormal" checked={markAbnormal} onChange={e => setMarkAbnormal(e.target.checked)} className="rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="markAbnormal" className="text-xs font-medium text-destructive">Flag as Abnormal/Critical</label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedLabId(null)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitResults}
                  disabled={!obsNumeric1 && !obsComments}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
