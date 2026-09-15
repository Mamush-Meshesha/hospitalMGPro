import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, Play, Download, Filter, X, Code, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface CohortMemberDraft {
  patientUuid: string;
  patientName: string;
  startDate: string;
  endDate: string;
}

export default function CohortsView() {
  const [isAddCohortOpen, setIsAddCohortOpen] = useState(false);
  const [cohorts, setCohorts] = useState<any[]>([]);
  
  // Real patient data for selection
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCohorts = () => {
    fetchApi('/cohort?v=full')
      .then(data => setCohorts(data.results || data || []))
      .catch(err => console.error("Failed to fetch cohorts:", err));
  };

  useEffect(() => {
    loadCohorts();
    fetchApi('/patient')
      .then(res => setPatients(res.results || res || []))
      .catch(console.error);
  }, []);
  
  const [draftMembers, setDraftMembers] = useState<CohortMemberDraft[]>([]);
  const [selectedPatientUuid, setSelectedPatientUuid] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [cohortName, setCohortName] = useState('');
  const [cohortDesc, setCohortDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCohort = async () => {
    if (!cohortName) return toast.error('Cohort name is required');
    setIsSubmitting(true);
    try {
      await fetchApi('/cohort', {
        method: 'POST',
        body: JSON.stringify({
          name: cohortName,
          description: cohortDesc,
          creator: 1,
          members: draftMembers
        })
      });
      setIsAddCohortOpen(false);
      setCohortName('');
      setCohortDesc('');
      setDraftMembers([]);
      loadCohorts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create cohort');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedPatientUuid) return;
    const pat = patients.find(p => p.uuid === selectedPatientUuid);
    if (!pat) return;
    
    const name = `${pat.givenName} ${pat.familyName} (MRN-${String(pat.personId).padStart(5, '0')})`;
    setDraftMembers([...draftMembers, { patientUuid: selectedPatientUuid, patientName: name, startDate, endDate }]);
    setSelectedPatientUuid('');
    setStartDate('');
    setEndDate('');
  };

  const handleRemoveMember = (index: number) => {
    setDraftMembers(draftMembers.filter((_, i) => i !== index));
  };

  const filteredCohorts = cohorts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.description || '').toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patient Cohorts</h1>
          <p className="text-muted-foreground text-sm">Dynamic and static patient groupings for research & reporting</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddCohortOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Cohort Builder
          </button>
        </div>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cohorts..." 
              className="w-full pl-10 pr-4 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Cohort Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Members</th>
                <th className="px-5 py-3">Date Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground text-sm">
              {filteredCohorts.length > 0 ? filteredCohorts.map((cohort: any) => {
                const isDynamic = cohort.description?.toLowerCase().includes('dynamic') || cohort.name.includes('Query');
                const membersList = cohort.reverse_cohort_member_parent_cohort || [];
                const memberCount = membersList.length;
                return (
                  <tr key={cohort.uuid} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${isDynamic ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                          {isDynamic ? <Code size={16} /> : <Users size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{cohort.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{cohort.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isDynamic ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {isDynamic ? 'Dynamic Query' : 'Static List'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex -space-x-2">
                        {membersList.slice(0, 3).map((m: any, i: number) => {
                          const patient = m.patient_member_patient;
                          const name = patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
                          const init = name ? name.given_name?.charAt(0) : '?';
                          return (
                            <div key={m.uuid || i} className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-foreground">
                              {init}
                            </div>
                          );
                        })}
                        {memberCount > 3 && (
                          <div className="h-7 w-7 rounded-full bg-background border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            +{memberCount - 3}
                          </div>
                        )}
                        {memberCount === 0 && (
                          <span className="text-xs text-muted-foreground">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">
                      {new Date(cohort.date_created).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isDynamic && (
                          <button className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Run Query">
                            <Play size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="Export">
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users size={32} className="opacity-20 mb-3" />
                      <p className="text-sm font-medium text-foreground">No cohorts found</p>
                      <p className="text-xs mt-1">Create a new cohort to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Builder Modal */}
      <AnimatePresence>
        {isAddCohortOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddCohortOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Users size={20} className="text-primary" /> Create New Cohort
                </h2>
                <button onClick={() => setIsAddCohortOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Cohort Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Cohort Name *</label>
                      <input 
                        type="text" 
                        value={cohortName}
                        onChange={e => setCohortName(e.target.value)}
                        placeholder="e.g. Type II Diabetics - 2026 Trial"
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Description</label>
                      <textarea 
                        value={cohortDesc}
                        onChange={e => setCohortDesc(e.target.value)}
                        placeholder="Brief description of inclusion criteria..."
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all resize-none h-16"
                      />
                    </div>
                  </div>
                </div>

                {/* Static Members */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border pb-2 flex items-center justify-between">
                    Static Members List
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">{draftMembers.length} Members</span>
                  </h3>
                  
                  {/* Add Member Form */}
                  <div className="bg-muted/20 p-3 rounded-lg border border-border flex items-end gap-3">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Patient</label>
                      <select 
                        value={selectedPatientUuid}
                        onChange={e => setSelectedPatientUuid(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                      >
                        <option value="">Select a patient...</option>
                        {patients.map(p => (
                          <option key={p.uuid} value={p.uuid}>{p.givenName} {p.familyName} (MRN-{String(p.personId).padStart(5, '0')})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32 space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Start Date</label>
                      <input 
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleAddMember}
                      disabled={!selectedPatientUuid}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 h-[38px]"
                    >
                      Add
                    </button>
                  </div>

                  {/* Members List */}
                  {draftMembers.length > 0 && (
                    <div className="border border-border rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="px-3 py-2 font-medium text-muted-foreground text-xs">Patient</th>
                            <th className="px-3 py-2 font-medium text-muted-foreground text-xs">Start Date</th>
                            <th className="px-3 py-2 text-right font-medium text-muted-foreground text-xs">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {draftMembers.map((m, i) => (
                            <tr key={i} className="hover:bg-muted/30">
                              <td className="px-3 py-2 font-medium">{m.patientName}</td>
                              <td className="px-3 py-2 text-muted-foreground">{m.startDate || 'N/A'}</td>
                              <td className="px-3 py-2 text-right">
                                <button 
                                  onClick={() => handleRemoveMember(i)}
                                  className="text-destructive hover:text-destructive/80 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddCohortOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-md transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCohort}
                  disabled={isSubmitting || !cohortName}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Cohort'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
