import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Activity, User, MapPin } from 'lucide-react';
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
  location?: { name: string, location_id: number };
}

export default function OTScheduleView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const [otLocationId, setOtLocationId] = useState<number | null>(null);

  const [draggedApptId, setDraggedApptId] = useState<string | null>(null);

  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  function getDaysInWeek(start: Date) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }

  const days = getDaysInWeek(currentWeekStart);
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 8 PM for surgeries

  useEffect(() => {
    // Need to find the OT location ID first
    fetchApi('/location')
      .then(res => {
        const ot = res.results?.find((l: any) => l.name === 'Main Operation Theatre');
        if (ot) setOtLocationId(ot.location_id);
      })
      .catch(console.error);
  }, []);

  const fetchAppointments = async () => {
    if (!otLocationId) return;
    setIsLoading(true);
    try {
      const start = new Date(days[0]);
      start.setHours(0,0,0,0);
      const end = new Date(days[6]);
      end.setHours(23,59,59,999);
      
      const data = await fetchApi(`/appointment/all?startDate=${start.toISOString()}&endDate=${end.toISOString()}&locationId=${otLocationId}`);
      setAppointments(data.results || []);
    } catch (error) {
      toast.error('Failed to load OT schedule');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (otLocationId) {
      fetchAppointments();
    }
  }, [currentWeekStart, otLocationId]);

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h;
    return `${hour}:00 ${ampm}`;
  };

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return appointments.filter(a => {
      if (!a.start_date_time) return false;
      const d = new Date(a.start_date_time);
      return d.getDate() === day.getDate() && 
             d.getMonth() === day.getMonth() &&
             d.getFullYear() === day.getFullYear() &&
             d.getHours() === hour;
    });
  };

  const handleDragStart = (e: React.DragEvent, uuid: string) => {
    setDraggedApptId(uuid);
    e.dataTransfer.setData('text/plain', uuid);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    if (!draggedApptId) return;
    
    const appt = appointments.find(a => a.uuid === draggedApptId);
    if (!appt) return;

    const newStart = new Date(day);
    newStart.setHours(hour, 0, 0, 0);
    
    const duration = appt.appointment_service?.duration_mins || 120;
    const newEnd = new Date(newStart);
    newEnd.setMinutes(newStart.getMinutes() + duration);

    try {
      await fetchApi(`/appointment/${draggedApptId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({
          startDateTime: newStart.toISOString(),
          endDateTime: newEnd.toISOString()
        })
      });
      toast.success('Surgery Rescheduled');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to reschedule');
    }
    setDraggedApptId(null);
  };

  const formatName = (names: any[]) => {
    if (!names || names.length === 0) return 'Unknown';
    const n = names[0];
    return `${n.given_name || ''} ${n.family_name || ''}`.trim();
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">OT Schedule</h1>
          <p className="text-muted-foreground">Manage Operating Theatre assignments and surgeries</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Activity size={18} />
            Schedule Surgery
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-background rounded-lg border border-border p-1">
              <button onClick={prevWeek} className="p-1 hover:bg-muted rounded text-muted-foreground"><ChevronLeft size={18} /></button>
              <span className="px-3 text-sm font-medium">
                {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button onClick={nextWeek} className="p-1 hover:bg-muted rounded text-muted-foreground"><ChevronRight size={18} /></button>
            </div>
            <button className="px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">
              Today
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-[1000px] h-full flex flex-col">
            <div className="grid grid-cols-8 border-b border-border bg-muted/10 sticky top-0 z-10">
              <div className="p-4 border-r border-border font-medium text-muted-foreground text-sm text-center">
                Time
              </div>
              {days.map((d, i) => (
                <div key={i} className={`p-4 border-r border-border text-center ${d.toDateString() === new Date().toDateString() ? 'bg-red-500/5' : ''}`}>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className={`text-lg font-bold mt-1 ${d.toDateString() === new Date().toDateString() ? 'text-red-500' : 'text-foreground'}`}>
                    {d.getDate()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              {hours.map((hour, hIdx) => (
                <div key={hIdx} className="grid grid-cols-8 border-b border-border min-h-[100px]">
                  <div className="border-r border-border p-3 text-xs font-medium text-muted-foreground text-right relative">
                    <span className="-top-3 relative bg-card px-1">{formatHour(hour)}</span>
                  </div>
                  {days.map((day, dIdx) => {
                    const slotAppts = getAppointmentsForSlot(day, hour);
                    return (
                      <div 
                        key={dIdx} 
                        className={`border-r border-border p-1 relative ${draggedApptId ? 'hover:bg-red-500/5' : ''} transition-colors`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, hour)}
                      >
                        {slotAppts.map(appt => (
                          <div 
                            key={appt.uuid}
                            draggable
                            onDragStart={(e) => handleDragStart(e, appt.uuid)}
                            className="bg-card border border-border rounded-md p-2 shadow-sm text-xs cursor-move hover:border-red-500/50 transition-colors mb-1 group"
                            style={{ borderLeftColor: appt.appointment_service?.color || '#ef4444', borderLeftWidth: '3px' }}
                          >
                            <div className="font-semibold text-foreground truncate">
                              {appt.appointment_service?.name || 'Surgery'}
                            </div>
                            <div className="text-muted-foreground mt-1 flex flex-col gap-0.5">
                              <span className="flex items-center gap-1"><User size={10}/> {formatName(appt.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person || [])}</span>
                              <span className="flex items-center gap-1"><MapPin size={10}/> {appt.location?.name || 'OT'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
