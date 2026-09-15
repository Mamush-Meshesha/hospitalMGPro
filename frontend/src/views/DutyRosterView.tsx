import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Printer, Search, User, Clock, MapPin, Activity, FileText } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

interface Appointment {
  uuid: string;
  patient_appointment_id: number;
  start_date_time: string;
  end_date_time: string;
  status: string;
  appointment_service?: { name: string; color: string; duration_mins: number };
  patient?: { person_person_id_for_patient?: { reverse_person_name_name_for_person?: any[] } };
  provider?: { person_provider_person_idToperson?: { person_name_person_name_person_idToperson?: any[] } };
  location?: { name: string };
}

export default function DutyRosterView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi('/provider').then(res => {
      setProviders(res.results || []);
      if (res.results?.length > 0) {
        setSelectedProviderId(res.results[0].provider_id);
      }
    }).catch(console.error);
  }, []);

  const fetchRoster = async () => {
    if (!selectedProviderId) return;
    setIsLoading(true);
    try {
      const d = new Date(selectedDate);
      const start = new Date(d);
      start.setHours(0,0,0,0);
      const end = new Date(d);
      end.setHours(23,59,59,999);

      const data = await fetchApi(`/appointment/all?startDate=${start.toISOString()}&endDate=${end.toISOString()}&providerId=${selectedProviderId}`);
      setAppointments(data.results || []);
    } catch (error) {
      toast.error('Failed to load roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedProviderId, selectedDate]);

  const formatName = (names: any[]) => {
    if (!names || names.length === 0) return 'Unknown';
    const n = names[0];
    return `${n.given_name || ''} ${n.family_name || ''}`.trim();
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedProvider = providers.find(p => p.provider_id === selectedProviderId);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duty Roster</h1>
          <p className="text-muted-foreground">Daily schedule and patient list for providers</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
            <User size={16} className="text-muted-foreground" />
            <select 
              value={selectedProviderId || ''} 
              onChange={e => setSelectedProviderId(Number(e.target.value))}
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
            >
              {providers.map(p => (
                <option key={p.provider_id} value={p.provider_id}>
                  Dr. {formatName(p.person_provider_person_idToperson?.person_name_person_name_person_idToperson)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
            <CalendarIcon size={16} className="text-muted-foreground" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm focus:outline-none focus:ring-0"
            />
          </div>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Printer size={18} />
            Print Roster
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden print-container">
        {/* Printable Header */}
        <div className="p-6 border-b border-border bg-muted/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Dr. {selectedProvider ? formatName(selectedProvider.person_provider_person_idToperson?.person_name_person_name_person_idToperson) : 'Loading...'}
            </h2>
            <p className="text-muted-foreground">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Appointments</div>
            <div className="text-2xl font-bold text-primary">{appointments.length}</div>
          </div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No appointments scheduled</h3>
              <p className="text-muted-foreground">The provider has a clear roster for this day.</p>
            </div>
          ) : (
            <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {appointments.map((appt) => (
                <div key={appt.uuid} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-primary/20 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Activity size={16} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-4 rounded-xl border border-border shadow-sm group-hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <Clock size={14} />
                        {formatTime(appt.start_date_time)} - {formatTime(appt.end_date_time)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${appt.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {appt.status || 'Scheduled'}
                      </span>
                    </div>
                    <div className="font-semibold text-lg text-foreground mb-1">
                      {formatName(appt.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person || [])}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {appt.location?.name || 'Clinic'}</span>
                      <span className="flex items-center gap-1"><FileText size={14} /> {appt.appointment_service?.name || 'General'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
