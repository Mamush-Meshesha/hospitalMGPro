import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Search, Clock, UserPlus, Play, Check, X, ArrowLeft, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';
import PatientChartView from './PatientChartView';

interface Queue {
  queue_id: number;
  name: string;
  description: string;
  _count: { queue_entries: number };
  location: { name: string };
  service_concept?: { reverse_concept_name_name_for_concept: any[] };
}

export default function QueueDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [queue, setQueue] = useState<Queue | null>(null);
  const [queueEntries, setQueueEntries] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatientUuid, setSelectedPatientUuid] = useState('');
  const [priority, setPriority] = useState('2001');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  useEffect(() => {
    fetchQueueDetails();
    fetchPatients();
  }, [id]);

  const fetchQueueDetails = async () => {
    setLoading(true);
    try {
      const data = await fetchApi('/queue');
      const queuesList = data.results || data || [];
      const currentQueue = queuesList.find((q: Queue) => q.queue_id === Number(id));
      if (currentQueue) {
        setQueue(currentQueue);
        fetchEntries(currentQueue.queue_id);
      } else {
        toast.error('Queue not found');
        navigate('/queues');
      }
    } catch (error) {
      console.error("Failed to fetch queue details:", error);
      toast.error('Failed to fetch queue details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (queueId: number) => {
    setLoadingEntries(true);
    try {
      const data = await fetchApi(`/queue/${queueId}/entries`);
      setQueueEntries(data.results || data || []);
    } catch (error) {
      console.error("Failed to fetch queue entries:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await fetchApi('/patient?v=full');
      setPatients(data.results || data || []);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    }
  };

  const handleAddPatient = async () => {
    if (!queue || !selectedPatientUuid) return;
    
    const pat = patients.find(p => p.uuid === selectedPatientUuid);
    if (!pat) return toast.error('Patient not found');

    const patientIdToSend = pat.patient_id || pat.patientId || pat.personId || pat.person?.personId;
    if (!patientIdToSend) return toast.error(`Patient ID is missing! Found: ${JSON.stringify(pat)}`);

    try {
      await fetchApi(`/queue/${queue.queue_id}/entries`, {
        method: 'POST',
        body: JSON.stringify({
          patientId: patientIdToSend,
          priority: Number(priority) || 2001,
          creator: 1
        })
      });
      setIsAddPatientOpen(false);
      setSelectedPatientUuid('');
      fetchEntries(queue.queue_id);
      toast.success('Patient added to queue');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add patient to queue');
    }
  };

  const updateEntryStatus = async (entryId: number, newStatus: number) => {
    try {
      await fetchApi(`/queue/entries/${entryId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          creator: 1
        })
      });
      if (queue) fetchEntries(queue.queue_id);
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Loading queue details...</div>;
  }

  if (!queue) {
    return null;
  }

  if (selectedPatientId) {
    return <PatientChartView patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
  }

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/queues')}
          className="p-2 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{queue.name}</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Clock size={14} /> Active Queue
          </p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={() => setIsAddPatientOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <UserPlus size={16} /> Add to Queue
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="font-medium text-foreground">Waiting List ({queueEntries.length})</h3>
          <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search patient..." 
              className="w-full pl-10 pr-4 py-1.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loadingEntries ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">Loading entries...</div>
          ) : queueEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Users size={32} className="opacity-20 mb-3" />
              <p>No patients currently in this queue.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Wait Time</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {queueEntries.map((entry, idx) => {
                  const patientName = entry.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
                  const fullName = patientName ? `${patientName.given_name} ${patientName.family_name}` : `Patient #${entry.patient_id}`;
                  
                  const waitTimeMs = new Date().getTime() - new Date(entry.started_at).getTime();
                  const waitTimeMins = Math.floor(waitTimeMs / 60000);
                  
                  return (
                    <tr key={entry.queue_entry_id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{fullName}</td>
                      <td className="px-5 py-3 text-muted-foreground text-sm">{waitTimeMins} mins</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${entry.priority > 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                          {entry.priority > 1 ? 'Urgent' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedPatientId(entry.patient_id)}
                            title="View Chart"
                            className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                          >
                            <FileText size={16} />
                          </button>
                          <button 
                            onClick={() => updateEntryStatus(entry.queue_entry_id, 2002)}
                            title="Start Consultation"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <Play size={16} />
                          </button>
                          <button 
                            onClick={() => updateEntryStatus(entry.queue_entry_id, 5085)}
                            title="Complete"
                            className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => updateEntryStatus(entry.queue_entry_id, 5086)}
                            title="Cancel"
                            className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isAddPatientOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddPatientOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex justify-between">
                <h2 className="font-semibold text-lg text-foreground">Add to {queue.name}</h2>
                <button onClick={() => setIsAddPatientOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Patient</label>
                  <select 
                    value={selectedPatientUuid}
                    onChange={e => setSelectedPatientUuid(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none"
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => {
                      const displayName = (p.givenName && p.familyName) 
                        ? `${p.givenName} ${p.familyName}` 
                        : (p.display || `Patient #${p.personId || p.uuid}`);
                      return (
                        <option key={p.uuid} value={p.uuid}>{displayName}</option>
                      );
                    })}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Priority</label>
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none"
                  >
                    <option value="2001">Normal</option>
                    <option value="2002">Urgent</option>
                    <option value="5085">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button onClick={() => setIsAddPatientOpen(false)} className="px-4 py-2 bg-card border rounded-md text-sm">Cancel</button>
                <button 
                  onClick={handleAddPatient} 
                  disabled={!selectedPatientUuid}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
                >
                  Add Patient
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
