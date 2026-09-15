import React, { useState, useEffect } from 'react';
import { Activity, Plus, ArrowRightLeft, LogOut, Search, Filter, Stethoscope, Clock, MapPin, X, CalendarPlus, FileHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

export default function EncountersADTView() {
  const [activeTab, setActiveTab] = useState('active');
  const [isAddEncounterOpen, setIsAddEncounterOpen] = useState(false);
  const [bedAssignments, setBedAssignments] = useState<any[]>([]);
  const [allBeds, setAllBeds] = useState<any[]>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [admitPatientUuid, setAdmitPatientUuid] = useState('');
  const [admitBedUuid, setAdmitBedUuid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Diagnosis Form State
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [certainty, setCertainty] = useState('PRESUMED');
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);

  // Transfer Form State
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferPatient, setTransferPatient] = useState<any>(null);
  const [transferBedUuid, setTransferBedUuid] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Stats
  const [recentDischarges, setRecentDischarges] = useState<any[]>([]);
  const [todayEncounters, setTodayEncounters] = useState<any[]>([]);

  const fetchBeds = () => {
    setLoading(true);
    fetchApi('/bed')
      .then(data => {
        const bedList = data.results || data || [];
        setAllBeds(bedList);

        // Active inpatients (no date_stopped)
        const mapped = bedList.flatMap((bed: any) => 
          bed.bed_patient_assignment_map
            ?.filter((a: any) => !a.date_stopped)
            .map((assignment: any) => ({
            mrn: `MRN-${String(assignment.patient_id || 0).padStart(5, '0')}`,
            name: (() => {
              const name = assignment.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
              return name ? `${name.given_name} ${name.family_name}` : 'Unknown';
            })(),
            loc: `${bed.bed_location_map?.[0]?.location?.name || 'Unknown Ward'} • ${bed.bed_number}`,
            time: `Admitted on ${new Date(assignment.date_started).toLocaleDateString()}`,
            status: bed.bed_type?.name === 'ICU' ? 'Critical' : 'Stable',
            provider: 'Dr. Unknown',
            assignmentUuid: assignment.uuid,
            encounterId: assignment.encounter_id || assignment.patient?.reverse_encounter_encounter_patient?.[0]?.encounter_id || null,
            patientId: assignment.patient_id,
          })) || []
        ) || [];
        setBedAssignments(mapped);

        // Recent discharges: bed assignments that were stopped today
        const todayStr = new Date().toDateString();
        const discharged = bedList.flatMap((bed: any) =>
          bed.bed_patient_assignment_map
            ?.filter((a: any) => a.date_stopped && new Date(a.date_stopped).toDateString() === todayStr)
            .map((a: any) => ({
              name: (() => {
                const n = a.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0];
                return n ? `${n.given_name} ${n.family_name}` : 'Unknown';
              })(),
              loc: `${bed.bed_location_map?.[0]?.location?.name || 'Unknown Ward'} • ${bed.bed_number}`,
              time: `Discharged at ${new Date(a.date_stopped).toLocaleTimeString()}`,
            })) || []
        );
        setRecentDischarges(discharged);

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch beds', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBeds();
    fetchApi('/patient').then(res => setAllPatients(res.results || res || [])).catch(console.error);
    // Fetch today's encounters for outpatient tab
    const today = new Date().toISOString().slice(0, 10);
    fetchApi(`/encounter?date=${today}&v=full`)
      .then(res => setTodayEncounters(res.results || res || []))
      .catch(() => setTodayEncounters([]));
  }, []);

  const handleAdmitPatient = async () => {
    if (!admitPatientUuid || !admitBedUuid) return toast.error('Please provide patient UUID and select a bed.');
    setIsSubmitting(true);
    try {
      await fetchApi(`/bed/${admitBedUuid}/admit`, {
        method: 'POST',
        body: JSON.stringify({ patientUuid: admitPatientUuid })
      });
      setIsAddEncounterOpen(false);
      setAdmitPatientUuid('');
      setAdmitBedUuid('');
      fetchBeds(); // Refresh list
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDiagnosis = async () => {
    if (!diagnosisText || !selectedEncounter?.encounterId || !selectedEncounter?.patientId) {
      return toast.error('Encounter ID is missing or diagnosis is empty.');
    }
    setIsSubmittingDiagnosis(true);
    try {
      await fetchApi(`/diagnosis`, {
        method: 'POST',
        body: JSON.stringify({
          encounterId: selectedEncounter.encounterId,
          patientId: selectedEncounter.patientId,
          diagnosisNonCoded: diagnosisText,
          certainty
        })
      });
      toast.success('Diagnosis added successfully!');
      setIsAddDiagnosisOpen(false);
      setDiagnosisText('');
      setCertainty('PRESUMED');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingDiagnosis(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferBedUuid || !transferPatient?.assignmentUuid) return toast.error('Please select a target bed.');
    setIsSubmittingTransfer(true);
    try {
      await fetchApi(`/bed/assignment/${transferPatient.assignmentUuid.trim()}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ newBedUuid: transferBedUuid })
      });
      setIsTransferOpen(false);
      setTransferPatient(null);
      setTransferBedUuid('');
      fetchBeds();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const handleDischarge = async (assignmentUuid: string, patientName: string) => {
    if (!window.confirm(`Discharge ${patientName} from their bed? This will free the bed.`)) return;
    try {
      await fetchApi(`/bed/assignment/${assignmentUuid.trim()}/discharge`, { method: 'POST' });
      fetchBeds();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Encounters & ADT</h1>
          <p className="text-muted-foreground text-sm">Admissions, Discharges, Transfers, and Ward Management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search active encounters..." 
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddEncounterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> New Encounter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border px-2">
        <button 
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'active' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Active Inpatients ({bedAssignments.length})
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('outpatient')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'outpatient' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Today's Outpatients ({todayEncounters.length})
          {activeTab === 'outpatient' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'recent' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Recent Discharges ({recentDischarges.length})
          {activeTab === 'recent' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Main Content (Grid of Patient Cards for Ward Board) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
        {loading ? (
          <div className="col-span-full flex justify-center py-10"><span className="text-muted-foreground animate-pulse">Loading ADT Data...</span></div>
        ) : activeTab === 'recent' ? (
          recentDischarges.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
              <LogOut size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-foreground">No discharges today</p>
              <p className="text-sm mt-1">No patients have been discharged today.</p>
            </div>
          ) : recentDischarges.map((d, i) => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">{d.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.loc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Clock size={12} /> {d.time}
              </div>
            </div>
          ))
        ) : activeTab === 'outpatient' ? (
          todayEncounters.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
              <Activity size={48} className="mb-4 opacity-20" />
              <p className="font-medium text-foreground">No outpatient encounters today</p>
            </div>
          ) : todayEncounters.map((enc: any, i: number) => {
            const nameArr = enc.patient_encounter_patient?.person_person_id_for_patient?.reverse_person_name_name_for_person;
            const name = nameArr?.[0] ? `${nameArr[0].given_name} ${nameArr[0].family_name}` : 'Unknown Patient';
            const providerArr = enc.reverse_encounter_provider_encounter_id_fk;
            const providerRaw = providerArr?.[0]?.provider_provider_id_fk;
            const providerNameArr = providerRaw?.person_provider_person_id_fk?.reverse_person_name_name_for_person;
            const providerName = providerNameArr?.[0]
              ? `${providerNameArr[0].given_name} ${providerNameArr[0].family_name}`
              : providerRaw?.name || 'Unassigned';
            const location = enc.location_encounter_location?.name || 'Unknown';
            const encType = enc.encounter_type_encounter_type_id?.name || 'Encounter';
            const time = enc.encounter_datetime ? new Date(enc.encounter_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
            return (
              <div key={enc.uuid || i} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                <div className="p-4 border-b border-border/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{name}</h3>
                      <span className="text-[11px] font-bold text-blue-500">MRN-{String(enc.patient_id || 0).padStart(5, '0')}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">{encType}</span>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin size={13} className="text-primary/70" /> {location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Stethoscope size={13} className="text-primary/70" /> {providerName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock size={13} className="text-primary/70" /> {time}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : bedAssignments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-border border-dashed rounded-xl">
            <Activity size={48} className="mb-4 opacity-20" />
            <p className="font-medium text-foreground">No active inpatients</p>
            <p className="text-sm mt-1">There are currently no patients assigned to beds.</p>
          </div>
        ) : bedAssignments.map((patient, i) => (
            <div key={i} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
            {/* Status indicator strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              patient.status === 'Critical' ? 'bg-destructive' : 
              patient.status === 'Pending Discharge' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            
            <div className="p-4 border-b border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{patient.name}</h3>
                  <span className="text-[11px] font-bold text-primary">{patient.mrn}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  patient.status === 'Critical' ? 'bg-destructive/10 text-destructive' : 
                  patient.status === 'Pending Discharge' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
                }`}>
                  {patient.status}
                </span>
              </div>
              
              <div className="space-y-1.5 mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={14} className="text-primary/70" /> {patient.loc}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stethoscope size={14} className="text-primary/70" /> {patient.provider}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={14} className="text-primary/70" /> {patient.time}
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted/20 flex flex-wrap items-center justify-between gap-2 mt-auto">
              <button 
                onClick={() => {
                  setSelectedEncounter(patient);
                  setIsAddDiagnosisOpen(true);
                }}
                className="flex-[1_1_45%] py-1.5 bg-card hover:bg-muted border border-border rounded text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <FileHeart size={14} className="text-pink-500" /> Diagnosis
              </button>
              <button className="flex-[1_1_45%] py-1.5 bg-card hover:bg-muted border border-border rounded text-xs font-medium text-foreground transition-colors flex items-center justify-center gap-1.5"
                onClick={() => {
                  setTransferPatient(patient);
                  setTransferBedUuid('');
                  setIsTransferOpen(true);
                }}
              >
                <ArrowRightLeft size={14} /> Transfer
              </button>
              <button 
                onClick={() => handleDischarge(patient.assignmentUuid, patient.name)}
                className="flex-[1_1_100%] py-1.5 bg-card hover:bg-destructive/10 border border-border rounded text-xs font-medium text-destructive transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} /> Discharge Patient
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Encounter Modal */}
      <AnimatePresence>
        {isAddEncounterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEncounterOpen(false)}
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
                  <CalendarPlus size={20} className="text-primary"/> Admit Patient to Bed
                </h2>
                <button 
                  onClick={() => setIsAddEncounterOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Patient *</label>
                  <select 
                    value={admitPatientUuid}
                    onChange={(e) => setAdmitPatientUuid(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select a patient...</option>
                    {allPatients.map((p: any) => (
                      <option key={p.uuid} value={p.uuid}>
                        {p.givenName} {p.familyName} - MRN-{String(p.personId || 0).padStart(5, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Available Bed *</label>
                  <select 
                    value={admitBedUuid}
                    onChange={(e) => setAdmitBedUuid(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select a bed...</option>
                    {allBeds.filter(b => b.status === 'AVAILABLE').map(bed => (
                      <option key={bed.uuid} value={bed.uuid}>
                        {bed.bed_type?.name} - {bed.bed_number} (Ward: {bed.bed_location_map?.[0]?.location?.name || 'Unknown'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3 mt-4">
                <button 
                  onClick={() => setIsAddEncounterOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-md transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdmitPatient}
                  disabled={isSubmitting || !admitPatientUuid || !admitBedUuid}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? <span className="animate-spin">⌛</span> : <Plus size={16} />}
                  Admit Patient
                </button>
              </div>
            </motion.div>
          </>
        )}

        {isAddDiagnosisOpen && selectedEncounter && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddDiagnosisOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <FileHeart size={20} className="text-pink-500"/> Add Diagnosis
                </h2>
                <button onClick={() => setIsAddDiagnosisOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Patient: {selectedEncounter.name}</p>
                  <p className="text-xs text-muted-foreground">MRN: {selectedEncounter.mrn} • Encounter: {selectedEncounter.encounterId || 'None'}</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Diagnosis Details *</label>
                  <textarea 
                    value={diagnosisText}
                    onChange={(e) => setDiagnosisText(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24" 
                    placeholder="Enter diagnosis description..." 
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Certainty</label>
                  <select 
                    value={certainty}
                    onChange={(e) => setCertainty(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="PRESUMED">Presumed</option>
                    <option value="CONFIRMED">Confirmed</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button onClick={() => setIsAddDiagnosisOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-md transition-colors shadow-sm">Cancel</button>
                <button 
                  onClick={handleAddDiagnosis}
                  disabled={isSubmittingDiagnosis || !diagnosisText || !selectedEncounter.encounterId}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmittingDiagnosis ? 'Saving...' : 'Save Diagnosis'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isTransferOpen && transferPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTransferOpen(false)}
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
                  <ArrowRightLeft size={20} className="text-primary" /> Transfer Patient
                </h2>
                <button onClick={() => setIsTransferOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-muted/40 rounded-lg px-4 py-3 text-sm">
                  <p className="font-medium text-foreground">{transferPatient.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">Currently in: <span className="text-foreground">{transferPatient.loc}</span></p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Transfer to Bed *</label>
                  <select
                    value={transferBedUuid}
                    onChange={(e) => setTransferBedUuid(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                  >
                    <option value="">Select an available bed...</option>
                    {allBeds
                      .filter((b: any) => b.status === 'AVAILABLE')
                      .map((b: any) => (
                        <option key={b.uuid} value={b.uuid}>
                          {b.bed_number} — {b.bed_type?.name} ({b.bed_location_map?.[0]?.location?.name || 'Unknown Ward'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end gap-3">
                <button onClick={() => setIsTransferOpen(false)} className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-muted rounded-md transition-colors shadow-sm">Cancel</button>
                <button
                  onClick={handleTransfer}
                  disabled={isSubmittingTransfer || !transferBedUuid}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmittingTransfer ? 'Transferring...' : <><ArrowRightLeft size={14} /> Confirm Transfer</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
