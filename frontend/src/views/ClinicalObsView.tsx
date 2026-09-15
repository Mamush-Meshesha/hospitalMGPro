import React, { useState, useEffect } from 'react';
import { Search, Filter, Activity, Thermometer, HeartPulse, Droplet, Download, Plus, X, ClipboardPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';
import { downloadCSV } from '../utils/export';

const VITAL_CONCEPT_IDS = {
  heartRate: 5087,
  systolic: 5085,
  diastolic: 5086,
  temperature: 5088,
  spo2: 5092,
};

export default function ClinicalObsView() {
  // ─── Patient list ───────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Obs data ───────────────────────────────────────────────────────────────
  const [obsData, setObsData] = useState<any[]>([]);
  const [obsLoading, setObsLoading] = useState(false);

  // ─── Record Obs modal ───────────────────────────────────────────────────────
  const [isAddObsOpen, setIsAddObsOpen] = useState(false);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<any[]>([]);

  // Form state
  const [formPatientUuid, setFormPatientUuid] = useState('');
  const [formConceptId, setFormConceptId] = useState('');
  const [formEncounterUuid, setFormEncounterUuid] = useState('');
  const [formLocationId, setFormLocationId] = useState('');
  const [formDatetime, setFormDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [formValueNumeric, setFormValueNumeric] = useState('');
  const [formValueText, setFormValueText] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedConcept = concepts.find((c: any) => String(c.concept_id) === formConceptId);
  const conceptType = selectedConcept?.datatype_concept?.name || selectedConcept?.concept_class?.name || 'Numeric';
  const isNumeric = !formConceptId || conceptType.toLowerCase().includes('numeric') || conceptType.toLowerCase().includes('measur');
  const isText = conceptType.toLowerCase().includes('text') || conceptType.toLowerCase().includes('free');

  // ─── Load patients ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchApi('/patient')
      .then(res => {
        const list = res.results || res || [];
        setPatients(list);
        if (list.length > 0) setSelectedPatient(list[0]);
      })
      .catch(console.error);

    fetchApi('/concept?v=full')
      .then(res => setConcepts(res.results || res || []))
      .catch(console.error);

    fetchApi('/location')
      .then(res => setLocations(res.results || res || []))
      .catch(console.error);
  }, []);

  // ─── Load obs for selected patient ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedPatient?.uuid) return;
    setObsLoading(true);
    fetchApi(`/obs?personUuid=${selectedPatient.uuid}&v=full`)
      .then(res => {
        const list = res.results || res || [];
        setObsData(Array.isArray(list) ? list : []);
      })
      .catch(() => setObsData([]))
      .finally(() => setObsLoading(false));
  }, [selectedPatient]);

  // ─── Load encounters when a patient is selected in form ─────────────────────
  useEffect(() => {
    if (!formPatientUuid) { setEncounters([]); return; }
    const pat = patients.find(p => p.uuid === formPatientUuid);
    if (!pat) return;
    fetchApi(`/encounter/patient/${pat.uuid}`)
      .then(res => setEncounters(res.results || res || []))
      .catch(() => setEncounters([]));
  }, [formPatientUuid, patients]);

  // ─── Vitals helpers ─────────────────────────────────────────────────────────
  const getLatest = (conceptId: number) =>
    obsData.find(o => o.concept_id === conceptId);

  const hr = getLatest(VITAL_CONCEPT_IDS.heartRate);
  const sys = getLatest(VITAL_CONCEPT_IDS.systolic);
  const dia = getLatest(VITAL_CONCEPT_IDS.diastolic);
  const temp = getLatest(VITAL_CONCEPT_IDS.temperature);
  const spo2 = getLatest(VITAL_CONCEPT_IDS.spo2);

  const fmtTime = (dt: string) =>
    dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';

  // ─── Save observation ────────────────────────────────────────────────────────
  const handleSaveObs = async () => {
    if (!formPatientUuid || !formConceptId || !formDatetime) {
      return toast.error('Patient, Concept, and Date/Time are required.');
    }
    if (isNumeric && !formValueNumeric) return toast.error('Please enter a numeric value.');
    if (isText && !formValueText) return toast.error('Please enter a text value.');
    setIsSaving(true);
    try {
      await fetchApi('/obs', {
        method: 'POST',
        body: JSON.stringify({
          personUuid: formPatientUuid,
          conceptId: parseInt(formConceptId),
          encounterUuid: formEncounterUuid || undefined,
          locationId: formLocationId ? parseInt(formLocationId) : undefined,
          obsDatetime: formDatetime,
          valueNumeric: isNumeric && formValueNumeric ? parseFloat(formValueNumeric) : undefined,
          valueText: isText ? formValueText : undefined,
          comment: formComment || undefined,
        }),
      });
      setIsAddObsOpen(false);
      // Refresh obs if we saved for the currently selected patient
      if (formPatientUuid === selectedPatient?.uuid) {
        fetchApi(`/obs?personUuid=${selectedPatient.uuid}&v=full`)
          .then(res => setObsData(res.results || res || []))
          .catch(console.error);
      }
      setFormValueNumeric(''); setFormValueText(''); setFormComment('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Filtered patients ───────────────────────────────────────────────────────
  const filteredPatients = patients.filter(p => {
    const name = `${p.givenName} ${p.familyName}`.toLowerCase();
    const mrn = `MRN-${String(p.personId).padStart(5, '0')}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || mrn.includes(searchQuery.toLowerCase());
  });

  const patientName = selectedPatient
    ? `${selectedPatient.givenName || '?'} ${selectedPatient.familyName || ''}`.trim()
    : 'No patient selected';

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Clinical Observations</h1>
          <p className="text-muted-foreground text-sm">Patient Vitals, Lab Results, and Clinical Notes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by patient name or MRN..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button
            onClick={() => { setFormPatientUuid(selectedPatient?.uuid || ''); setIsAddObsOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Record Obs
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
        {/* Left Sidebar: Patient Select */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-foreground">Patients</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{patients.length} total</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No patients found</p>
            ) : filteredPatients.map((p: any) => {
              const isActive = selectedPatient?.uuid === p.uuid;
              const name = `${p.givenName || '?'} ${p.familyName || ''}`.trim();
              const mrn = `MRN-${String(p.personId).padStart(5, '0')}`;
              return (
                <button
                  key={p.uuid}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full flex flex-col items-start p-3 rounded-lg transition-colors text-left ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}
                >
                  <span className={`font-semibold text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>{name}</span>
                  <span className="text-xs text-muted-foreground">{mrn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content: Obs Data */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          {/* Patient banner */}
          {selectedPatient && (
            <div className="bg-muted/40 border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {(selectedPatient.givenName || '?').charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{patientName}</p>
                <p className="text-xs text-muted-foreground">MRN-{String(selectedPatient.personId).padStart(5, '0')} • {selectedPatient.gender} • {selectedPatient.birthdate ? new Date(selectedPatient.birthdate).toLocaleDateString() : 'DOB unknown'}</p>
              </div>
            </div>
          )}

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Heart Rate */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <HeartPulse size={16} className="text-rose-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Heart Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{hr?.value_numeric ?? '—'}</span>
                <span className="text-xs text-muted-foreground">bpm</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">{hr ? fmtTime(hr.obs_datetime) : 'No data'}</span>
            </div>

            {/* Blood Pressure */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Activity size={16} className="text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Blood Press.</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  {sys?.value_numeric ?? '—'}/{dia?.value_numeric ?? '—'}
                </span>
                <span className="text-xs text-muted-foreground">mmHg</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">{sys ? fmtTime(sys.obs_datetime) : 'No data'}</span>
            </div>

            {/* Temperature */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Thermometer size={16} className="text-amber-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Temperature</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{temp?.value_numeric ?? '—'}</span>
                <span className="text-xs text-muted-foreground">°C</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">{temp ? fmtTime(temp.obs_datetime) : 'No data'}</span>
            </div>

            {/* SpO2 */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Droplet size={16} className="text-cyan-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">SpO2</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{spo2?.value_numeric ?? '—'}</span>
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 block">{spo2 ? fmtTime(spo2.obs_datetime) : 'No data'}</span>
            </div>
          </div>

          {/* Observation History Table */}
          <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground">
                Observation History
                <span className="ml-2 text-xs font-normal text-muted-foreground">({obsData.length} records)</span>
              </h3>
              <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium">
                <Download size={14} /> Export
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              {obsLoading ? (
                <div className="flex justify-center py-10">
                  <span className="text-muted-foreground animate-pulse text-sm">Loading observations...</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                      <th className="px-5 py-3">Date / Time</th>
                      <th className="px-5 py-3">Concept</th>
                      <th className="px-5 py-3">Value</th>
                      <th className="px-5 py-3">Patient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-foreground text-sm">
                    {obsData.length > 0 ? obsData.map((row: any, i: number) => {
                      const conceptName = row.concept_obs_concept?.concept_name?.[0]?.name
                        || row.concept?.name
                        || `Concept #${row.concept_id}`;
                      const value = row.value_numeric != null
                        ? row.value_numeric
                        : row.value_text || row.value_coded || 'N/A';
                      const personName = (() => {
                        const names = row.person_person_obs?.reverse_person_name_name_for_person;
                        if (names?.[0]) return `${names[0].given_name} ${names[0].family_name}`;
                        return `Person #${row.person_id}`;
                      })();
                      return (
                        <tr key={row.obs_id || i} className="hover:bg-muted/50 transition-colors">
                          <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-xs">
                            {new Date(row.obs_datetime).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 font-medium">{conceptName}</td>
                          <td className="px-5 py-3.5 font-bold text-primary">{value}</td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs">{personName}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                          No observations found for this patient.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Observation Modal */}
      <AnimatePresence>
        {isAddObsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddObsOpen(false)}
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
                  <ClipboardPlus size={20} className="text-primary" /> Record Observation
                </h2>
                <button onClick={() => setIsAddObsOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                {/* Patient */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Patient *</label>
                    <select
                      value={formPatientUuid}
                      onChange={e => setFormPatientUuid(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">Select patient...</option>
                      {patients.map((p: any) => (
                        <option key={p.uuid} value={p.uuid}>
                          {p.givenName} {p.familyName} — MRN-{String(p.personId).padStart(5, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Encounter <span className="text-muted-foreground font-normal">(Opt)</span></label>
                    <select
                      value={formEncounterUuid}
                      onChange={e => setFormEncounterUuid(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">None (Standalone)</option>
                      {encounters.map((enc: any) => (
                        <option key={enc.uuid} value={enc.uuid}>
                          {enc.encounter_type_encounter_type_id?.name || 'Encounter'} — {new Date(enc.encounter_datetime).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Concept & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Observation Concept *</label>
                    <select
                      value={formConceptId}
                      onChange={e => { setFormConceptId(e.target.value); setFormValueNumeric(''); setFormValueText(''); }}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">Select concept...</option>
                      {concepts.map((c: any) => {
                        const name = c.concept_name?.[0]?.name || c.name || `Concept #${c.concept_id}`;
                        return <option key={c.concept_id} value={c.concept_id}>{name}</option>;
                      })}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Location <span className="text-muted-foreground font-normal">(Opt)</span></label>
                    <select
                      value={formLocationId}
                      onChange={e => setFormLocationId(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                    >
                      <option value="">Select location...</option>
                      {locations.map((l: any) => (
                        <option key={l.location_id} value={l.location_id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date/Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    value={formDatetime}
                    onChange={e => setFormDatetime(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <hr className="border-border/50" />

                {/* Value Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-primary">Observation Value *</label>
                  {isText ? (
                    <textarea
                      value={formValueText}
                      onChange={e => setFormValueText(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all h-24 resize-none"
                      placeholder="Enter free-text observation..."
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={formValueNumeric}
                        onChange={e => setFormValueNumeric(e.target.value)}
                        className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        placeholder="Enter numeric value..."
                      />
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md border border-border">Units</span>
                    </div>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Comment <span className="text-muted-foreground font-normal">(Opt)</span></label>
                  <input
                    type="text"
                    value={formComment}
                    onChange={e => setFormComment(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddObsOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveObs}
                  disabled={isSaving || !formPatientUuid || !formConceptId}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Observation'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
