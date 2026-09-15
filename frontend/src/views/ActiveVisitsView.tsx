import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, MoreHorizontal, UserCircle, Activity, Bed, MapPin, Clock, Stethoscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import PatientChartView from './PatientChartView';
import { toast } from 'sonner';

interface ActiveVisit {
  visitId: number;
  visitUuid: string;
  patientId: number;
  mrn: string;
  patientName: string;
  gender: string;
  location: string;
  visitType: string;
  bedNumber: string | null;
  dateStarted: string;
  hoursAdmitted: number;
  attendingProvider: string;
}

export default function ActiveVisitsView() {
  const [visits, setVisits] = useState<ActiveVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const fetchVisits = async () => {
    try {
      const data = await fetchApi('/active-visits');
      setVisits(data.results || data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load active visits');
      console.error('Failed to fetch active visits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleDischarge = async (visitUuid: string) => {
    try {
      await fetchApi(`/visit/${visitUuid}/discharge`, { method: 'POST' });
      await fetchVisits();
      toast.success('Patient discharged successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to discharge patient');
      console.error('Failed to discharge patient', err);
    }
  };

  const getUrgencyColor = (hours: number) => {
    if (hours > 72) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (hours > 24) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    return 'bg-green-500/10 text-green-500 border-green-500/20';
  };

  if (selectedPatientId) {
    return <PatientChartView patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
  }

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Active Visits & Ward Map</h1>
          <p className="text-muted-foreground text-sm">Real-time view of currently admitted patients across all wards</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by MRN, Name, or Ward..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Admitted</p>
            <h3 className="text-2xl font-bold text-foreground">{visits.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Activity size={20} />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Beds Occupied</p>
            <h3 className="text-2xl font-bold text-foreground">{visits.filter(v => v.bedNumber).length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Bed size={20} />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Critical LOS (&gt;72h)</p>
            <h3 className="text-2xl font-bold text-red-500">{visits.filter(v => v.hoursAdmitted > 72).length}</h3>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-semibold text-card-foreground">Current Inpatients</h2>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Ward & Bed</th>
                <th className="px-5 py-3">Visit Type</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Length of Stay</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading active visits...
                    </div>
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No active visits found.</td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.visitId} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {v.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{v.patientName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{v.mrn} • {v.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <MapPin size={14} className="text-primary" />
                          {v.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Bed size={13} />
                          {v.bedNumber ? `Bed ${v.bedNumber}` : 'No Bed Assigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium text-muted-foreground">
                        {v.visitType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Stethoscope size={14} className="opacity-70" />
                        {v.attendingProvider}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(v.hoursAdmitted)}`}>
                        <Clock size={12} />
                        {v.hoursAdmitted} hours
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right flex gap-2 justify-end">
                      <button 
                        onClick={() => setSelectedPatientId(v.patientId)}
                        className="text-primary hover:text-primary/80 transition-colors text-sm font-medium p-1.5 hover:bg-primary/10 rounded-md"
                      >
                        View Chart
                      </button>
                      <button 
                        onClick={() => handleDischarge(v.visitUuid)} 
                        className="text-red-500 hover:text-red-400 transition-colors text-sm font-medium p-1.5 hover:bg-red-500/10 rounded-md"
                      >
                        Discharge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
