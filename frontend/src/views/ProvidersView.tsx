import React, { useState, useEffect } from 'react';
import { Search, Filter, Stethoscope, Mail, Phone, Calendar, Plus, X } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Provider {
  name: string;
  specialty: string;
  id: string; // provider.identifier
  dept: string; // provider.role_id concept
  email: string; // provider_attribute
  phone: string; // provider_attribute
  active: boolean;
  uuid?: string; // actual database uuid
}

const initialProviders: Provider[] = [
  { name: 'Dr. Gregory House', specialty: 'Diagnostic Medicine', id: 'PRV-001', dept: 'Infectious Disease', email: 'ghouse@hospital.local', phone: '555-0101', active: true },
  { name: 'Dr. Lisa Cuddy', specialty: 'Endocrinology', id: 'PRV-002', dept: 'Administration', email: 'lcuddy@hospital.local', phone: '555-0102', active: true },
  { name: 'Dr. James Wilson', specialty: 'Oncology', id: 'PRV-003', dept: 'Oncology', email: 'jwilson@hospital.local', phone: '555-0103', active: true },
  { name: 'Dr. Eric Foreman', specialty: 'Neurology', id: 'PRV-004', dept: 'Diagnostic Medicine', email: 'eforeman@hospital.local', phone: '555-0104', active: true },
  { name: 'Dr. Robert Chase', specialty: 'Intensive Care', id: 'PRV-005', dept: 'Surgery', email: 'rchase@hospital.local', phone: '555-0105', active: true },
  { name: 'Dr. Allison Cameron', specialty: 'Immunology', id: 'PRV-006', dept: 'Emergency', email: 'acameron@hospital.local', phone: '555-0106', active: false },
];

