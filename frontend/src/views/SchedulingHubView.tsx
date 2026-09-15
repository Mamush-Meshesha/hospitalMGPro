import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Search, Filter, Clock, MapPin, User, FileText, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';
import BookAppointmentModal from '../components/ui/BookAppointmentModal';

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

export default function SchedulingHubView() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(true);

  const [draggedApptId, setDraggedApptId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unassigned' | 'assigned'>('all');

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

  function getDaysInMonthGrid(date: Date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDate = getStartOfWeek(monthStart);
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }

  const days = getDaysInWeek(currentWeekStart);
  const monthDays = getDaysInMonthGrid(currentWeekStart);
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const activeDays = viewMode === 'week' ? days : monthDays;
      const start = new Date(activeDays[0]);
      start.setHours(0,0,0,0);
      const end = new Date(activeDays[activeDays.length - 1]);
      end.setHours(23,59,59,999);
      
      const data = await fetchApi(`/appointment/all?startDate=${start.toISOString()}&endDate=${end.toISOString()}`);
      setAppointments(data.results || []);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentWeekStart, viewMode]);

  const nextPeriod = () => {
    const next = new Date(currentWeekStart);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
    }
    setCurrentWeekStart(next);
  };

  const prevPeriod = () => {
    const prev = new Date(currentWeekStart);
    if (viewMode === 'week') {
      prev.setDate(prev.getDate() - 7);
    } else {
      prev.setMonth(prev.getMonth() - 1);
      prev.setDate(1);
    }
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
      const isSlot = d.getDate() === day.getDate() && 
             d.getMonth() === day.getMonth() &&
             d.getFullYear() === day.getFullYear() &&
             d.getHours() === hour;
             
      if (!isSlot) return false;
      
      if (filterType === 'unassigned') return !a.provider;
      if (filterType === 'assigned') return !!a.provider;
      return true;
    });
  };

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(a => {
      if (!a.start_date_time) return false;
      const d = new Date(a.start_date_time);
      const isSameDay = d.getDate() === day.getDate() && 
             d.getMonth() === day.getMonth() &&
             d.getFullYear() === day.getFullYear();
             
      if (!isSameDay) return false;
      
      if (filterType === 'unassigned') return !a.provider;
      if (filterType === 'assigned') return !!a.provider;
      return true;
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
    
    const duration = appt.appointment_service?.duration_mins || 30;
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
      toast.success('Appointment Rescheduled');
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
    <div className="h-full flex flex-col space-y-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-lg font-['Source_Sans_3'] transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-['Lexend']">
            Scheduling Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium mt-1">Manage hospital-wide appointments and duty rosters</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search schedule..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 w-64 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-shadow"
            />
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950">
            <Plus size={18} />
            Book Slot
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 p-0.5">
              <button onClick={prevPeriod} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Previous">
                <ChevronLeft size={18} />
              </button>
              <div className="px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[140px] text-center">
                {viewMode === 'week' ? (
                  <>
                    {days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <span className="text-slate-400 dark:text-slate-600 font-normal mx-1">-</span> 
                    {days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </>
                ) : (
                  <>
                    {currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </>
                )}
              </div>
              <button onClick={nextPeriod} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" aria-label="Next">
                <ChevronRight size={18} />
              </button>
            </div>
            <button 
              onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
              className="px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors border border-transparent">
              Today
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'week' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'month' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex gap-2 relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <Filter size={18} />
            </button>
            
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-md p-2 z-50 flex flex-col gap-1"
                >
                  <button 
                    onClick={() => { setFilterType('all'); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${filterType === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    All Appointments {filterType === 'all' && <Check size={16}/>}
                  </button>
                  <button 
                    onClick={() => { setFilterType('assigned'); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${filterType === 'assigned' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    Assigned Provider {filterType === 'assigned' && <Check size={16}/>}
                  </button>
                  <button 
                    onClick={() => { setFilterType('unassigned'); setIsFilterOpen(false); }}
                    className={`text-left px-3 py-2 text-sm rounded-md flex items-center justify-between transition-colors ${filterType === 'unassigned' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    Unassigned {filterType === 'unassigned' && <Check size={16}/>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 dark:bg-slate-900">
          {viewMode === 'week' ? (
            <div className="min-w-[1000px] h-full flex flex-col">
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                <div className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center flex items-center justify-center">
                  Time
                </div>
                {days.map((d, i) => {
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-3 border-r border-slate-200 dark:border-slate-800 text-center relative ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-white dark:bg-slate-900'}`}>
                      {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />}
                      <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-xl font-bold mt-0.5 ${isToday ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex-1 relative bg-white dark:bg-slate-900">
                {hours.map((hour, hIdx) => (
                  <div key={hIdx} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 min-h-[120px] group">
                    <div className="border-r border-slate-100 dark:border-slate-800 p-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-right relative">
                      <span className="-top-2.5 relative bg-white dark:bg-slate-900 px-1.5 py-0.5">{formatHour(hour)}</span>
                    </div>
                    {days.map((day, dIdx) => {
                      const isToday = day.toDateString() === new Date().toDateString();
                      const slotAppts = getAppointmentsForSlot(day, hour);
                      return (
                        <div 
                          key={dIdx} 
                          className={`border-r border-slate-100 dark:border-slate-800 p-1.5 relative transition-colors duration-150 ${draggedApptId ? 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-blue-300 dark:border-blue-700' : ''} ${isToday ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, day, hour)}
                        >
                          <AnimatePresence>
                            {slotAppts.map(appt => (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={appt.uuid}
                                draggable
                                onDragStart={(e) => handleDragStart(e as any, appt.uuid)}
                                className="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-2.5 shadow-sm text-xs cursor-move mb-2 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group/appt"
                                style={{ 
                                  borderLeftColor: appt.appointment_service?.color || '#059669', 
                                  borderLeftWidth: '3px'
                                }}
                              >
                                <div className="relative z-10">
                                  <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between mb-1">
                                    <span className="truncate pr-2">{appt.appointment_service?.name || 'General Visit'}</span>
                                    <span className="text-[10px] py-0.5 px-1.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">{appt.appointment_service?.duration_mins || 30}m</span>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-400 flex flex-col gap-1 font-medium">
                                    <span className="flex items-center gap-1.5"><User size={12} className="text-slate-400 dark:text-slate-500"/> <span className="truncate">{formatName(appt.patient?.person_person_id_for_patient?.reverse_person_name_name_for_person || [])}</span></span>
                                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400 dark:text-slate-500"/> <span className="truncate">{appt.location?.name || 'Unassigned'}</span></span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-w-[1000px] h-full flex flex-col">
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, i) => (
                  <div key={i} className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center">
                    {dayName}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1 bg-white dark:bg-slate-900 grid-rows-6">
                {monthDays.map((day, dIdx) => {
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentWeekStart.getMonth();
                  const dayAppts = getAppointmentsForDay(day);
                  
                  return (
                    <div 
                      key={dIdx} 
                      className={`border-r border-b border-slate-100 dark:border-slate-800 p-2 relative min-h-[100px] ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''} ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-white'}`}>
                          {day.getDate()}
                        </span>
                        {dayAppts.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                            {dayAppts.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 overflow-hidden max-h-[80px]">
                        {dayAppts.slice(0, 3).map(appt => (
                          <div 
                            key={appt.uuid} 
                            className="text-[11px] truncate px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
                            style={{ borderLeftColor: appt.appointment_service?.color || '#059669', borderLeftWidth: '2px' }}
                            title={`${new Date(appt.start_date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${appt.appointment_service?.name}`}
                          >
                            {new Date(appt.start_date_time).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} {appt.appointment_service?.name || 'Visit'}
                          </div>
                        ))}
                        {dayAppts.length > 3 && (
                          <div className="text-[10px] text-center text-slate-500 font-medium mt-1">
                            +{dayAppts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <BookAppointmentModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onSuccess={fetchAppointments}
      />
    </div>
  );
}
