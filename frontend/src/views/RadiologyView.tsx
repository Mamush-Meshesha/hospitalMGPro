import React, { useState, useEffect } from 'react';
import { Search, Eye, Filter, MonitorPlay, Clock, Upload, Plus, X, FileText, CheckCircle2, UploadCloud, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface RadOrder {
  id: string;
  patient: string;
  mrn: string;
  type: string;
  status: 'Scheduled' | 'Images Available' | 'Pending Reading' | 'Completed';
  time: string;
  urgent: boolean;
  imageUrl?: string;
}

const initialOrders: RadOrder[] = [
  { id: 'RAD-10992', patient: 'James Wilson', mrn: 'MRN-10042', type: 'Chest X-Ray (PA/LAT)', status: 'Images Available', time: '1h ago', urgent: false },
  { id: 'RAD-10991', patient: 'Sarah Connor', mrn: 'MRN-08991', type: 'CT Head (w/o contrast)', status: 'Pending Reading', time: '15m ago', urgent: true },
  { id: 'RAD-10988', patient: 'Emma Stone', mrn: 'MRN-09923', type: 'Ultrasound Abdomen', status: 'Scheduled', time: 'Tomorrow 10:00 AM', urgent: false },
];

export default function RadiologyView() {
  const [orders, setOrders] = useState<RadOrder[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await fetchApi('/order?v=full');
      const apiOrders = data.results || data || [];
      const formattedOrders = apiOrders
        .filter((o: any) => o.order_type_id === 3 || o.instructions?.includes('RAD')) // Mock detection for Radiology
        .map((o: any) => {
          const patientNameObj = o.patient_order_for_patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
          const conceptNameObj = o.concept?.reverse_concept_name_name_for_concept?.[0];
          const patientName = patientNameObj ? `${patientNameObj.given_name} ${patientNameObj.family_name}` : `Unknown Patient`;
          const conceptName = conceptNameObj?.name || (o.concept_id ? `Concept: ${o.concept_id}` : `Unknown Study`);

          const imageUrl = o.reverse_obs_obs_order?.find((obs: any) => obs.value_complex)?.value_complex || null;

          return {
            id: o.uuid || `RAD-${Math.floor(Math.random() * 90000) + 10000}`,
            patient: patientName,
            mrn: `MRN-${o.patient_id}`,
            type: conceptName,
            status: o.fulfiller_status || 'Scheduled',
            time: new Date(o.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            urgent: o.urgency === 'STAT',
            imageUrl: imageUrl
          };
        });
      setOrders(formattedOrders.length > 0 ? formattedOrders : initialOrders);
    } catch (err) {
      setOrders(initialOrders);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const [isAddScanOpen, setIsAddScanOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RadOrder | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);

  // New Scan Form State (test_order)
  const [newMrn, setNewMrn] = useState('');
  const [newModality, setNewModality] = useState('');
  const [newBodyPart, setNewBodyPart] = useState('');
  const [newLaterality, setNewLaterality] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newUrgency, setNewUrgency] = useState('Routine');

  // Report Form State (obs)
  const [reportText, setReportText] = useState('');

  const openUploadModal = (id: string) => {
    setSelectedOrderId(id);
    setIsUploadOpen(true);
    setUploadFile(null);
  };

  const closeUploadModal = () => {
    setIsUploadOpen(false);
    setSelectedOrderId(null);
    setUploadFile(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedOrderId || !uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      await fetchApi(`/order/${selectedOrderId}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      await fetchOrders();
      closeUploadModal();
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOrderScan = () => {
    if (!newMrn || !newModality || !newBodyPart) return;
    const newOrder: RadOrder = {
      id: `RAD-${Math.floor(Math.random() * 90000) + 10000}`,
      patient: 'Unknown Patient',
      mrn: newMrn,
      type: `${newModality} ${newBodyPart} ${newLaterality ? `(${newLaterality})` : ''}`.trim(),
      status: 'Scheduled',
      time: 'Just now',
      urgent: newUrgency === 'STAT'
    };
    setOrders([newOrder, ...orders]);
    setIsAddScanOpen(false);
    setNewMrn(''); setNewModality(''); setNewBodyPart(''); setNewLaterality(''); setNewReason(''); setNewUrgency('Routine');
  };

  const handleAction = async (id: string, currentStatus: string) => {
    if (currentStatus === 'Images Available') {
      try {
        await fetchApi(`/order/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ fulfiller_status: 'Pending Reading' })
        });
        await fetchOrders();
      } catch (err) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'Pending Reading' } : o));
      }
    }
  };

  const handleWriteReport = (order: RadOrder) => {
    setSelectedOrder(order);
  };

  const handleSubmitReport = () => {
    if (selectedOrder && reportText) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'Completed' } : o));
      setSelectedOrder(null);
      setReportText('');
    }
  };

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Radiology & Imaging</h1>
          <p className="text-muted-foreground text-sm">PACS Integration and Reporting Worklist</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search imaging orders..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
          <button 
            onClick={() => setIsAddScanOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Scan Order
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start">
        <AnimatePresence>
          {orders.map((item) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className={`bg-card border ${item.status === 'Completed' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'} rounded-xl shadow-sm overflow-hidden flex flex-col group relative`}
            >
              {item.urgent && item.status !== 'Completed' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase bg-destructive/10 text-destructive px-2 py-0.5 rounded z-10">
                  STAT
                </div>
              )}
              
              {/* DICOM Preview Placeholder */}
              <div 
                className={`h-40 bg-zinc-950 w-full relative flex items-center justify-center border-b border-border overflow-hidden ${item.imageUrl ? 'cursor-pointer group' : ''}`}
                onClick={() => { if (item.imageUrl) setViewerImageUrl(item.imageUrl); }}
              >
                {item.imageUrl ? (
                  <>
                    <img src={item.imageUrl} alt="DICOM Preview" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                    <div className="absolute bottom-3 left-3 text-xs text-emerald-400 font-mono flex items-center gap-2 z-10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Image Available
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="bg-black/50 backdrop-blur-sm p-3 rounded-full text-white">
                        <Eye size={24} />
                      </div>
                    </div>
                  </>
                ) : item.status !== 'Scheduled' ? (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-zinc-950 to-zinc-950"></div>
                    <MonitorPlay size={40} className="text-white/40 drop-shadow-lg" strokeWidth={1.5} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-xs text-emerald-400 font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> DICOM Available
                    </div>
                  </>
                ) : (
                  <Clock size={32} className="text-white/10" strokeWidth={1} />
                )}
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-foreground leading-tight">{item.type}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-foreground">{item.patient}</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{item.mrn}</span>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' :
                    item.status === 'Images Available' ? 'bg-blue-500/10 text-blue-600' :
                    item.status === 'Pending Reading' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              </div>
              
              <div className="p-3 bg-muted/20 border-t border-border flex gap-2">
                {item.status === 'Scheduled' && (
                  <button onClick={() => openUploadModal(item.id)} className="flex-1 py-1.5 bg-card hover:bg-muted border border-border text-foreground rounded text-xs font-medium transition-colors">
                    Upload Images
                  </button>
                )}
                {item.status === 'Images Available' && (
                  <button onClick={() => handleAction(item.id, item.status)} className="flex-1 py-1.5 bg-card hover:bg-muted border border-border text-foreground rounded text-xs font-medium transition-colors">
                    Send to Reading
                  </button>
                )}
                {item.status === 'Pending Reading' && (
                  <button onClick={() => handleWriteReport(item)} className="flex-1 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1.5">
                    <FileText size={14} /> Write Report
                  </button>
                )}
                {item.status === 'Completed' && (
                  <button disabled className="flex-1 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded text-xs font-medium flex items-center justify-center gap-1.5 cursor-default">
                    <CheckCircle2 size={14} /> Report Finalized
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Scan Modal */}
      <AnimatePresence>
        {isAddScanOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddScanOpen(false)}
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
                  <MonitorPlay size={20} className="text-primary"/> Order New Scan
                </h2>
                <button 
                  onClick={() => setIsAddScanOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Patient MRN <span className="text-[10px] text-muted-foreground font-normal">Mapped to orders.patient_id</span>
                  </label>
                  <input type="text" value={newMrn} onChange={e => setNewMrn(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="MRN-10042" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Modality (Concept)
                    </label>
                    <select value={newModality} onChange={e => setNewModality(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="">Select Modality...</option>
                      <option value="MRI">MRI</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="X-Ray">X-Ray</option>
                      <option value="Ultrasound">Ultrasound</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Priority (Urgency)</label>
                    <select value={newUrgency} onChange={e => setNewUrgency(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="Routine">Routine</option>
                      <option value="STAT">STAT (Urgent)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Target Body Part</label>
                    <input type="text" value={newBodyPart} onChange={e => setNewBodyPart(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g., Chest, Brain" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Laterality <span className="text-[10px] text-muted-foreground font-normal">test_order.laterality</span>
                    </label>
                    <select value={newLaterality} onChange={e => setNewLaterality(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="">N/A</option>
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                      <option value="Bilateral">Bilateral</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Reason for Exam <span className="text-[10px] text-muted-foreground font-normal">test_order.clinical_history</span>
                  </label>
                  <textarea value={newReason} onChange={e => setNewReason(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-20 resize-none" placeholder="Rule out pneumonia..." />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddScanOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleOrderScan}
                  disabled={!newMrn || !newModality || !newBodyPart}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Write Report Modal */}
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <FileText size={20} className="text-primary"/> Radiologist Interpretation
                </h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 flex flex-col md:flex-row gap-6">
                
                {/* Left side: Context */}
                <div className="md:w-1/3 space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Patient</div>
                      <div className="font-medium text-sm">{selectedOrder.patient} ({selectedOrder.mrn})</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Study Description</div>
                      <div className="font-medium text-sm">{selectedOrder.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Accession</div>
                      <div className="font-medium text-sm">{selectedOrder.id}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (selectedOrder?.imageUrl) setViewerImageUrl(selectedOrder.imageUrl);
                    }}
                    disabled={!selectedOrder?.imageUrl}
                    className="w-full py-2 bg-card hover:bg-muted border border-border text-foreground rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MonitorPlay size={16} /> Open DICOM Viewer
                  </button>
                </div>

                {/* Right side: Report Editor */}
                <div className="md:w-2/3 flex flex-col gap-2">
                  <label className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center justify-between">
                    Interpretation Report <span className="text-[9px] text-muted-foreground font-normal normal-case">Mapped to obs.value_text</span>
                  </label>
                  <textarea 
                    value={reportText} 
                    onChange={e => setReportText(e.target.value)} 
                    className="w-full flex-1 min-h-[250px] px-4 py-3 bg-muted/20 border border-border rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none font-mono text-[13px] leading-relaxed" 
                    placeholder="Enter findings, impressions, and recommendations here..."
                    autoFocus
                  />
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Save Draft
                </button>
                <button 
                  onClick={handleSubmitReport}
                  disabled={!reportText}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Sign & Finalize Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Upload Image Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card w-[450px] rounded-lg shadow-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold flex items-center gap-2"><UploadCloud size={18} className="text-primary" /> Upload DICOM Images</h2>
              <button onClick={closeUploadModal} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Please upload the DICOM files or images for the selected scan order.</p>
              
              {!uploadFile ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center bg-muted/10 hover:bg-muted/30 transition-colors"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setUploadFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <UploadCloud size={40} className="text-muted-foreground mb-3" />
                  <label className="cursor-pointer">
                    <span className="text-primary hover:underline font-medium">Browse files</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,.dcm"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">DICOM, JPEG, PNG up to 20MB</p>
                </div>
              ) : (
                <div className="relative border border-border rounded-lg p-4 bg-muted/20 flex flex-col items-center justify-center gap-4">
                  {uploadFile.type.startsWith('image/') ? (
                    <img 
                      src={URL.createObjectURL(uploadFile)} 
                      alt="Preview" 
                      className="max-h-48 rounded-md object-contain shadow-sm border border-border/50"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-card rounded-md border border-border flex items-center justify-center shadow-sm">
                      <FileImage size={48} className="text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="w-full bg-card rounded-md p-3 flex items-center justify-between border border-border/50">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium truncate pr-4">{uploadFile.name}</span>
                      <span className="text-xs text-muted-foreground">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button 
                      onClick={() => setUploadFile(null)} 
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/30">
              <button 
                onClick={closeUploadModal} 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={!uploadFile || isUploading}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Uploading...</>
                ) : 'Upload Scan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      <AnimatePresence>
        {viewerImageUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> PACS Viewer Active
                </div>
              </div>
              <button 
                onClick={() => setViewerImageUrl(null)} 
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
              <motion.img 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={viewerImageUrl} 
                alt="Full DICOM View" 
                className="max-w-full max-h-full object-contain rounded-md shadow-2xl border border-white/10"
              />
            </div>
            
            <div className="p-4 flex justify-center text-white/50 text-xs font-mono absolute bottom-0 left-0 right-0 pointer-events-none">
              Use scroll to zoom (Simulated) • Diagnostic quality image
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
