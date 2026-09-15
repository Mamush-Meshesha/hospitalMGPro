import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { ArrowLeft, CheckCircle2, FileText, CreditCard, Clock, User, Calendar, Building, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<any>(null);
  const [cashPoints, setCashPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal state
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const configData = await fetchApi('/billing/config');
        if (configData.result?.cashPoints) {
          setCashPoints(configData.result.cashPoints);
        }

        const billData = await fetchApi(`/billing/${id}`);
        if (billData.result) {
          setBill(billData.result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleProcessPayment = async () => {
    if (!amountPaid || isNaN(Number(amountPaid)) || Number(amountPaid) <= 0) return toast.error("Enter valid amount");
    setIsProcessing(true);
    try {
      await fetchApi(`/billing/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentModeId: 1, // Cash
          amount: outstanding, // The actual bill amount being paid
          amountTendered: Number(amountPaid),
          creator: 1 // hardcoded current user for demo
        })
      });
      setIsPaymentModalOpen(false);
      setAmountPaid('');
      // Reload bill
      const billData = await fetchApi(`/billing/${id}`);
      if (billData.result) setBill(billData.result);
    } catch (err: any) {
      toast.error("Payment failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground flex items-center gap-2"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Loading invoice details...</div>;
  }

  if (!bill) {
    return <div className="p-8 text-destructive">Invoice not found.</div>;
  }

  const patientName = (bill.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.given_name || '').trim() + ' ' + 
                      (bill.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.family_name || 'Unknown Patient').trim();
  
  const cashPointName = cashPoints.find(cp => cp.cash_point_id === bill.cash_point_id)?.name || 'Main Cashier';
  
  const totalAmount = bill.cashier_bill_line_item?.reduce((sum: number, item: any) => sum + Number(item.price * item.quantity), 0) || 0;
  const paidAmount = bill.cashier_bill_payment?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const outstanding = Math.max(0, totalAmount - paidAmount);
  
  // Resolve status logic (backend returns 'PENDING', but let's derive accurately)
  const isPaid = paidAmount >= totalAmount && totalAmount > 0;
  const statusLabel = isPaid ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : bill.status);

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/billing')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Invoice {bill.receipt_number || `INV-${bill.bill_id}`}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                statusLabel === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                statusLabel === 'PARTIAL' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Created on {new Date(bill.date_created).toLocaleString()}
            </p>
          </div>
        </div>
        
        {!isPaid && (
          <button 
            onClick={() => setIsPaymentModalOpen(true)}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Process Payment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bill Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Billed Services
              </h2>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Service Description</th>
                    <th className="px-6 py-3 font-medium text-center">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {bill.cashier_bill_line_item?.length > 0 ? (
                    bill.cashier_bill_line_item.map((item: any) => (
                      <tr key={item.bill_line_item_id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{item.cashier_billable_service?.name || 'Medical Service'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">ID: {item.service_id}</p>
                        </td>
                        <td className="px-6 py-4 text-center">{item.quantity}</td>
                        <td className="px-6 py-4 text-right text-muted-foreground">${Number(item.price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-medium text-foreground">${(item.quantity * Number(item.price)).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">
                        No line items found for this invoice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Totals Footer */}
            <div className="bg-muted/10 p-6 border-t border-border flex flex-col items-end gap-2">
              <div className="flex justify-between w-full sm:w-64 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full sm:w-64 text-sm text-emerald-600">
                <span>Amount Paid</span>
                <span>-${paidAmount.toFixed(2)}</span>
              </div>
              <div className="w-full sm:w-64 h-px bg-border my-1" />
              <div className="flex justify-between w-full sm:w-64 text-base font-bold text-foreground">
                <span>Balance Due</span>
                <span>${outstanding.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment History */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Payment History
              </h2>
            </div>
            <div className="p-6">
              {bill.cashier_bill_payment?.length > 0 ? (
                <div className="space-y-4">
                  {bill.cashier_bill_payment.map((payment: any, index: number) => (
                    <div key={payment.bill_payment_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Payment #{index + 1} ({payment.cashier_payment_mode?.name || 'Cash'})</p>
                          <p className="text-xs text-muted-foreground">{new Date(payment.date_created).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 text-right">
                        <p className="text-lg font-bold text-emerald-500">${Number(payment.amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Tendered: ${Number(payment.amount_tendered).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                  <CreditCard className="w-8 h-8 opacity-20" />
                  <p>No payments have been made on this invoice.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 border-b border-border bg-muted/20">
              <h2 className="font-semibold text-foreground">Invoice Overview</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Billed To
                </label>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <p className="font-medium text-foreground text-sm">{patientName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Patient ID: {bill.patient_id || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Department / Routing
                </label>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                  <p className="font-medium text-primary text-sm">{cashPointName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cash Point #{bill.cash_point_id}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Dates
                </label>
                <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Issued:</span>
                    <span className="font-medium">{new Date(bill.date_created).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Due:</span>
                    <span className="font-medium">Upon Receipt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
            onClick={() => !isProcessing && setIsPaymentModalOpen(false)} 
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">Process Payment</h3>
              <button 
                onClick={() => setIsPaymentModalOpen(false)} 
                disabled={isProcessing}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-foreground">Balance Due</span>
                <span className="font-bold text-lg text-foreground">${outstanding.toFixed(2)}</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Amount Tendered</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="pl-7 w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder={outstanding.toFixed(2)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enter the amount handed by the patient.</p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isProcessing}
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
          </div>
        </>
      )}
    </div>
  );
}
