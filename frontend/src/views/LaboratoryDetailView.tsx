import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, FileText, Printer, CheckCircle, Activity, Loader2, Beaker, UserCog } from 'lucide-react';
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
              {urgency === 'STAT' && <StatusBadge label="STAT" variant="error" />}
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
                    This specimen is currently being processed by the laboratory. Go to the Laboratory Hub to enter the final results.
                  </p>
                  <button onClick={() => navigate('/lab')} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Go to Lab Hub
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
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
