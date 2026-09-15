import React, { useState, useEffect } from 'react';
import { Pill, Search, Filter, AlertTriangle, CheckCircle2, Clock, Printer, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';
import { printDocument } from '../utils/print';

// Mock Order Type
interface PharmacyOrder {
  id: string;
  mrn: string;
  patientName: string;
  drugName: string;
  instructions: string;
  status: 'NEW' | 'PREPARING' | 'DISPENSED';
  time: string;
  isStat?: boolean;
}

const initialOrders: PharmacyOrder[] = [
  { id: '1', mrn: 'MRN-10042', patientName: 'James Wilson', drugName: 'Metoprolol Tartrate 25mg', instructions: '1 tablet PO twice a day (Dispense: 60)', status: 'NEW', time: '10m ago' },
  { id: '2', mrn: 'MRN-08991', patientName: 'Sarah Connor', drugName: 'Epinephrine 1mg/1mL', instructions: '0.3mg IM once (Dispense: 1 vial)', status: 'NEW', time: 'STAT', isStat: true },
  { id: '3', mrn: 'MRN-09923', patientName: 'Emma Stone', drugName: 'Amoxicillin 500mg', instructions: '1 capsule PO every 8 hours (Dispense: 21)', status: 'PREPARING', time: '30m ago' }
];

export default function PharmacyQueueView() {
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [queueId, setQueueId] = useState<number | null>(null);

  useEffect(() => {
    const initQueue = async () => {
      try {
        const data = await fetchApi(`/order/pharmacy-queue?v=full`);
        const apiOrders = data.results || data || [];
        const formatted = apiOrders
          .map((entry: any) => {
            const patientNameObj = entry.patient_order_for_patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
            const conceptNameObj = entry.concept?.reverse_concept_name_name_for_concept?.[0];
            const drugObj = entry.reverse_drug_order_extends_order?.[0]?.drug_inventory_item;
            
            return {
              id: entry.uuid,
              mrn: `MRN-${entry.patient_id}`,
              patientName: patientNameObj ? `${patientNameObj.given_name} ${patientNameObj.family_name}` : `Patient #${entry.patient_id}`,
              drugName: drugObj?.name || conceptNameObj?.name || (entry.concept_id ? `Concept ID: ${entry.concept_id}` : 'Unknown Drug'),
              instructions: entry.instructions || 'See CPOE for details',
              status: entry.fulfiller_status === 'COMPLETED' ? 'DISPENSED' : entry.fulfiller_status === 'IN_PROGRESS' ? 'PREPARING' : 'NEW',
              time: new Date(entry.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isStat: entry.urgency === 'STAT'
            };
          });
        setOrders(formatted.length > 0 ? formatted : initialOrders);
      } catch (e) {
        console.error("Failed to fetch queue", e);
        setOrders(initialOrders);
      }
    };
    initQueue();
  }, []);

  // medication_dispense form state
  const [dispenser, setDispenser] = useState('');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityUnits, setQuantityUnits] = useState('');
  const [dose, setDose] = useState('');
  const [doseUnits, setDoseUnits] = useState('');
  const [route, setRoute] = useState('');
  const [frequency, setFrequency] = useState('');

  const handlePrepare = async (id: string) => {
    try {
      await fetchApi(`/order/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fulfiller_status: 'IN_PROGRESS' })
      });
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'PREPARING' } : o));
      toast.success('Order preparation started');
    } catch (e: any) {
      toast.error(e.message || 'Failed to start preparation');
      console.error(e); 
    }
  };

  const handleOpenDispense = (order: PharmacyOrder) => {
    setSelectedOrder(order);
  };

  const handleSubmitDispense = async () => {
    if (selectedOrder) {
      try {
        await fetchApi(`/order/${selectedOrder.id}`, {
          method: 'PUT',
          body: JSON.stringify({ fulfiller_status: 'COMPLETED' })
        });
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'DISPENSED' } : o));
        setSelectedOrder(null);
        // Reset form
        setDispenser(''); setLocationId(''); setQuantity(''); setQuantityUnits('');
        setDose(''); setDoseUnits(''); setRoute(''); setFrequency('');
        toast.success('Order dispensed successfully');
      } catch (e: any) { 
        toast.error(e.message || 'Failed to dispense order');
        console.error(e); 
      }
    }
  };

  const newOrders = orders.filter(o => o.status === 'NEW');
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const dispensedOrders = orders.filter(o => o.status === 'DISPENSED');

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Pharmacy Queue</h1>
          <p className="text-muted-foreground text-sm">Real-time CPOE Order Dispensing</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search by MRN, Drug, or Patient..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Kanban Board Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-[500px]">
        
        {/* Column 1: New Orders */}
        <div className="flex flex-col bg-muted/20 border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border bg-card flex justify-between items-center shadow-sm z-10">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span> New Orders
            </h3>
            <span className="text-xs font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">{newOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <AnimatePresence>
              {newOrders.map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className={`bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${order.isStat ? 'border-l-2 border-l-destructive' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{order.mrn}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${order.isStat ? 'text-destructive bg-destructive/10' : 'text-amber-600 bg-amber-500/10'}`}>
                      {order.isStat ? <AlertTriangle size={10} /> : <Clock size={10} />} {order.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground">{order.drugName}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{order.instructions}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <span className="text-xs font-medium text-foreground">{order.patientName}</span>
                    <button 
                      onClick={() => handlePrepare(order.id)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      Prepare
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

          </div>
        </div>

        {/* Column 2: In Preparation */}
        <div className="flex flex-col bg-muted/20 border border-border rounded-xl overflow-hidden">
          <div className="p-3 border-b border-border bg-card flex justify-between items-center shadow-sm z-10">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span> In Preparation
            </h3>
            <span className="text-xs font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{preparingOrders.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <AnimatePresence>
              {preparingOrders.map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{order.mrn}</span>
                  </div>
                  <h4 className="font-bold text-foreground">{order.drugName}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{order.instructions}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={printDocument} className="flex-1 py-1.5 bg-card hover:bg-muted border border-border rounded text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5 no-print">
                      <Printer size={12} /> Print Label
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                    <span className="text-xs font-medium text-foreground">{order.patientName}</span>
                    <button 
                      onClick={() => handleOpenDispense(order)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Verify & Dispense
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

          </div>
        </div>

        {/* Column 3: Dispensed */}
        <div className="flex flex-col bg-muted/20 border border-border rounded-xl overflow-hidden opacity-80">
          <div className="p-3 border-b border-border bg-card flex justify-between items-center shadow-sm z-10">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Dispensed
            </h3>
            <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">{dispensedOrders.length} Today</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            <AnimatePresence>
              {dispensedOrders.map((order) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="bg-card/50 border border-border rounded-lg p-4 cursor-default"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{order.mrn}</span>
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm line-through decoration-muted-foreground/30">{order.drugName}</h4>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{order.patientName}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">{order.time}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
          </div>
        </div>

      </div>

      {/* Medication Dispense Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-emerald-500/10">
                <h2 className="font-semibold text-lg text-emerald-700 flex items-center gap-2">
                  <ShieldCheck size={20} /> Verify & Record Dispense
                </h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Order Summary (Readonly mapping to drug_order) */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Order Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Patient</div>
                      <div className="font-medium text-sm text-foreground">{selectedOrder.patientName} ({selectedOrder.mrn})</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Prescribed Drug</div>
                      <div className="font-medium text-sm text-foreground">{selectedOrder.drugName}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground">Original Instructions</div>
                      <div className="font-medium text-sm text-foreground">{selectedOrder.instructions}</div>
                    </div>
                  </div>
                </div>

                {/* Dispense Form (Mapping to medication_dispense) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Pill size={14} /> Dispense Record
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Dispensed By (Provider) *</label>
                      <select 
                        value={dispenser}
                        onChange={(e) => setDispenser(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none"
                      >
                        <option value="">Select Provider...</option>
                        <option value="1">Dr. House</option>
                        <option value="2">Pharm. Smith</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Location *</label>
                      <select 
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none"
                      >
                        <option value="">Select Location...</option>
                        <option value="1">Main Pharmacy</option>
                        <option value="2">Outpatient Pharmacy</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Total Quantity *</label>
                      <div className="flex gap-2">
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none" placeholder="e.g. 60" />
                        <select value={quantityUnits} onChange={e => setQuantityUnits(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none">
                          <option value="">Units</option>
                          <option value="tabs">Tabs</option>
                          <option value="caps">Capsules</option>
                          <option value="ml">mL</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Dose *</label>
                      <div className="flex gap-2">
                        <input type="number" value={dose} onChange={e => setDose(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none" placeholder="e.g. 1" />
                        <select value={doseUnits} onChange={e => setDoseUnits(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none">
                          <option value="">Units</option>
                          <option value="mg">mg</option>
                          <option value="g">g</option>
                          <option value="ml">mL</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Route</label>
                      <select value={route} onChange={e => setRoute(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none">
                        <option value="">Select Route...</option>
                        <option value="PO">Oral (PO)</option>
                        <option value="IV">Intravenous (IV)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Frequency</label>
                      <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary outline-none appearance-none">
                        <option value="">Select Frequency...</option>
                        <option value="BID">BID (Twice a day)</option>
                        <option value="TID">TID (Three times a day)</option>
                        <option value="STAT">STAT (Immediately)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitDispense}
                  disabled={!dispenser || !locationId || !quantity}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm & Dispense
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
