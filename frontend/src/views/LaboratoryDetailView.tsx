import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, Printer, CheckCircle, Activity, Loader2, Beaker, UserCog, Play, TestTube, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fetchApi } from '../utils/api';
import { printDocument } from '../utils/print';

export default function LaboratoryDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi(`/order/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load lab order details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  // Enter Results Form (obs)
  const [isEnterResultsOpen, setIsEnterResultsOpen] = useState(false);
  const [obsNumeric1, setObsNumeric1] = useState('');
  const [obsNumeric2, setObsNumeric2] = useState('');
  const [obsComments, setObsComments] = useState('');
  const [markAbnormal, setMarkAbnormal] = useState(false);

  const handleStartProcessing = async () => {
    try {
      await fetchApi(`/order/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ fulfiller_status: 'PROCESSING' })
      });
      toast.success('Specimen processing started');
      loadOrder(); // Reload the order data
    } catch (err: any) {
      toast.error(err.message || 'Failed to start processing');
    }
  };

  const handleSubmitResults = async () => {
    const payload = {
      resultValue: obsNumeric1,
      comments: obsComments,
      abnormal: markAbnormal
    };

    try {
      const data = await fetchApi(`/order/${id}/lab-result`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (data) {
        setIsEnterResultsOpen(false);
        setObsNumeric1(''); setObsNumeric2(''); setObsComments(''); setMarkAbnormal(false);
        toast.success('Lab results submitted successfully');
        loadOrder(); // Reload the order data to show completed status and results
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit lab results');
      console.error(err);
    }
  };

  const getStatusVariant = (status: string) => {
    const s = (status || 'pending').toUpperCase();
    switch(s) {
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Lab order not found.</p>
        <button onClick={() => navigate('/lab')} className="text-primary hover:underline">Return to Laboratory</button>
      </div>
    );
  }

  // Extract deeply nested data securely
  const patientPerson = order.patient_order_for_patient?.person_person_id_for_patient;
  const patientNameObj = patientPerson?.reverse_person_name_name_for_person?.[0];
  const patientName = patientNameObj ? `${patientNameObj.given_name || ''} ${patientNameObj.family_name || ''}`.trim() : `Patient ID: ${order.patient_id}`;
  
  const identifiers = order.patient_order_for_patient?.reverse_patient_identifier_fk_patient_id_patient_identifier || [];
  const patientMrn = identifiers.length > 0 ? identifiers[0].identifier : `MRN-${order.patient_id}`;

  const providerPerson = order.provider_fk_orderer_provider?.person_provider_person_id_fk;
  const providerNameObj = providerPerson?.reverse_person_name_name_for_person?.[0];
  const providerName = providerNameObj ? `${providerNameObj.given_name || ''} ${providerNameObj.family_name || ''}`.trim() : `Provider ID: ${order.orderer}`;

  const testName = order.concept?.reverse_concept_name_name_for_concept?.[0]?.name || order.concept?.short_name || `Concept ID: ${order.concept_id}`;
  
  const testDetails = order.reverse_test_order_test_order_order_id_fk?.[0] || {};
  const status = (order.fulfiller_status || 'PENDING').toUpperCase();
  const urgency = (order.urgency || 'ROUTINE').toUpperCase();
  
  // Get results if completed
  const results = order.reverse_obs_obs_order || [];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/lab')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors no-print"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{order.order_number || 'Lab Order'}</h1>
              <StatusBadge label={status} variant={getStatusVariant(status)} />
              {urgency === 'STAT' && <StatusBadge label="STAT" variant="destructive" />}
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">{testName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={printDocument} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="space-y-6">
          {/* Patient Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <User size={16} className="text-muted-foreground" /> 
              Patient Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MRN:</span>
                <span className="font-medium font-mono text-foreground">{patientMrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium text-foreground">{patientPerson?.gender === 'M' ? 'Male' : patientPerson?.gender === 'F' ? 'Female' : 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FileText size={16} className="text-muted-foreground" /> 
              Order Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ordered Date:</span>
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Clock size={12} className="opacity-70" /> {new Date(order.date_created).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ordered By:</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <UserCog size={14} className="opacity-70" /> {providerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority:</span>
                <span className="font-medium text-foreground">{urgency}</span>
              </div>
              {order.instructions && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1 text-xs">Instructions:</span>
                  <div className="p-2 bg-muted/30 rounded border border-border text-xs text-foreground">
                    {order.instructions}
                  </div>
                </div>
              )}
              {testDetails.clinical_history && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1 text-xs">Clinical History:</span>
                  <div className="p-2 bg-muted/30 rounded border border-border text-xs text-foreground">
                    {testDetails.clinical_history}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Beaker size={16} className="text-primary" /> Test Results
              </h3>
            </div>
            
            <div className="p-6">
              {status === 'COMPLETED' ? (
                <div className="space-y-6">
                  {results.length > 0 ? (
                    results.map((res: any, idx: number) => (
                      <div key={res.uuid || idx} className="space-y-4">
                        <div className="p-4 rounded-lg border border-border bg-background shadow-sm">
                          <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-3">
                            <div>
                              <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">Result Value</span>
                              <div className="text-2xl font-bold text-foreground">
                                {res.value_numeric !== null ? res.value_numeric : res.value_text || 'No Value'}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">Date Resulted</span>
                              <span className="text-sm font-medium text-foreground">{new Date(res.obs_datetime).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          {res.comments && (
                            <div>
                              <span className="text-xs text-muted-foreground block uppercase tracking-wider font-semibold mb-1">Pathologist Comments</span>
                              <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md border border-border/50">
                                {res.comments}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                        <Activity className="text-muted-foreground" size={24} />
                      </div>
                      <p className="text-lg font-medium text-foreground">No observation data found</p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">This order was marked as completed, but no result values were recorded in the database.</p>
                    </div>
                  )}
                </div>
              ) : status === 'PROCESSING' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mb-2">
                    <Loader2 className="text-info animate-spin" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-foreground">Specimen in Processing</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This specimen is currently being processed by the laboratory. Enter the final results when ready.
                  </p>
                  <button onClick={() => setIsEnterResultsOpen(true)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <TestTube size={16} /> Enter Results
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-2">
                    <Clock className="text-warning" size={32} />
                  </div>
                  <h3 className="text-xl font-medium text-foreground">Awaiting Processing</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This specimen has not yet been processed. It is pending in the laboratory queue.
                  </p>
                  <button onClick={handleStartProcessing} className="mt-4 px-4 py-2 bg-muted text-foreground border border-border rounded-md text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
                    <Play size={16} /> Start Processing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Enter Results Modal */}
      <AnimatePresence>
        {isEnterResultsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnterResultsOpen(false)}
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
                  onClick={() => setIsEnterResultsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg border border-border flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{testName}</div>
                    <div className="text-xs text-muted-foreground">Accession {order.order_number} • {patientName}</div>
                  </div>
                  {urgency === 'STAT' && (
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
                  onClick={() => setIsEnterResultsOpen(false)}
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
