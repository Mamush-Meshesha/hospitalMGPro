import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Activity, Clock, ArrowRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface Queue {
  queue_id: number;
  name: string;
  description: string;
  _count: { queue_entries: number };
  location: { name: string };
  service_concept?: { reverse_concept_name_name_for_concept: any[] };
}

export default function QueuesHubView() {
  const navigate = useNavigate();
  const [queues, setQueues] = useState<Queue[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddQueueOpen, setIsAddQueueOpen] = useState(false);
  const [queueName, setQueueName] = useState('');
  const [queueDesc, setQueueDesc] = useState('');
  const [locationId, setLocationId] = useState('');
  const [serviceConceptId, setServiceConceptId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueues = async () => {
    try {
      const data = await fetchApi('/queue');
      setQueues(data.results || data || []);
    } catch (error) {
      console.error("Failed to fetch queues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    fetchApi('/location?v=full').then(d => setLocations(d.results || d || [])).catch(console.error);
    fetchApi('/concept?v=full').then(d => setConcepts(d.results || d || [])).catch(console.error);
  }, []);

  const handleCreateQueue = async () => {
    if (!queueName || !locationId || !serviceConceptId) {
      return toast.error('Name, Location, and Service are required.');
    }
    setIsSubmitting(true);
    try {
      await fetchApi('/queue', {
        method: 'POST',
        body: JSON.stringify({
          name: queueName,
          description: queueDesc,
          locationId: Number(locationId),
          serviceConceptId: Number(serviceConceptId),
          creator: 1
        })
      });
      setIsAddQueueOpen(false);
      setQueueName('');
      setQueueDesc('');
      setLocationId('');
      setServiceConceptId('');
      fetchQueues();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create queue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Hospital Queues Hub</h1>
          <p className="text-muted-foreground text-sm">Monitor all departmental queues in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search queues..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddQueueOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Queue
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12 text-muted-foreground">
            Loading queues...
          </div>
        ) : queues.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-12 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Users size={16} /> No active queues found. Create one to get started.
            </p>
          </div>
        ) : (
          queues.map((queue, idx) => {
            const serviceName = queue.service_concept?.reverse_concept_name_name_for_concept?.[0]?.name || 'General Service';
            return (
              <motion.div 
                onClick={() => navigate(`/queues/${queue.queue_id}`)}
                key={queue.queue_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all overflow-hidden flex flex-col group cursor-pointer"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Activity size={20} />
                    </div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${queue._count?.queue_entries > 10 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                      {queue._count?.queue_entries || 0} Waiting
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{queue.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{queue.description || 'General departmental queue for routing patients.'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {serviceName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-2 rounded-md">
                    <Clock size={14} /> Est Wait: {(queue._count?.queue_entries || 0) > 0 ? `${queue._count.queue_entries * 15}m` : '0m'}
                  </div>
                </div>
                
                <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{queue.location?.name || 'Main Campus'}</span>
                  <span className="text-primary text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Queue <ArrowRight size={14} />
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Queue Modal */}
      <AnimatePresence>
        {isAddQueueOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddQueueOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground">Create New Queue</h2>
                <button onClick={() => setIsAddQueueOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Queue Name *</label>
                  <input 
                    type="text" 
                    value={queueName}
                    onChange={e => setQueueName(e.target.value)}
                    placeholder="e.g. Triage, Outpatient Pharmacy"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <textarea 
                    value={queueDesc}
                    onChange={e => setQueueDesc(e.target.value)}
                    placeholder="What is this queue for?"
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all resize-none h-16"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Location *</label>
                  <select 
                    value={locationId}
                    onChange={e => setLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Service Type (Concept) *</label>
                  <select 
                    value={serviceConceptId}
                    onChange={e => setServiceConceptId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                  >
                    <option value="">Select Service Concept</option>
                    {concepts.slice(0, 30).map(c => {
                      const name = c.reverse_concept_name_name_for_concept?.[0]?.name || c.name || `Concept #${c.concept_id}`;
                      return (
                        <option key={c.concept_id} value={c.concept_id}>{name}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddQueueOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-md transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateQueue}
                  disabled={isSubmitting || !queueName || !locationId || !serviceConceptId}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Queue'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
