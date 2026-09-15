import React, { useState, useEffect } from 'react';
import { User, Activity, AlertTriangle, FileText, Stethoscope, FileHeart, ChevronLeft, Heart, Thermometer, Wind, Droplets, Plus, Shield, Pill, AlertOctagon, ClipboardList } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface PatientChartViewProps {
  patientId: number;
  onBack: () => void;
}

const vitalIcons: Record<string, React.ReactNode> = {
  'Pulse (Heart Rate)': <Heart size={18} className="text-red-500" />,
  'Temperature': <Thermometer size={18} className="text-orange-500" />,
  'Blood Oxygen Saturation (SpO2)': <Wind size={18} className="text-blue-400" />,
  'Systolic Blood Pressure': <Droplets size={18} className="text-purple-500" />,
  'Diastolic Blood Pressure': <Droplets size={18} className="text-purple-400" />,
};

const TABS = [
  { id: 'vitals', label: 'Vitals', icon: Activity, color: 'text-blue-500' },
  { id: 'conditions', label: 'Conditions', icon: FileHeart, color: 'text-red-500' },
  { id: 'allergies', label: 'Allergies', icon: AlertTriangle, color: 'text-orange-500' },
  { id: 'notes', label: 'Clinical Notes', icon: FileText, color: 'text-green-500' },
  { id: 'orders', label: 'Orders', icon: Stethoscope, color: 'text-purple-500' },
  { id: 'medications', label: 'Medications', icon: Pill, color: 'text-pink-500' },
  { id: 'immunizations', label: 'Immunizations', icon: Shield, color: 'text-teal-500' },
  { id: 'programs', label: 'Programs', icon: ClipboardList, color: 'text-indigo-500' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function PatientChartView({ patientId, onBack }: PatientChartViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('vitals');
  const [chartData, setChartData] = useState<any>(null);
  const [medications, setMedications] = useState<any>(null);
  const [patientPrograms, setPatientPrograms] = useState<any[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [submittingProgram, setSubmittingProgram] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalForm, setVitalForm] = useState({ hr: '', temp: '', spo2: '', systolic: '', diastolic: '' });
  const [submittingVitals, setSubmittingVitals] = useState(false);

  const [showConditionForm, setShowConditionForm] = useState(false);
  const [conditionForm, setConditionForm] = useState({ name: '', status: 'ACTIVE', detail: '' });
  const [submittingCondition, setSubmittingCondition] = useState(false);

  const [showAllergyForm, setShowAllergyForm] = useState(false);
  const [allergyForm, setAllergyForm] = useState({ allergen: '', reaction: '', type: 'DRUG' });
  const [submittingAllergy, setSubmittingAllergy] = useState(false);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteForm, setNoteForm] = useState({ text: '' });
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showImmunizationForm, setShowImmunizationForm] = useState(false);
  const [immunizationForm, setImmunizationForm] = useState({ conceptId: '886', dateAdministered: new Date().toISOString().split('T')[0] });
  const [submittingImmunization, setSubmittingImmunization] = useState(false);

  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [medicationForm, setMedicationForm] = useState({ conceptId: '2000', dose: '', doseUnits: '1618', frequency: '2', route: '160240', duration: '7' });
  const [submittingMedication, setSubmittingMedication] = useState(false);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ conceptId: '1000', instructions: '', urgency: 'ROUTINE' });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showManageAssignmentModal, setShowManageAssignmentModal] = useState(false);
  const [visitForm, setVisitForm] = useState({ visitTypeUuid: '', locationUuid: '', bedUuid: '' });
  const [manageAssignmentForm, setManageAssignmentForm] = useState({ locationUuid: '', bedUuid: '', providerUuid: '' });
  const [visitOptions, setVisitOptions] = useState({ locations: [], visitTypes: [], beds: [], providers: [] });
  const [submittingVisit, setSubmittingVisit] = useState(false);

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVisit(true);
    try {
      const visitRes = await fetchApi('/visit/admit', {
        method: 'POST',
        body: JSON.stringify({ 
          patientUuid: chartData.patient.person_person_id_for_patient?.uuid || chartData.patient.uuid, 
          locationUuid: visitForm.locationUuid, 
          visitTypeUuid: visitForm.visitTypeUuid 
        })
      });
      if (visitForm.bedUuid && visitRes?.encounter?.uuid) {
        await fetchApi(`/bed/${visitForm.bedUuid}/admit`, {
          method: 'POST',
          body: JSON.stringify({ 
            patientUuid: chartData.patient.person_person_id_for_patient?.uuid || chartData.patient.uuid, 
            encounterUuid: visitRes.encounter.uuid 
          })
        });
      }
      setShowVisitModal(false);
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Visit processed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to process visit');
      console.error(err);
    } finally {
      setSubmittingVisit(false);
    }
  };

  const handleManageAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const activeVisit = chartData?.patient?.reverse_visit_visit_patient_fk?.find((v: any) => !v.date_stopped && !v.voided);
      if (!activeVisit) return;
      
      await fetchApi(`/visit/${activeVisit.uuid}/assign`, {
        method: 'PUT',
        body: JSON.stringify(manageAssignmentForm)
      });
      setShowManageAssignmentModal(false);
      // Re-fetch chart data
      const resFull = await fetchApi(`/patient-chart/${patientId}/full`);
      setChartData(resFull);
      toast.success('Assignment updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update assignment');
      console.error('Failed to update assignment', err);
    }
  };

  const handleVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVitals(true);
    const vitalsPayload = [];
    if (vitalForm.hr) vitalsPayload.push({ concept_id: 5087, value_numeric: parseFloat(vitalForm.hr) });
    if (vitalForm.temp) vitalsPayload.push({ concept_id: 5088, value_numeric: parseFloat(vitalForm.temp) });
    if (vitalForm.spo2) vitalsPayload.push({ concept_id: 5092, value_numeric: parseFloat(vitalForm.spo2) });
    if (vitalForm.systolic) vitalsPayload.push({ concept_id: 5085, value_numeric: parseFloat(vitalForm.systolic) });
    if (vitalForm.diastolic) vitalsPayload.push({ concept_id: 5086, value_numeric: parseFloat(vitalForm.diastolic) });

    try {
      const res = await fetchApi(`/patient-chart/${patientId}/vitals`, {
        method: 'POST',
        body: JSON.stringify({ vitals: vitalsPayload })
      });
      setShowVitalsForm(false);
      setVitalForm({ hr: '', temp: '', spo2: '', systolic: '', diastolic: '' });
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`);
      setChartData(newDataRes);
      toast.success('Vitals added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vitals');
      console.error(err);
    } finally {
      setSubmittingVitals(false);
    }
  };

  const handleConditionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCondition(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/conditions`, {
        method: 'POST',
        body: JSON.stringify(conditionForm)
      });
      setShowConditionForm(false);
      setConditionForm({ name: '', status: 'ACTIVE', detail: '' });
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Condition logged successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to log condition');
      console.error(err);
    } finally {
      setSubmittingCondition(false);
    }
  };

  const handleAllergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAllergy(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/allergies`, {
        method: 'POST',
        body: JSON.stringify(allergyForm)
      });
      setShowAllergyForm(false);
      setAllergyForm({ allergen: '', reaction: '', type: 'DRUG' });
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Allergy recorded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record allergy');
      console.error(err);
    } finally {
      setSubmittingAllergy(false);
    }
  };

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingNote(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/notes`, {
        method: 'POST',
        body: JSON.stringify(noteForm)
      });
      setShowNoteForm(false);
      setNoteForm({ text: '' });
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Note saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save note');
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleImmunizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingImmunization(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/immunizations`, {
        method: 'POST',
        body: JSON.stringify(immunizationForm)
      });
      setShowImmunizationForm(false);
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Immunization recorded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record immunization');
      console.error(err);
    } finally {
      setSubmittingImmunization(false);
    }
  };

  const handleMedicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingMedication(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/medications`, {
        method: 'POST',
        body: JSON.stringify(medicationForm)
      });
      setShowMedicationForm(false);
      const newMedsRes = await fetchApi(`/medications/patient/${patientId}`).catch(() => ({ results: [] }));
      setMedications(newMedsRes);
      toast.success('Medication ordered successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to order medication');
      console.error(err);
    } finally {
      setSubmittingMedication(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOrder(true);
    try {
      await fetchApi(`/patient-chart/${patientId}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderForm)
      });
      setShowOrderForm(false);
      const newDataRes = await fetchApi(`/patient-chart/${patientId}/full`).catch(() => null);
      if (newDataRes) setChartData(newDataRes);
      toast.success('Order placed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
      console.error(err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const prepareChartData = () => {
    if (!chartData?.vitals) return [];
    const grouped: any = {};
    [...chartData.vitals].reverse().forEach((v: any) => {
      const time = new Date(v.obs_datetime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      if (!grouped[time]) grouped[time] = { time };
      const name = getConceptName(v.concept_obs_concept);
      grouped[time][name] = v.value_numeric;
    });
    return Object.values(grouped);
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const [resFull, resMeds, resProgs, resAvailProgs, resLocs, resVisitTypes, resBeds, resProviders] = await Promise.all([
          fetchApi(`/patient-chart/${patientId}/full`).catch(() => null),
          fetchApi(`/medications/patient/${patientId}`).catch(() => ({ results: [] })),
          fetchApi(`/patient-program/patient/${patientId}`).catch(() => ({ results: [] })),
          fetchApi(`/program?v=full`).catch(() => ({ results: [] })),
          fetchApi(`/location?v=full`).catch(() => ({ results: [] })),
          fetchApi(`/visittype`).catch(() => ({ results: [] })),
          fetchApi(`/bed`).catch(() => ({ results: [] })),
          fetchApi(`/provider`).catch(() => ({ results: [] }))
        ]);

        setChartData(resFull);
        setMedications(resMeds);
        setPatientPrograms(resProgs);
        setAvailablePrograms(resAvailProgs.results || resAvailProgs || []);
        setVisitOptions({ 
          locations: resLocs.results || resLocs || [], 
          visitTypes: resVisitTypes.results || resVisitTypes || [],
          beds: resBeds.results || resBeds || [],
          providers: resProviders.results || resProviders || []
        });
        console.log('--- VISIT OPTIONS BEDS ---', resBeds.results || resBeds);
      } catch (error) {
        console.error('Failed to fetch patient chart', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [patientId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Patient Chart...</p>
        </div>
      </div>
    );
  }

  const getConceptName = (concept: any) =>
    concept?.reverse_concept_name_name_for_concept?.[0]?.name || 'Unknown';

  const hasCriticalFlags = chartData?.allergies?.length > 0 || chartData?.conditions?.some((c: any) => c.clinical_status === 'ACTIVE');

  return (
    <div className="w-full h-full flex flex-col space-y-4">

      {/* Patient Banner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft size={18} /> Back to Patients
            </button>
          </div>
          {chartData?.patient?.reverse_visit_visit_patient_fk?.some((v: any) => !v.date_stopped && !v.voided) ? (
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const activeVisit = chartData?.patient?.reverse_visit_visit_patient_fk?.find((v: any) => !v.date_stopped && !v.voided);
                  if (activeVisit) {
                    setManageAssignmentForm({
                      locationUuid: activeVisit.location_visit_location_fk?.uuid || '',
                      bedUuid: '', // default empty, or fetch current bed
                      providerUuid: '' // default empty, or fetch current provider
                    });
                  }
                  setShowManageAssignmentModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity"
              >
                <Activity size={16} /> Manage Assignment
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowVisitModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              <Activity size={16} /> Start Visit / Admit
            </button>
          )}
        </div>

        {hasCriticalFlags && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg flex items-center gap-3">
            <AlertOctagon size={20} className="animate-pulse" />
            <div className="flex-1">
              <span className="font-bold mr-2">MEDICAL FLAGS:</span>
              <span>This patient has active severe allergies or critical conditions. Check the Allergies and Conditions tabs before prescribing.</span>
            </div>
          </div>
        )}

        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
              P
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {chartData?.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.given_name} {chartData?.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person?.[0]?.family_name}
              </h2>
              <p className="text-sm text-muted-foreground">MRN-{patientId.toString().padStart(5, '0')} • EMR Patient Chart</p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Vitals</p>
              <p className="font-bold text-foreground">{chartData?.vitals?.length || 0} recorded</p>
            </div>
            <div className="text-right border-l border-border pl-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Orders</p>
              <p className="font-bold text-foreground">{chartData?.orders?.length || 0} orders</p>
            </div>
            <div className="text-right border-l border-border pl-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Allergies</p>
              <p className={`font-bold ${chartData?.allergies?.length > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {chartData?.allergies?.length > 0 ? `⚠️ ${chartData.allergies.length}` : '✓ None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation + Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Sidebar Tabs */}
        <div className="w-52 shrink-0 flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ x: isActive ? 0 : 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-foreground' : tab.color} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-card border border-border rounded-xl p-6 overflow-y-auto shadow-sm">

          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" /> Vitals History
                </h3>
                <button 
                  onClick={() => setShowVitalsForm(!showVitalsForm)}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Record Vitals
                </button>
              </div>

              <AnimatePresence>
                {showVitalsForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleVitalsSubmit} className="bg-muted/30 border border-border p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm">New Vitals Entry</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Heart Rate (bpm)</label>
                          <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={vitalForm.hr} onChange={e => setVitalForm({...vitalForm, hr: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Temp (°C)</label>
                          <input type="number" step="0.1" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={vitalForm.temp} onChange={e => setVitalForm({...vitalForm, temp: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">SpO2 (%)</label>
                          <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={vitalForm.spo2} onChange={e => setVitalForm({...vitalForm, spo2: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Systolic BP</label>
                          <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={vitalForm.systolic} onChange={e => setVitalForm({...vitalForm, systolic: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Diastolic BP</label>
                          <input type="number" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={vitalForm.diastolic} onChange={e => setVitalForm({...vitalForm, diastolic: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowVitalsForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingVitals} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">{submittingVitals ? 'Saving...' : 'Save Vitals'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {chartData?.vitals?.length > 0 && (
                <div className="h-64 w-full bg-muted/10 border border-border rounded-xl p-4 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="Pulse (Heart Rate)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Temperature" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="Blood Oxygen Saturation (SpO2)" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {chartData?.vitals?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartData.vitals.slice(0, 6).map((v: any) => {
                    const name = getConceptName(v.concept_obs_concept);
                    return (
                      <div key={v.obs_id} className="p-4 bg-muted/30 border border-border rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          {vitalIcons[name] || <Activity size={18} />}
                          <span>{name}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {v.value_numeric ?? v.value_text ?? '—'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(v.obs_datetime).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No vitals recorded for this patient.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileHeart size={20} className="text-red-500" /> Diagnoses & Conditions
                </h3>
                <button 
                  onClick={() => setShowConditionForm(!showConditionForm)}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Record Condition
                </button>
              </div>

              <AnimatePresence>
                {showConditionForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleConditionSubmit} className="bg-muted/30 border border-border p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm">New Condition</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Condition Name</label>
                          <input type="text" required className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={conditionForm.name} onChange={e => setConditionForm({...conditionForm, name: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">Status</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={conditionForm.status} onChange={e => setConditionForm({...conditionForm, status: e.target.value})}>
                            <option value="ACTIVE">Active</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-muted-foreground block mb-1">Additional Details</label>
                          <input type="text" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={conditionForm.detail} onChange={e => setConditionForm({...conditionForm, detail: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowConditionForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingCondition} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">{submittingCondition ? 'Saving...' : 'Save Condition'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {chartData?.conditions?.length > 0 ? (
                <div className="space-y-3">
                  {chartData.conditions.map((c: any) => (
                    <div key={c.condition_id} className="p-4 border border-border rounded-xl bg-muted/20 flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {getConceptName(c.concept_condition_condition_coded_fk) !== 'Unknown'
                            ? getConceptName(c.concept_condition_condition_coded_fk)
                            : c.condition_non_coded || 'Unspecified Condition'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {c.additional_detail || 'No additional detail'}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        c.clinical_status === 'ACTIVE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {c.clinical_status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileHeart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No conditions recorded.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'allergies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <AlertTriangle size={20} className="text-orange-500" /> Allergies & Adverse Reactions
                </h3>
                <button 
                  onClick={() => setShowAllergyForm(!showAllergyForm)}
                  className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  <Plus size={16} /> Record Allergy
                </button>
              </div>

              <AnimatePresence>
                {showAllergyForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleAllergySubmit} className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm text-orange-800 dark:text-orange-400">New Allergy Entry</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-orange-700/70 dark:text-orange-400/70 block mb-1">Allergen (e.g., Penicillin, Peanuts)</label>
                          <input type="text" required className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={allergyForm.allergen} onChange={e => setAllergyForm({...allergyForm, allergen: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-orange-700/70 dark:text-orange-400/70 block mb-1">Type</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={allergyForm.type} onChange={e => setAllergyForm({...allergyForm, type: e.target.value})}>
                            <option value="DRUG">Drug Allergy</option>
                            <option value="FOOD">Food Allergy</option>
                            <option value="ENVIRONMENT">Environmental</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-orange-700/70 dark:text-orange-400/70 block mb-1">Reaction Description</label>
                          <input type="text" placeholder="e.g., Hives, Anaphylaxis" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={allergyForm.reaction} onChange={e => setAllergyForm({...allergyForm, reaction: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowAllergyForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingAllergy} className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600">{submittingAllergy ? 'Saving...' : 'Save Allergy'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {chartData?.allergies?.length > 0 ? (
                <div className="space-y-3">
                  {chartData.allergies.map((a: any) => (
                    <div key={a.allergy_id} className="p-4 border border-orange-200 bg-orange-50/40 dark:bg-orange-900/10 rounded-xl">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-orange-800 dark:text-orange-400">
                          {getConceptName(a.concept_allergy_coded_allergen_fk) !== 'Unknown'
                            ? getConceptName(a.concept_allergy_coded_allergen_fk)
                            : a.non_coded_allergen || 'Unknown Allergen'}
                        </p>
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          {a.allergen_type}
                        </span>
                      </div>
                      {a.comments && <p className="text-sm text-orange-600/70 mt-1">{a.comments}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle size={40} className="mx-auto mb-3 opacity-30 text-orange-300" />
                  <p className="text-green-600 font-medium">No Known Allergies (NKA)</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={20} className="text-green-500" /> Clinical Notes
                </h3>
                <button 
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} /> Add Note
                </button>
              </div>

              <AnimatePresence>
                {showNoteForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleNoteSubmit} className="bg-muted/30 border border-border p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm">New Clinical Note</h4>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Note Content</label>
                        <textarea required rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-y" value={noteForm.text} onChange={e => setNoteForm({...noteForm, text: e.target.value})} placeholder="Enter clinical observations, plans, or general notes..." />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowNoteForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingNote} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">{submittingNote ? 'Saving...' : 'Save Note'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {chartData?.notes?.length > 0 ? (
                <div className="space-y-4">
                  {chartData.notes.map((n: any) => (
                    <div key={n.note_id} className="p-5 border border-border rounded-xl bg-card shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                          {n.note_type || 'Clinical Note'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(n.date_created).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        By: {n.users_user_who_created_note?.username || 'Unknown Provider'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No clinical notes recorded.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Stethoscope size={20} className="text-purple-500" /> Active Orders
                </h3>
                <button 
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  <Plus size={16} /> Create Order
                </button>
              </div>

              <AnimatePresence>
                {showOrderForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleOrderSubmit} className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm text-purple-800 dark:text-purple-400">New Clinical Order</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-purple-700/70 dark:text-purple-400/70 block mb-1">Order Type</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={orderForm.conceptId} onChange={e => setOrderForm({...orderForm, conceptId: e.target.value})}>
                            <option value="1000">Complete Blood Count (CBC)</option>
                            <option value="1001">Chest X-Ray</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-purple-700/70 dark:text-purple-400/70 block mb-1">Urgency</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={orderForm.urgency} onChange={e => setOrderForm({...orderForm, urgency: e.target.value})}>
                            <option value="ROUTINE">Routine</option>
                            <option value="STAT">STAT (Urgent)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-purple-700/70 dark:text-purple-400/70 block mb-1">Clinical Instructions / Notes</label>
                          <input type="text" placeholder="e.g., Please notify provider when results are available" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={orderForm.instructions} onChange={e => setOrderForm({...orderForm, instructions: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowOrderForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingOrder} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">{submittingOrder ? 'Saving...' : 'Place Order'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              {chartData?.orders?.length > 0 ? (
                <div className="space-y-3">
                  {chartData.orders.map((o: any) => {
                    const orderTypeMap: Record<number, { label: string; color: string }> = {
                      1: { label: 'Drug', color: 'bg-green-100 text-green-700' },
                      2: { label: 'Lab', color: 'bg-blue-100 text-blue-700' },
                      3: { label: 'Radiology', color: 'bg-purple-100 text-purple-700' },
                    };
                    const meta = orderTypeMap[o.order_type_id] || { label: o.order_type_type_of_order?.name || 'Order', color: 'bg-muted text-muted-foreground' };
                    return (
                      <div key={o.order_id} className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                          <div>
                            <p className="font-medium text-foreground">{o.instructions || `Order #${o.order_id}`}</p>
                            <p className="text-sm text-muted-foreground">#{o.order_number}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          o.urgency === 'STAT' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
                        }`}>
                          {o.urgency}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Stethoscope size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No active orders.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Pill size={20} className="text-pink-500" /> Medications Timeline
                </h3>
                <button 
                  onClick={() => setShowMedicationForm(!showMedicationForm)}
                  className="flex items-center gap-1 bg-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  <Plus size={16} /> Prescribe Meds
                </button>
              </div>

              <AnimatePresence>
                {showMedicationForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleMedicationSubmit} className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/50 p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm text-pink-800 dark:text-pink-400">New Prescription</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                          <label className="text-xs text-pink-700/70 dark:text-pink-400/70 block mb-1">Medication (from Formulary)</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={medicationForm.conceptId} onChange={e => setMedicationForm({...medicationForm, conceptId: e.target.value})}>
                            <option value="2000">Amoxicillin 500mg</option>
                            <option value="2002">Ibuprofen 400mg</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-pink-700/70 dark:text-pink-400/70 block mb-1">Dose (Amount)</label>
                          <input type="number" required placeholder="e.g., 500" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={medicationForm.dose} onChange={e => setMedicationForm({...medicationForm, dose: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs text-pink-700/70 dark:text-pink-400/70 block mb-1">Frequency</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={medicationForm.frequency} onChange={e => setMedicationForm({...medicationForm, frequency: e.target.value})}>
                            <option value="1">Once a day (QD)</option>
                            <option value="2">Twice a day (BID)</option>
                            <option value="3">Three times a day (TID)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-pink-700/70 dark:text-pink-400/70 block mb-1">Duration (Days)</label>
                          <input type="number" required placeholder="e.g., 7" className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={medicationForm.duration} onChange={e => setMedicationForm({...medicationForm, duration: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowMedicationForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingMedication} className="px-4 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700">{submittingMedication ? 'Saving...' : 'Prescribe'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Medications */}
              <div className="space-y-3">
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Active Prescriptions
                </h4>
                {medications?.active?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medications.active.map((m: any, i: number) => (
                      <div key={i} className="p-4 border border-green-500/30 bg-green-500/5 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-foreground text-lg">{m.drugName}</p>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{m.dose} {m.doseUnit} • {m.frequency} • {m.route}</p>
                        <p className="text-xs text-muted-foreground mt-2">Started: {new Date(m.dateActivated).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No active medications.</p>
                )}
              </div>

              {/* Past Medications */}
              <div className="space-y-3 pt-6 border-t border-border">
                <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" /> Past Medications
                </h4>
                {medications?.past?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                    {medications.past.map((m: any, i: number) => (
                      <div key={i} className="p-4 border border-border bg-muted/20 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-foreground">{m.drugName}</p>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">Completed</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{m.dose} {m.doseUnit}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No past medications.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'immunizations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Shield size={20} className="text-teal-500" /> Immunization History
                </h3>
                <button 
                  onClick={() => setShowImmunizationForm(!showImmunizationForm)}
                  className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  <Plus size={16} /> Record Vaccine
                </button>
              </div>

              <AnimatePresence>
                {showImmunizationForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={handleImmunizationSubmit} className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm text-teal-800 dark:text-teal-400">Record Vaccine Administration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-teal-700/70 dark:text-teal-400/70 block mb-1">Vaccine</label>
                          <select className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={immunizationForm.conceptId} onChange={e => setImmunizationForm({...immunizationForm, conceptId: e.target.value})}>
                            <option value="886">BCG Vaccine</option>
                            <option value="1030">Hepatitis B Vaccine</option>
                            <option value="781">Polio Vaccine</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-teal-700/70 dark:text-teal-400/70 block mb-1">Date Administered</label>
                          <input type="date" required max={new Date().toISOString().split('T')[0]} className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-sm" value={immunizationForm.dateAdministered} onChange={e => setImmunizationForm({...immunizationForm, dateAdministered: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => setShowImmunizationForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingImmunization} className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">{submittingImmunization ? 'Saving...' : 'Record Immunization'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
              {chartData?.immunizations?.length > 0 ? (
                <div className="space-y-3">
                  {chartData.immunizations.map((i: any) => (
                    <div key={i.obs_id} className="p-4 border border-border rounded-xl bg-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                          <Shield size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {getConceptName(i.concept_obs_concept)}
                          </p>
                          <p className="text-sm text-muted-foreground">Administered on {new Date(i.obs_datetime).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                        Administered
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No immunizations recorded.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ClipboardList size={20} className="text-indigo-500" /> Program Enrollments
                </h3>
                <button 
                  onClick={() => setShowProgramForm(!showProgramForm)}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus size={16} /> Enroll
                </button>
              </div>

              {/* Program Enrollment Form */}
              <AnimatePresence>
                {showProgramForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!selectedProgramId) return;
                      try {
                        setSubmittingProgram(true);
                        await fetchApi(`/patient-program/patient/${patientId}`, {
                          method: 'POST',
                          body: JSON.stringify({ program_id: parseInt(selectedProgramId), date_enrolled: new Date().toISOString() })
                        });
                        const progsRes = await fetchApi(`/patient-program/patient/${patientId}`);
                        setPatientPrograms(progsRes);
                        setShowProgramForm(false);
                      } catch (err) {
                        console.error('Failed to enroll', err);
                      } finally {
                        setSubmittingProgram(false);
                      }
                    }} className="bg-muted/30 border border-border p-5 rounded-xl space-y-4 mb-6">
                      <h4 className="font-semibold text-sm">Enroll in Public Health Program</h4>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Select Program</label>
                        <select 
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                          value={selectedProgramId}
                          onChange={e => setSelectedProgramId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose a Program --</option>
                          {availablePrograms.map(p => (
                            <option key={p.program_id || p.uuid} value={p.program_id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowProgramForm(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
                        <button type="submit" disabled={submittingProgram || !selectedProgramId} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">{submittingProgram ? 'Enrolling...' : 'Enroll Patient'}</button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enrolled Programs List */}
              {patientPrograms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientPrograms.map((pp: any) => {
                    const programName = pp.program_program_for_patient?.name || `Program #${pp.program_id}`;
                    return (
                      <div key={pp.patient_program_id} className="p-5 border border-border rounded-xl bg-card shadow-sm flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-foreground text-lg pl-2">{programName}</h4>
                          <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Enrolled</span>
                        </div>
                        <div className="pl-2 space-y-1 text-sm text-muted-foreground">
                          <p>Started: <span className="font-medium text-foreground">{new Date(pp.date_enrolled).toLocaleDateString()}</span></p>
                          {pp.date_completed && <p>Completed: <span className="font-medium text-foreground">{new Date(pp.date_completed).toLocaleDateString()}</span></p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Not enrolled in any programs.</p>
                </div>
              )}
            </div>
          )}

        </div>
        {/* Visit Admission Modal */}
        <AnimatePresence>
          {showVisitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Start Patient Visit
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Admit the patient to a ward and assign a bed.</p>
                </div>
                
                <form onSubmit={handleVisitSubmit} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Visit Type</label>
                    <select
                      required
                      value={visitForm.visitTypeUuid}
                      onChange={(e) => setVisitForm({ ...visitForm, visitTypeUuid: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="">Select Visit Type</option>
                      {visitOptions.visitTypes.map((t: any) => (
                        <option key={t.uuid} value={t.uuid}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location / Ward</label>
                    <select
                      required
                      value={visitForm.locationUuid}
                      onChange={(e) => setVisitForm({ ...visitForm, locationUuid: e.target.value, bedUuid: '' })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="">Select Location</option>
                      {visitOptions.locations.map((l: any) => (
                        <option key={l.uuid} value={l.uuid}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  {visitForm.locationUuid && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Bed Assignment (Optional)</label>
                      <select
                        value={visitForm.bedUuid}
                        onChange={(e) => setVisitForm({ ...visitForm, bedUuid: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      >
                        <option value="">Select a Bed (Leave empty if unassigned)</option>
                        {visitOptions.beds
                          .filter((b: any) => 
                            b.status === 'AVAILABLE' && 
                            b.bed_location_map?.some((blm: any) => blm.location.uuid.trim() === visitForm.locationUuid.trim())
                          )
                          .map((b: any) => (
                            <option key={b.uuid} value={b.uuid}>{b.bed_number} ({b.bed_type?.name})</option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowVisitModal(false)}
                      className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingVisit}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submittingVisit ? (
                        <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Admit Patient'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manage Assignment Modal */}
        <AnimatePresence>
          {showManageAssignmentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <Activity size={20} className="text-secondary-foreground" />
                    Manage Visit Assignment
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Transfer patient to a new ward, assign a bed, or assign a provider.</p>
                </div>
                
                <form onSubmit={handleManageAssignmentSubmit} className="p-6 space-y-4">
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Location / Ward</label>
                    <select
                      value={manageAssignmentForm.locationUuid}
                      onChange={(e) => setManageAssignmentForm({ ...manageAssignmentForm, locationUuid: e.target.value, bedUuid: '' })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="">Keep current location</option>
                      {visitOptions.locations.map((l: any) => (
                        <option key={l.uuid} value={l.uuid}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Bed Assignment</label>
                    <select
                      value={manageAssignmentForm.bedUuid}
                      onChange={(e) => setManageAssignmentForm({ ...manageAssignmentForm, bedUuid: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="">Select a Bed (Leave empty if unassigned)</option>
                      {visitOptions.beds
                        .filter((b: any) => 
                          b.status === 'AVAILABLE' && 
                          b.bed_location_map?.some((blm: any) => blm.location.uuid.trim() === manageAssignmentForm.locationUuid.trim())
                        )
                        .map((b: any) => (
                          <option key={b.uuid} value={b.uuid}>{b.bed_number} ({b.bed_type?.name})</option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Attending Provider</label>
                    <select
                      value={manageAssignmentForm.providerUuid}
                      onChange={(e) => setManageAssignmentForm({ ...manageAssignmentForm, providerUuid: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="">Select Provider (Leave empty if unassigned)</option>
                      {visitOptions.providers.map((p: any) => (
                        <option key={p.uuid} value={p.uuid}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowManageAssignmentModal(false)}
                      className="flex-1 px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors shadow-sm"
                    >
                      Save Assignment
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
