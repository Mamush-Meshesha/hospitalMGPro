import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, Filter, Download, Receipt, ArrowUpRight, X, CheckCircle2, Plus, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface Invoice {
  uuid: string;
  inv: string;
  name: string;
  desc: string;
  amount: number;
  status: 'PENDING' | 'PAID' | string;
  cashPointId: number;
  date: string;
  lineItems: any[];
  payments: any[];
}

export default function BillingView() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Tabs & RBAC
  const [activeTab, setActiveTab] = useState<'invoices' | 'settings'>('invoices');
  const [assignedCashPoint, setAssignedCashPoint] = useState<number | null>(null);
  
  // Settings State
  const [configRules, setConfigRules] = useState<any>({ "1": 2, "2": 3, "3": 3 });
  const [cashPoints, setCashPoints] = useState<any[]>([]);
  const [cashierUserId, setCashierUserId] = useState('1'); // Mock user selector
  const [cashierAssignPoint, setCashierAssignPoint] = useState('all');
  
  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('1'); // Default to first payment mode (Cash)
  const [amountPaid, setAmountPaid] = useState('');
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter State
  const [cashPointId, setCashPointId] = useState<string>('all');

  // Patients Data
  const [patients, setPatients] = useState<any[]>([]);

  // Generate Bill State
  const [isGenerateBillOpen, setIsGenerateBillOpen] = useState(false);
  const [newBillPatient, setNewBillPatient] = useState('');
  const [newBillService, setNewBillService] = useState('1');
  const [newBillPrice, setNewBillPrice] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Derived KPIs
  const pendingCount = useMemo(() => invoices.filter(i => i.status === 'PENDING').length, [invoices]);
  const collectedToday = useMemo(() => invoices.filter(i => i.status === 'PAID').reduce((acc, curr) => acc + curr.amount, 0), [invoices]);

  const fetchBills = async (cpList = cashPoints) => {
    setLoading(true);
    try {
      const data = await fetchApi('/billing');
      const mapped = data.results?.map((bill: any) => {
        const total = bill.cashier_bill_line_item?.reduce((sum: number, item: any) => sum + Number(item.price), 0) || 0;
        const paid = bill.cashier_bill_payment?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
        return {
          uuid: bill.uuid,
          inv: bill.receipt_number || `INV-${bill.bill_id}`,
          name: (bill.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.given_name || '').trim() + ' ' + 
                (bill.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.family_name || 'Unknown Patient').trim(),
          desc: (bill.cashier_bill_line_item?.[0]?.cashier_billable_service?.name || 'Medical Services') + 
                (cpList.length > 0 ? ` (${cpList.find((cp: any) => cp.cash_point_id === bill.cash_point_id)?.name || 'General'})` : ''),
          amount: total,
          status: paid >= total && total > 0 ? 'PAID' : bill.status,
          cashPointId: bill.cash_point_id,
          date: new Date(bill.date_created).toLocaleString(),
          lineItems: bill.cashier_bill_line_item || [],
          payments: bill.cashier_bill_payment || []
        };
      }) || [];
      setInvoices(mapped);
      setAssignedCashPoint(data.assignedCashPoint || null);
      if (data.assignedCashPoint) {
        setCashPointId(data.assignedCashPoint.toString());
      }
      
      const patientsData = await fetchApi('/patient');
      setPatients(patientsData.results || []);
    } catch (error) {
      console.error("Failed to fetch bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const data = await fetchApi('/billing/config');
      if (data.result?.rules?.rules) {
        setConfigRules(data.result.rules.rules);
      }
      if (data.result?.cashPoints) {
        setCashPoints(data.result.cashPoints);
        return data.result.cashPoints;
      }
      return [];
    } catch (e) { 
      console.error(e); 
      return [];
    }
  };

  useEffect(() => {
    fetchConfig().then((cps) => fetchBills(cps));
  }, []);

  const handleOpenPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAmountPaid(invoice.amount.toString());
  };

  const handleProcessPayment = async () => {
    if (selectedInvoice && amountPaid) {
      setIsProcessing(true);
      try {
        await fetchApi(`/billing/${selectedInvoice.uuid}/pay`, {
          method: 'POST',
          body: JSON.stringify({
            amount: Number(amountPaid),
            amountTendered: Number(amountPaid),
            paymentModeId: Number(paymentMethod),
            creator: 1
          })
        });
        
        setSelectedInvoice(null);
        setPaymentMethod('1');
        setAmountPaid('');
        setReference('');
        fetchBills();
      } catch (err: any) {
        toast.error("Payment failed: " + err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleGenerateBill = async () => {
    if (!newBillPatient || !newBillPrice) return toast.error("Please fill in required fields.");
    setIsGenerating(true);
    try {
      await fetchApi(`/billing/generate`, {
        method: 'POST',
        body: JSON.stringify({
          patientId: Number(newBillPatient), // using patient ID for now
          providerId: 1,
          cashPointId: 1,
          creator: 1,
          items: [{ serviceId: Number(newBillService), quantity: 1, price: Number(newBillPrice) }]
        })
      });
      setIsGenerateBillOpen(false);
      setNewBillPatient('');
      setNewBillPrice('');
      fetchBills();
    } catch (err: any) {
      toast.error("Failed to generate bill: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Cashier</h1>
          <p className="text-muted-foreground mt-1">Manage patient invoices and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card rounded-lg p-1 border border-border flex text-sm">
             <button 
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'invoices' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
             >
                Invoices
             </button>
             {/* Show Settings tab always for demo so user can unassign themselves */}
             <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
             >
                <Settings className="w-4 h-4" />
                Configurations
             </button>
          </div>
          <button 
            onClick={() => setIsGenerateBillOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus size={16} /> Generate Bill
          </button>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <>
          {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Receipt size={20} />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{pendingCount}</span>
          <span className="block text-sm text-muted-foreground mt-1">Pending Invoices</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CreditCard size={20} />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">${collectedToday.toFixed(2)}</span>
          <span className="block text-sm text-muted-foreground mt-1">Collected Today</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">$0.00</span>
          <span className="block text-sm text-muted-foreground mt-1">Outstanding Insurance Claims</span>
        </div>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-semibold text-card-foreground">Recent Invoices</h2>
        </div>

        {/* Filter Group */}
        {!assignedCashPoint && (
          <div className="px-5 pt-4 flex gap-4">
            <select
              value={cashPointId}
              onChange={(e) => setCashPointId(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800"
            >
              <option value="all">All Cash Points</option>
              {cashPoints.map(cp => (
                <option key={cp.cash_point_id} value={cp.cash_point_id}>{cp.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground animate-pulse">Loading Bills...</div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Receipt size={32} className="opacity-20 mb-2" />
              <p>No invoices found in the system.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-sm">
                <AnimatePresence>
                  {invoices
                    .filter(inv => cashPointId === 'all' || inv.cashPointId === Number(cashPointId))
                    .map((row) => (
                    <motion.tr
                      key={row.uuid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      className={`transition-colors group ${row.status === 'PAID' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-muted/50'}`}
                    >
                      <td className="px-5 py-3.5 font-semibold text-primary">{row.inv}</td>
                      <td className="px-5 py-3.5 font-medium">{row.name}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{row.desc}</td>
                      <td className="px-5 py-3.5 font-semibold">${row.amount.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => navigate(`/billing/${row.uuid}`)} 
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground border border-border rounded text-xs font-medium hover:bg-secondary/80 transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          View Details
                        </button>
                        {row.status === 'PENDING' ? (
                          <button onClick={() => handleOpenPayment(row)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm">
                            Process Payment
                          </button>
                        ) : (
                          <button disabled className="px-3 py-1.5 bg-transparent text-emerald-600 border border-emerald-500/20 rounded text-xs font-medium cursor-default inline-flex items-center gap-1">
                            <CheckCircle2 size={14} /> Paid
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
      </>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-8 animate-in fade-in">
          <div>
             <h2 className="text-xl font-bold text-foreground">Global Service Routing</h2>
             <p className="text-muted-foreground text-sm mb-4">Map clinical order types to their default finance cash point.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: '1', label: 'Pharmacy Orders (Drugs)' },
                  { id: '2', label: 'Laboratory Orders (Tests)' },
                  { id: '3', label: 'Radiology Orders (Imaging)' },
                ].map(type => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
                     <span className="font-medium text-foreground text-sm">{type.label}</span>
                     <select 
                       value={configRules[type.id] || '1'} 
                       onChange={(e) => setConfigRules({...configRules, [type.id]: Number(e.target.value)})}
                       className="bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
                     >
                       {cashPoints.map(cp => (
                         <option key={cp.cash_point_id} value={cp.cash_point_id}>{cp.name}</option>
                       ))}
                     </select>
                  </div>
                ))}
             </div>
             <div className="mt-4 flex justify-end">
                <button 
                  onClick={async () => {
                    try {
                      await fetchApi('/billing/routing', { method: 'POST', body: JSON.stringify({ defaultCashPointId: 1, rules: configRules }) });
                      toast.success('Routing rules saved successfully!');
                    } catch(e: any) { toast.error(e.message); }
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm shadow-sm"
                >
                  Save Routing Rules
                </button>
             </div>
          </div>
          
          <hr className="border-border" />
          
          <div>
             <h2 className="text-xl font-bold text-foreground">Cashier Assignment (RBAC)</h2>
             <p className="text-muted-foreground text-sm mb-4">Lock a user's view to only see bills from a specific cash point.</p>
             <div className="flex gap-4 items-end bg-muted p-4 rounded-lg border border-border">
                <div className="flex-1 space-y-1">
                   <label className="text-xs font-medium text-muted-foreground">Select User</label>
                   <select 
                     value={cashierUserId}
                     onChange={(e) => setCashierUserId(e.target.value)}
                     className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                   >
                     <option value="1">Dr. Admin (User ID: 1)</option>
                     <option value="2">Pharmacist (User ID: 2)</option>
                   </select>
                </div>
                <div className="flex-1 space-y-1">
                   <label className="text-xs font-medium text-muted-foreground">Assign to Cash Point</label>
                   <select 
                     value={cashierAssignPoint}
                     onChange={(e) => setCashierAssignPoint(e.target.value)}
                     className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                   >
                     <option value="all">Unassigned (Global Access)</option>
                     {cashPoints.map(cp => (
                       <option key={cp.cash_point_id} value={cp.cash_point_id}>{cp.name}</option>
                     ))}
                   </select>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      await fetchApi('/billing/assign-cashier', { 
                        method: 'POST', 
                        body: JSON.stringify({ userId: Number(cashierUserId), cashPointId: cashierAssignPoint === 'all' ? null : Number(cashierAssignPoint) }) 
                      });
                      toast.success('Assignment saved! User must refresh to see changes.');
                    } catch(e: any) { toast.error(e.message); }
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm shadow-sm whitespace-nowrap"
                >
                  Save Assignment
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Generate Bill Modal */}
      <AnimatePresence>
        {isGenerateBillOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGenerateBillOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Receipt size={20} className="text-primary" /> Generate New Bill
                </h2>
                <button onClick={() => setIsGenerateBillOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Select Patient *</label>
                  <select 
                    value={newBillPatient} 
                    onChange={e => setNewBillPatient(e.target.value)} 
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Select a patient...</option>
                    {patients.map(p => {
                      const fullName = p.givenName && p.familyName 
                        ? `${p.givenName} ${p.familyName}` 
                        : 'Unknown Patient';
                      return (
                        <option key={p.personId} value={p.personId}>
                          {fullName} (MRN: {p.personId})
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-medium text-foreground">Service Type</label>
                  <select value={newBillService} onChange={e => setNewBillService(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="1">Consultation Fee</option>
                    <option value="2">Overnight Bed Fee</option>
                    <option value="3">Lab Test</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Price ($) *</label>
                  <input type="number" value={newBillPrice} onChange={e => setNewBillPrice(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Amount..." />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button onClick={() => setIsGenerateBillOpen(false)} className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={handleGenerateBill} disabled={!newBillPatient || !newBillPrice || isGenerating} className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGenerating ? "Generating..." : "Generate Bill"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Process Payment Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" /> Process Payment
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border text-center space-y-1">
                  <div className="text-xs text-muted-foreground">Amount Due</div>
                  <div className="text-3xl font-bold text-foreground">${selectedInvoice.amount.toFixed(2)}</div>
                  <div className="text-sm font-medium">{selectedInvoice.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedInvoice.desc}</div>
                </div>

                <div className="space-y-1.5 mt-2">
                  <label className="text-xs font-medium text-foreground">Payment Method</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="1">Cash</option>
                    <option value="2">Credit Card</option>
                    <option value="3">Mobile Money</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Amount Paid ($)</label>
                    <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Reference ID (Optional)</label>
                    <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Txn ID" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={!amountPaid || isProcessing}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isProcessing ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
