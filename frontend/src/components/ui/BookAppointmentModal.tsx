import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, User, Stethoscope, FileText } from 'lucide-react';
import { fetchApi } from '../../utils/api';
import { toast } from 'sonner';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookAppointmentModal({ isOpen, onClose, onSuccess }: BookAppointmentModalProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientUuid: '',
    providerUuid: '',
    locationUuid: '',
    serviceUuid: '',
    date: '',
    time: '',
    comments: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadReferenceData();
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today, time: '09:00' }));
    }
  }, [isOpen]);

  const loadReferenceData = async () => {
    setIsLoadingData(true);
    try {
      const [ptsRes, provRes, locRes, srvRes] = await Promise.all([
        fetchApi('/patient'),
        fetchApi('/provider'),
        fetchApi('/location'),
        fetchApi('/appointment/services')
      ]);

      setPatients(ptsRes.results || []);
      setProviders(provRes.results || []);
      setLocations(locRes.results || []);
      setServices(srvRes.results || []);
    } catch (err) {
      toast.error('Failed to load reference data');
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientUuid || !formData.serviceUuid || !formData.date || !formData.time) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
      
      const selectedService = services.find(s => s.uuid === formData.serviceUuid);
      const durationMins = selectedService?.duration_mins || 30;
      
      const endDateTime = new Date(startDateTime.getTime() + durationMins * 60000);

      await fetchApi('/appointment/book', {
        method: 'POST',
        body: JSON.stringify({
          patientUuid: formData.patientUuid,
          providerUuid: formData.providerUuid,
          locationUuid: formData.locationUuid,
          serviceUuid: formData.serviceUuid,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          comments: formData.comments
        })
      });

      toast.success('Appointment booked successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to book appointment');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden font-['Source_Sans_3']">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Lexend']">Book Appointment</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              Loading resources...
            </div>
          ) : (
            <form id="book-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><User size={14}/> Patient *</label>
                <select 
                  required
                  value={formData.patientUuid}
                  onChange={e => setFormData({...formData, patientUuid: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                >
                  <option value="">Select a patient...</option>
                  {patients.map(p => {
                    const names = p.person_person_id_for_patient?.reverse_person_name_name_for_person;
                    const pName = names && names.length > 0 ? `${names[0].given_name || ''} ${names[0].family_name || ''}` : 'Unknown';
                    return <option key={p.uuid} value={p.uuid}>{pName}</option>
                  })}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Stethoscope size={14}/> Service *</label>
                  <select 
                    required
                    value={formData.serviceUuid}
                    onChange={e => setFormData({...formData, serviceUuid: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  >
                    <option value="">Select service...</option>
                    {services.map(s => (
                      <option key={s.uuid} value={s.uuid}>{s.name} ({s.duration_mins}m)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><User size={14}/> Provider</label>
                  <select 
                    value={formData.providerUuid}
                    onChange={e => setFormData({...formData, providerUuid: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  >
                    <option value="">Any provider...</option>
                    {providers.map(p => {
                      const names = p.person_provider_person_id_fk?.reverse_person_name_name_for_person;
                      const pName = names && names.length > 0 ? `${names[0].given_name || ''} ${names[0].family_name || ''}` : 'Unknown';
                      return <option key={p.uuid} value={p.uuid}>{pName}</option>
                    })}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><MapPin size={14}/> Location</label>
                <select 
                  value={formData.locationUuid}
                  onChange={e => setFormData({...formData, locationUuid: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                >
                  <option value="">Any location...</option>
                  {locations.map(l => (
                    <option key={l.uuid} value={l.uuid}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Calendar size={14}/> Date *</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Clock size={14}/> Time *</label>
                  <input 
                    type="time"
                    required
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><FileText size={14}/> Notes</label>
                <textarea 
                  rows={3}
                  value={formData.comments}
                  onChange={e => setFormData({...formData, comments: e.target.value})}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none resize-none"
                  placeholder="Additional instructions..."
                ></textarea>
              </div>

            </form>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="book-form"
            disabled={isSubmitting || isLoadingData}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking...' : 'Book Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
