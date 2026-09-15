import React, { useState, useEffect } from 'react';
import { Search, Plus, AlertTriangle, Pill, Stethoscope, TestTube, ChevronDown, CheckCircle2, History, X, FilePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

export default function CPOEView() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real data state
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  
  const [concepts, setConcepts] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);
  
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Modal / Form state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [orderType, setOrderType] = useState<'drug' | 'test'>('drug');
  
  const [formEncounterUuid, setFormEncounterUuid] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formDose, setFormDose] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  // Load patients and concepts on mount
  useEffect(() => {
    fetchApi('/patient')
      .then(res => {
        const list = res.results || res || [];
        setPatients(list);
        if (list.length > 0) setSelectedPatient(list[0]);
      })
      .catch(console.error);

    fetchApi('/concept?v=full')
      .then(res => setConcepts(res.results || res || []))
      .catch(console.error);
  }, []);

  // Load active orders & encounters for selected patient
  useEffect(() => {
    if (!selectedPatient?.uuid) return;
    
    fetchApi(`/encounter/patient/${selectedPatient.uuid}`)
      .then(res => setEncounters(res.results || res || []))
      .catch(() => setEncounters([]));

    setLoadingOrders(true);
    fetchApi(`/order?patientUuid=${selectedPatient.uuid}`)
      .then(res => setActiveOrders(res.results || res || []))
      .catch(() => setActiveOrders([]))
      .finally(() => setLoadingOrders(false));
      
  }, [selectedPatient]);

  const handleOpenOrderModal = (concept: any, type: 'drug' | 'test') => {
    setSelectedConcept(concept);
    setOrderType(type);
    setFormEncounterUuid('');
    setFormInstructions('');
    setFormDose('');
    setIsOrderModalOpen(true);
  };

  const handleOrderSubmit = async () => {
    if (!selectedPatient || !selectedConcept) return;
    setIsSaving(true);
    try {
      await fetchApi('/order', {
        method: 'POST',
        body: JSON.stringify({
          patientUuid: selectedPatient.uuid,
          encounterUuid: formEncounterUuid || undefined,
          conceptUuid: selectedConcept.uuid,
          orderTypeId: orderType === 'drug' ? 1 : 2,
          urgency: "ROUTINE",
          instructions: formInstructions,
          testOrderDetails: orderType === 'test' ? { clinicalHistory: formInstructions } : undefined,
          drugOrderDetails: orderType === 'drug' ? { 
            dose: formDose ? parseFloat(formDose) : undefined, 
            dosingInstructions: formInstructions 
          } : undefined
        })
      });
      setIsOrderModalOpen(false);
      // Refresh active orders
      fetchApi(`/order?patientUuid=${selectedPatient.uuid}`)
        .then(res => setActiveOrders(res.results || res || []))
        .catch(console.error);
    } catch (e: any) {
      toast.error(`Failed to submit order: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter concepts based on search
  const filteredConcepts = concepts.filter(c => {
    const name = c.reverse_concept_name_name_for_concept?.[0]?.name || c.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }).slice(0, 15); // Show top 15 results

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">CPOE Engine</h1>
        <p className="text-muted-foreground text-sm">Computerized Provider Order Entry & Prescribing</p>
      </div>

      {/* Patient Context Banner */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {selectedPatient ? (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {(selectedPatient.givenName || '?').charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {selectedPatient.givenName} {selectedPatient.familyName} 
                <span className="text-sm font-normal text-muted-foreground ml-2">MRN-{String(selectedPatient.personId).padStart(5, '0')}</span>
              </h2>
              <p className="text-sm text-muted-foreground">{selectedPatient.gender} • DOB: {selectedPatient.birthdate ? new Date(selectedPatient.birthdate).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">Select a patient to begin ordering...</div>
        )}
        
        <div className="flex items-center gap-4">
          <select 
            className="px-4 py-2 bg-muted/50 border border-border rounded-md text-sm outline-none focus:border-primary text-foreground"
            value={selectedPatient?.uuid || ''}
            onChange={(e) => {
              const pat = patients.find(p => p.uuid === e.target.value);
              setSelectedPatient(pat);
            }}
          >
            {patients.map(p => (
              <option key={p.uuid} value={p.uuid}>
                {p.givenName} {p.familyName} (MRN-{String(p.personId).padStart(5, '0')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout: Order Entry (Left) + Active Orders (Right) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        
        {/* Order Entry Panel */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Search / Order Catalog */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[600px]">
            <div className="p-4 border-b border-border bg-muted/20">
              <h3 className="font-semibold text-foreground mb-3">Order Catalog</h3>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medications, labs, or procedures..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
                />
              </div>
            </div>

            {/* Catalog Results */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {filteredConcepts.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <p>No catalog items found matching your search.</p>
                </div>
              ) : filteredConcepts.map((concept, idx) => {
                const name = concept.reverse_concept_name_name_for_concept?.[0]?.name || concept.name || `Concept #${concept.concept_id}`;
                const isDrug = name.toLowerCase().includes('mg') || name.toLowerCase().includes('amoxicillin') || name.toLowerCase().includes('ibuprofen') || name.toLowerCase().includes('vaccine');
                const isTest = !isDrug;
                return (
                  <div key={idx} className="p-3 border border-border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center ${isDrug ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {isDrug ? <Pill size={16} /> : <TestTube size={16} />}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{isDrug ? 'Medication' : 'Lab Test / Procedure'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenOrderModal(concept, isDrug ? 'drug' : 'test')}
                      className="text-xs font-semibold px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
                    >
                      Order
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Orders Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <History size={18} className="text-primary"/> Active Orders
              </h3>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{activeOrders.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingOrders ? (
                <p className="text-sm text-muted-foreground text-center py-4 animate-pulse">Loading orders...</p>
              ) : activeOrders.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <FilePlus size={32} className="opacity-20 mb-3" />
                  <p className="text-sm">No active orders</p>
                </div>
              ) : activeOrders.map((ord: any, i: number) => {
                const conceptName = ord.concept?.reverse_concept_name_name_for_concept?.[0]?.name || `Concept #${ord.concept_id}`;
                const isDrugOrder = ord.order_type_id === 1 || ord.reverse_drug_order_extends_order?.length > 0;
                
                return (
                  <div key={ord.uuid || i} className="bg-background border border-border rounded-lg p-3 relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDrugOrder ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-medium text-foreground text-sm pr-4">{conceptName}</p>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">
                          {ord.urgency || 'ROUTINE'}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {ord.instructions || ord.reverse_drug_order_extends_order?.[0]?.dosing_instructions || ord.reverse_test_order_test_order_order_id_fk?.[0]?.clinical_history || 'No instructions provided.'}
                      </p>
                      
                      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" /> Active
                        </span>
                        <span>Ordered: {new Date(ord.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Entry Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedConcept && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsOrderModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden flex flex-col"
            >
              <div className={`px-6 py-4 border-b border-border flex items-center justify-between ${orderType === 'drug' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  {orderType === 'drug' ? <Pill className="text-indigo-500"/> : <TestTube className="text-emerald-500" />}
                  Place {orderType === 'drug' ? 'Medication' : 'Lab/Imaging'} Order
                </h2>
                <button onClick={() => setIsOrderModalOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-background rounded-md p-1 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedConcept.reverse_concept_name_name_for_concept?.[0]?.name || selectedConcept.name || `Concept #${selectedConcept.concept_id}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Patient: {selectedPatient?.givenName} {selectedPatient?.familyName}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Encounter / Visit (Optional)</label>
                  <select 
                    value={formEncounterUuid}
                    onChange={(e) => setFormEncounterUuid(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                  >
                    <option value="">No Encounter (Standalone Order)</option>
                    {encounters.map(enc => (
                      <option key={enc.uuid} value={enc.uuid}>
                        {new Date(enc.encounter_datetime).toLocaleString()} — {enc.encounter_type_encounter_type_id?.name || 'Encounter'}
                      </option>
                    ))}
                  </select>
                </div>

                {orderType === 'drug' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Dose (Optional)</label>
                      <input 
                        type="number" 
                        value={formDose}
                        onChange={(e) => setFormDose(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    {orderType === 'drug' ? 'Dosing Instructions' : 'Clinical History / Indications'}
                  </label>
                  <textarea 
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Enter instructions..."
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all resize-none h-24"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end gap-3">
                <button 
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleOrderSubmit}
                  disabled={isSaving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Submitting...' : 'Sign & Submit Order'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
