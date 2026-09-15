import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Users, Calendar, Activity, CheckCircle2, X, ClipboardList, Settings, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

export default function ProgramsView() {
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);

  // Form states
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDesc, setNewProgramDesc] = useState('');
  const [newProgramConcept, setNewProgramConcept] = useState('');
  const [newProgramOutcomesConcept, setNewProgramOutcomesConcept] = useState('');

  const [enrollPatientId, setEnrollPatientId] = useState('');
  const [enrollProgramId, setEnrollProgramId] = useState('');
  const [enrollDate, setEnrollDate] = useState('');
  const [enrollLocation, setEnrollLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPrograms = () => {
    fetchApi('/program')
      .then(data => setPrograms(data.results || data || []))
      .catch(err => console.error("Failed to fetch programs:", err));
  };

  useEffect(() => {
    loadPrograms();
    fetchApi('/concept?v=full').then(res => setConcepts(res.results || []));
  }, []);

  const handleCreateProgram = async () => {
    if (!newProgramName || !newProgramConcept) return toast.error('Name and Concept are required');
    setIsSubmitting(true);
    try {
      await fetchApi('/program', {
        method: 'POST',
        body: JSON.stringify({
          name: newProgramName,
          description: newProgramDesc,
          concept_id: Number(newProgramConcept),
          outcomes_concept_id: newProgramOutcomesConcept ? Number(newProgramOutcomesConcept) : null,
          creator: 1
        })
      });
      setIsCreateOpen(false);
      setNewProgramName('');
      setNewProgramDesc('');
      setNewProgramConcept('');
      setNewProgramOutcomesConcept('');
      loadPrograms();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create program');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollPatient = async () => {
    if (!enrollPatientId || !enrollProgramId || !enrollDate) return toast.error('Patient, Program, and Date are required');
    setIsSubmitting(true);
    try {
      await fetchApi('/patient-program', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: Number(enrollPatientId),
          program_id: Number(enrollProgramId),
          date_enrolled: enrollDate,
          location_id: enrollLocation ? Number(enrollLocation) : null,
          creator: 1
        })
      });
      setIsEnrollOpen(false);
      setEnrollPatientId('');
      setEnrollProgramId('');
      setEnrollDate('');
      setEnrollLocation('');
      // No need to reload programs strictly for this, but could load roster if viewing
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patient Programs</h1>
          <p className="text-muted-foreground text-sm">Manage longitudinal care (e.g. HIV/TB, Maternal Health)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search enrolled patients..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsEnrollOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Enroll Patient
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px] content-start">
        
        {/* Dynamic Program Cards */}
        {programs.map((program) => (
          <div key={program.uuid || program.program_id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
            <div className="h-2 w-full bg-blue-500" />
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded">
                  {program.retired ? 'Retired' : 'Active'}
                </span>
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">{program.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {program.description || 'No description provided.'}
              </p>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Users size={14}/> Enrolled Patients</span>
                  <span className="font-semibold text-foreground">--</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14}/> Created</span>
                  <span className="font-semibold text-foreground">
                    {new Date(program.date_created).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/20 border-t border-border text-center">
              <button 
                onClick={() => setSelectedRoster(program.name)}
                className="text-primary text-sm font-medium hover:underline"
              >
                Manage Program Roster →
              </button>
            </div>
          </div>
        ))}

        {/* Create New Program */}
        <div 
          onClick={() => setIsCreateOpen(true)}
          className="bg-muted/10 border-2 border-dashed border-border rounded-xl shadow-sm flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors min-h-[250px]"
        >
          <div className="h-12 w-12 rounded-full bg-card shadow-sm border border-border flex items-center justify-center text-primary mb-4">
            <Plus size={24} />
          </div>
          <h3 className="font-semibold text-foreground">Create New Program</h3>
          <p className="text-sm text-muted-foreground mt-2">Configure a new longitudinal care program and states.</p>
        </div>

      </div>

      {/* Enroll Patient Modal */}
      <AnimatePresence>
        {isEnrollOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollOpen(false)}
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
                  <ClipboardList size={20} className="text-primary"/> Enroll in Program
                </h2>
                <button 
                  onClick={() => setIsEnrollOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Patient *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                    <input 
                      type="text" 
                      value={enrollPatientId}
                      onChange={e => setEnrollPatientId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                      placeholder="Patient ID (e.g. 1)" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Program *</label>
                    <select 
                      value={enrollProgramId}
                      onChange={e => setEnrollProgramId(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">Select program...</option>
                      {programs.map(p => (
                        <option key={p.program_id} value={p.program_id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Enrollment Date *</label>
                    <input 
                      type="date" 
                      value={enrollDate}
                      onChange={e => setEnrollDate(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Enrollment Location <span className="text-muted-foreground font-normal">(Opt)</span></label>
                  <select 
                    value={enrollLocation}
                    onChange={e => setEnrollLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select location...</option>
                    <option value="1">Main Hospital</option>
                    <option value="2">Outpatient Clinic</option>
                    <option value="3">Rural Health Post</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEnrollOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEnrollPatient}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Enrolling...' : 'Enroll Patient'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Program Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateOpen(false)}
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
                  <Settings size={20} className="text-primary"/> Create New Program
                </h2>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Program Name *</label>
                  <input 
                    type="text" 
                    value={newProgramName}
                    onChange={e => setNewProgramName(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="E.g., Hypertension Management..." 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Description <span className="text-muted-foreground font-normal">(Opt)</span></label>
                  <textarea 
                    value={newProgramDesc}
                    onChange={e => setNewProgramDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20" 
                    placeholder="Describe the program objectives..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Program Concept *</label>
                    <select 
                      value={newProgramConcept}
                      onChange={e => setNewProgramConcept(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="">Select Concept...</option>
                      {concepts.map(c => (
                        <option key={c.concept_id} value={c.concept_id}>
                          {c.concept_id} - {c.reverse_concept_name_name_for_concept?.[0]?.name || 'Unknown'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Outcomes Concept <span className="text-muted-foreground font-normal">(Opt)</span></label>
                    <select 
                      value={newProgramOutcomesConcept}
                      onChange={e => setNewProgramOutcomesConcept(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    >
                      <option value="">None</option>
                      {concepts.map(c => (
                        <option key={c.concept_id} value={c.concept_id}>
                          {c.concept_id} - {c.reverse_concept_name_name_for_concept?.[0]?.name || 'Unknown'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProgram}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Program Roster Modal */}
      <AnimatePresence>
        {selectedRoster && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoster(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-2xl bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <h2 className="font-semibold text-xl text-foreground flex items-center gap-2">
                    {selectedRoster}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage enrolled patients and workflows</p>
                </div>
                <button 
                  onClick={() => setSelectedRoster(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 border-b border-border bg-background flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <input type="text" className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Search enrolled patients..." />
                </div>
                <button className="px-4 py-2 bg-muted border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
                  <Filter size={16} /> Filter
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 text-muted-foreground sticky top-0 border-b border-border">
                    <tr>
                      <th className="font-medium py-3 px-6">Patient</th>
                      <th className="font-medium py-3 px-6">Enrolled On</th>
                      <th className="font-medium py-3 px-6">Location</th>
                      <th className="font-medium py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* Mock Roster Row 1 */}
                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-foreground">James Wilson</div>
                        <div className="text-xs text-muted-foreground">MRN-10042 • 45M</div>
                      </td>
                      <td className="py-4 px-6 text-foreground">Oct 12, 2023</td>
                      <td className="py-4 px-6 text-muted-foreground">Main Hospital</td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                    {/* Mock Roster Row 2 */}
                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-foreground">Sarah Connor</div>
                        <div className="text-xs text-muted-foreground">MRN-08991 • 32F</div>
                      </td>
                      <td className="py-4 px-6 text-foreground">Nov 04, 2023</td>
                      <td className="py-4 px-6 text-muted-foreground">Outpatient Clinic</td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 text-xs text-muted-foreground flex justify-between items-center">
                <span>Showing 2 of 1,245 enrolled patients</span>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border border-border rounded bg-background hover:bg-muted">Prev</button>
                  <button className="px-2 py-1 border border-border rounded bg-background hover:bg-muted">Next</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