export default function ProvidersView() {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProviders = () => {
    fetchApi('/provider?v=full')
      .then(data => {
        if (data && data.results) {
          const mapped = data.results.map((p: any) => ({
            name: p.name,
            specialty: p.specialty || 'General',
            id: p.identifier || 'N/A',
            uuid: p.uuid,
            dept: p.department || 'N/A',
            email: p.email || 'N/A',
            phone: p.phone || 'N/A',
            active: !p.retired
          }));
          setProviders(mapped);
        }
      })
      .catch(err => console.error("Failed to fetch providers:", err));
  };

  const [patients, setPatients] = useState<any[]>([]);

  const loadPatients = () => {
    fetchApi('/patient')
      .then(data => {
        if (data && data.results) setPatients(data.results);
      })
      .catch(err => console.error("Failed to fetch patients:", err));
  };

  useEffect(() => {
    loadProviders();
    loadPatients();
  }, []);
  const [selectedProviderForSchedule, setSelectedProviderForSchedule] = useState<Provider | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Form State
  const [bookingPatient, setBookingPatient] = useState('');
  const [bookingPatientUuid, setBookingPatientUuid] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');

  const handleBookAppointment = async () => {
    if (!selectedProviderForSchedule || !bookingPatientUuid || !bookingDate || !bookingTime) return;
    
    try {
      setIsSubmitting(true);
      
      const timeParts = bookingTime.match(/(\d+):(\d+) (AM|PM)/);
      if (!timeParts) throw new Error("Invalid time format");
      
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      if (timeParts[3] === 'PM' && hours < 12) hours += 12;
      if (timeParts[3] === 'AM' && hours === 12) hours = 0;
      
      const startDateTime = new Date(`${bookingDate}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      await fetchApi('/appointment/book', {
        method: 'POST',
        body: JSON.stringify({
          patientUuid: bookingPatientUuid,
          providerUuid: selectedProviderForSchedule.uuid,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          comments: bookingReason
        })
      });
      
      toast.success('Appointment successfully booked!');
      setIsBookingOpen(false);
      setBookingPatient('');
      setBookingPatientUuid('');
      setBookingDate('');
      setBookingTime('');
      setBookingReason('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form State
  const [newName, setNewName] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddProvider = async () => {
    if (!newName || !newSpecialty || !newDept) return;
    setIsSubmitting(true);
    
    // Convert newId properly on the backend; we just send what it expects
    try {
      await fetchApi('/provider', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          identifier: `PRV-${Date.now().toString().slice(-4)}`,
          specialty: newSpecialty,
          department: newDept,
          email: newEmail || 'N/A',
          phone: newPhone || 'N/A',
          creator: 1
        })
      });
      setIsAddProviderOpen(false);
      setNewName(''); setNewSpecialty(''); setNewDept(''); setNewEmail(''); setNewPhone('');
      loadProviders();
      setNewEmail(''); setNewPhone('');
      loadProviders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Provider Directory</h1>
          <p className="text-muted-foreground text-sm">Manage doctors, nurses, and clinical staff</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search providers..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
          <button 
            onClick={() => setIsAddProviderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Provider
          </button>
        </div>
      </div>

      {/* Grid of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start">
        <AnimatePresence>
          {filteredProviders.map((prv) => (
            <motion.div 
              key={prv.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col group relative"
            >
              {!prv.active && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded font-bold uppercase tracking-wider text-xs border border-border">Inactive</span>
                </div>
              )}
              <div className="p-5 flex flex-col items-center text-center border-b border-border">
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-3 shadow-inner border border-primary/20">
                  {prv.name.split(' ').map(n => n[0]).join('').replace('D','').substring(0, 2)}
                </div>
                <h3 className="font-bold text-foreground text-lg">{prv.name}</h3>
                <p className="text-sm font-medium text-primary mt-1">
                  <span className="text-[10px] text-muted-foreground mr-1 uppercase">Specialty:</span> {prv.specialty}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-[10px] text-muted-foreground mr-1 uppercase">Dept:</span> {prv.dept}
                </p>
              </div>
              
              <div className="p-4 space-y-3 flex-1 bg-muted/5">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Stethoscope size={14} className="text-primary/70"/> ID
                  </div>
                  <span className="font-mono text-foreground">{prv.id}</span>
                </div>
                {prv.email && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-primary/70"/> Email
                    </div>
                    <span className="truncate ml-2 text-foreground text-xs">{prv.email}</span>
                  </div>
                )}
                {prv.phone && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Phone size={14} className="text-primary/70"/> Phone
                    </div>
                    <span className="text-foreground text-xs">{prv.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t border-border/50">
                  <Calendar size={14} className="text-primary/70"/> <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => setSelectedProviderForSchedule(prv)}>View Schedule</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Provider Modal */}
      <AnimatePresence>
        {isAddProviderOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddProviderOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Stethoscope size={20} className="text-primary"/> Register New Provider
                </h2>
                <button 
                  onClick={() => setIsAddProviderOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Provider Core Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="bg-muted px-2 py-1 rounded">provider</span>
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex justify-between">
                      Full Name with Title <span className="text-[10px] text-muted-foreground font-normal">provider.name</span>
                    </label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Dr. Jane Doe" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex justify-between">
                        Specialty <span className="text-[10px] text-muted-foreground font-normal">provider.speciality_id</span>
                      </label>
                      <input type="text" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cardiology" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex justify-between">
                        Department / Role <span className="text-[10px] text-muted-foreground font-normal">provider.role_id</span>
                      </label>
                      <select value={newDept} onChange={e => setNewDept(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                        <option value="">Select a department...</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Internal Medicine">Internal Medicine</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Oncology">Oncology</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Provider Attributes */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="bg-muted px-2 py-1 rounded">provider_attribute</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Contact Email</label>
                      <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="provider@hospital.local" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Contact Phone</label>
                      <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddProviderOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProvider}
                  disabled={!newName || !newSpecialty || !newDept || isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registering...' : 'Register Provider'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Schedule Modal */}
      <AnimatePresence>
        {selectedProviderForSchedule && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProviderForSchedule(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-primary"/> Schedule for {selectedProviderForSchedule.name}
                </h2>
                <button 
                  onClick={() => setSelectedProviderForSchedule(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="bg-muted/30 border border-border rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-sm mb-2 text-foreground">Weekly Overview</h3>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="flex flex-col gap-1">
                        <span className="text-muted-foreground font-medium">{day}</span>
                        <div className={`h-8 rounded-md flex items-center justify-center ${['Sat', 'Sun'].includes(day) ? 'bg-muted text-muted-foreground border border-dashed border-border' : 'bg-primary/10 text-primary border border-primary/20 font-medium'}`}>
                          {['Sat', 'Sun'].includes(day) ? 'Off' : '9-5'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">Upcoming Appointments</h3>
                  {[
                    { time: '09:00 AM', patient: 'Michael Scott', type: 'Consultation', status: 'Confirmed' },
                    { time: '10:30 AM', patient: 'Dwight Schrute', type: 'Follow-up', status: 'Pending' },
                    { time: '01:00 PM', patient: 'Jim Halpert', type: 'Procedure', status: 'Confirmed' },
                    { time: '03:15 PM', patient: 'Pam Beesly', type: 'Consultation', status: 'Confirmed' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">{apt.patient}</span>
                        <span className="text-xs text-muted-foreground">{apt.type}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-foreground">{apt.time}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Book Appointment
                </button>
                <button 
                  onClick={() => setSelectedProviderForSchedule(null)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {isBookingOpen && selectedProviderForSchedule && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-[70] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Calendar size={20} className="text-primary"/> Book Appointment
                </h2>
                <button 
                  onClick={() => setIsBookingOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-muted/30 p-3 rounded-lg border border-border flex flex-col gap-1 mb-2">
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Provider</span>
                  <span className="font-semibold text-sm">{selectedProviderForSchedule.name}</span>
                  <span className="text-xs text-primary">{selectedProviderForSchedule.specialty}</span>
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-xs font-medium text-foreground">Patient Name or ID</label>
                  <input 
                    type="text" 
                    value={bookingPatient} 
                    onChange={e => {
                      setBookingPatient(e.target.value);
                      setBookingPatientUuid(''); // Reset UUID if they type manually
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Search patient name or ID..." 
                  />
                  {showPatientDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {patients.filter(p => (p.display || p.name || '').toLowerCase().includes(bookingPatient.toLowerCase()) || (p.identifier || '').toLowerCase().includes(bookingPatient.toLowerCase())).map(p => (
                        <div 
                          key={p.uuid} 
                          className="px-3 py-2 hover:bg-muted cursor-pointer border-b border-border last:border-0"
                          onClick={() => {
                            setBookingPatient(p.display || p.name);
                            setBookingPatientUuid(p.uuid);
                            setShowPatientDropdown(false);
                          }}
                        >
                          <div className="text-sm font-medium text-foreground">{p.display || p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.identifier || 'No ID'}</div>
                        </div>
                      ))}
                      {patients.filter(p => (p.display || p.name || '').toLowerCase().includes(bookingPatient.toLowerCase()) || (p.identifier || '').toLowerCase().includes(bookingPatient.toLowerCase())).length === 0 && (
                        <div className="px-3 py-3 text-sm text-center text-muted-foreground">No patients found.</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Date</label>
                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Time Slot</label>
                    <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="">Select time...</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Reason / Service Type</label>
                  <select value={bookingReason} onChange={e => setBookingReason(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select service...</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Routine Check">Routine Check</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsBookingOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBookAppointment}
                  disabled={!bookingPatientUuid || !bookingDate || !bookingTime || isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {isSubmitting ? <span className="animate-pulse">Booking...</span> : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
