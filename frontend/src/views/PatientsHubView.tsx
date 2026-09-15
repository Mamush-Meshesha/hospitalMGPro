import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, MoreHorizontal, Phone, Calendar, Clock, X, UserCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientChartView from './PatientChartView';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

interface Patient {
  personId: number;
  givenName: string;
  familyName: string;
  gender: string;
  birthdate: string | null;
  email?: string;
  phone?: string;
  nextAppointment?: string;
  uuid: string;
  hasFlags?: boolean;
}

export default function PatientsHubView() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const { token, hasPrivilege } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [gender, setGender] = useState('U');
  const [birthdate, setBirthdate] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');

  const fetchPatients = async (query = '') => {
    setLoadingPatients(true);
    try {
      const endpoint = query && query.length >= 3 
        ? `/patient/global-search?q=${encodeURIComponent(query)}` 
        : '/patient';
      const data = await fetchApi(endpoint);
      setPatients(data.results || data || []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load patients');
      console.error('Failed to fetch patients', e);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchQuery && searchQuery.length < 3) {
        toast.error('Search query must be at least 3 characters');
        return;
      }
      fetchPatients(searchQuery);
    }
  };

  if (selectedPatientId !== null) {
    return <PatientChartView patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        givenName,
        familyName,
        gender: gender === 'U' ? 'O' : gender,
        birthdate,
        email,
        phone
      };
      
      const data = await fetchApi('/patient', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const newPatient = {
        personId: data.personId || data.person_id,
        givenName: data.givenName || data.person_name?.[0]?.given_name || givenName,
        familyName: data.familyName || data.person_name?.[0]?.family_name || familyName,
        gender: data.gender || gender,
        birthdate: data.birthdate || birthdate,
        uuid: data.uuid,
        email: data.email || email || 'N/A',
        phone: data.phone || phone || 'N/A',
        nextAppointment: data.nextAppointment || 'N/A'
      };
      
      setPatients([newPatient, ...patients]);
      setIsRegisterOpen(false);
      setGivenName('');
      setFamilyName('');
      setBirthdate('');
      setIdentifier('');
      setEmail('');
      setPhone('');
      setAddress1('');
      toast.success('Patient registered successfully!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to register patient');
      console.error('Registration failed', e);
    }
  };

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patients Hub</h1>
          <p className="text-muted-foreground text-sm">Enterprise Master Patient Index (EMPI) and Registration</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by MRN, Name, or Phone (Enter to search)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') {
                  fetchPatients('');
                }
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm">
            <Filter size={16} /> Filters
          </button>
          {hasPrivilege('ADD_PATIENT') && (
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <UserPlus size={16} />
              Register Patient
            </button>
          )}
        </div>
      </div>

      {/* Main Content (Table) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-semibold text-card-foreground">Registered Patients</h2>
          <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{patients.length} Loaded</span>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3">Patient MRN</th>
                <th className="px-5 py-3">Patient Name</th>
                <th className="px-5 py-3">Gender / Age</th>
                <th className="px-5 py-3">Contact Info</th>
                <th className="px-5 py-3">Next Appointment</th>
                <th className="px-5 py-3">Registered On</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground text-sm">
              {loadingPatients ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading patients...
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No patients registered yet.</td>
                </tr>
              ) : (
                patients.map((p) => {
                  const fullName = `${p.givenName} ${p.familyName}`;
                  const age = p.birthdate
                    ? `${new Date().getFullYear() - new Date(p.birthdate).getFullYear()} yrs`
                    : 'N/A';
                  return (
                    <tr
                      key={p.uuid}
                      onClick={() => setSelectedPatientId(p.personId)}
                      className="hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-semibold text-primary">
                        MRN-{String(p.personId).padStart(5, '0')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {p.gender} <span className="text-border mx-1">•</span> {age}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col text-xs">
                          {p.phone && p.phone !== 'N/A' ? (
                            <span className="text-foreground">{p.phone}</span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                          {p.email && p.email !== 'N/A' && (
                            <span className="text-muted-foreground">{p.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.nextAppointment && p.nextAppointment !== 'N/A' ? (
                          <span className="text-foreground text-sm font-medium">
                            {new Date(p.nextAppointment).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} className="opacity-70" />
                          {p.birthdate ? new Date(p.birthdate).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-primary/10 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/10 text-sm">
          <span className="text-muted-foreground">Showing 1 to {patients.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded bg-card text-muted-foreground hover:bg-muted" disabled>Prev</button>
            <button className="px-3 py-1 border border-primary bg-primary/10 text-primary rounded font-medium">1</button>
            <button className="px-3 py-1 border border-border rounded bg-card text-muted-foreground hover:bg-muted">Next</button>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer for Registration */}
      <AnimatePresence>
        {isRegisterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[500px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-foreground">Register New Patient</h2>
                    <p className="text-xs text-muted-foreground">Create a new EMPI record</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-background/50">
                <form id="register-form" onSubmit={handleRegister} className="max-w-2xl mx-auto space-y-8">
                  
                  {/* Demographics */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserCircle size={16} /> Demographics
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Given Name *</label>
                        <input value={givenName} onChange={e => setGivenName(e.target.value)} required type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="John" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Middle Name</label>
                        <input type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Family Name *</label>
                        <input value={familyName} onChange={e => setFamilyName(e.target.value)} required type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Doe" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Gender *</label>
                        <select value={gender} onChange={e => setGender(e.target.value)} required className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                          <option value="">Select...</option>
                          <option value="M">Male (M)</option>
                          <option value="F">Female (F)</option>
                          <option value="U">Unknown (U)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Date of Birth *</label>
                        <div className="flex items-center gap-2">
                          <input value={birthdate} onChange={e => setBirthdate(e.target.value)} required type="date" className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                          <div className="flex items-center gap-1">
                            <input type="checkbox" id="est" className="rounded border-border text-primary focus:ring-primary" />
                            <label htmlFor="est" className="text-[10px] font-medium text-muted-foreground leading-none">Est.</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+1 (555) 000-0000" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="patient@example.com" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/50" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <UserPlus size={16} /> Identifiers (MRN)
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Identifier *</label>
                        <input value={identifier} onChange={e => setIdentifier(e.target.value)} required type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono" placeholder="MRN-XXXXX" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Identifier Type</label>
                        <select className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                          <option value="1">Hospital-MG ID</option>
                          <option value="2">Old Identification Number</option>
                          <option value="3">National ID</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Assigning Location</label>
                      <select className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                        <option value="1">Main Hospital Building</option>
                        <option value="2">Outpatient Clinic</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-border/50" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Phone size={16} /> Address & Contact
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Address Line 1</label>
                      <input value={address1} onChange={e => setAddress1(e.target.value)} type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="123 Main St" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">City/Village</label>
                        <input type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="City" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">State/Province</label>
                        <input type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="State" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Postal Code</label>
                        <input type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="ZIP" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">Country</label>
                        <input type="text" className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Country" />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" form="register-form" className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                  Save & Admit Patient
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
