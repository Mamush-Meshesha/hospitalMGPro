import React, { useState, useEffect } from 'react';
import { Settings, Shield, Webhook, Save, Server, Eye, Key, Lock, Check, LayoutPanelLeft, BookOpen, ChevronRight, User, Stethoscope, BriefcaseMedical, FlaskConical, Users, Activity, Plus } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type Density = 'small' | 'medium' | 'large';
type Theme = 'light' | 'dark' | 'system';

interface SystemConfig {
  // General
  hospitalName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  // Appearance
  density: Density;
  theme: Theme;
  // Security
  require2FA: boolean;
  require3FA: boolean; // physical key or biometric
  sessionTimeout: number;
  passwordExpiry: number;
  ipWhitelist: string;
  maxLoginAttempts: number;
  auditLogging: boolean;
  // Enterprise
  ssoEnabled: boolean;
  ssoProvider: string;
  hl7ListenerPort: number;
}

const defaultConfig: SystemConfig = {
  hospitalName: 'Hospital-MG Pro General',
  contactEmail: 'admin@openmrs-pro.local',
  maintenanceMode: false,
  density: 'medium',
  theme: 'system',
  require2FA: true,
  require3FA: false,
  sessionTimeout: 30,
  passwordExpiry: 90,
  ipWhitelist: '',
  maxLoginAttempts: 5,
  auditLogging: true,
  ssoEnabled: false,
  ssoProvider: 'Azure AD',
  hl7ListenerPort: 2575,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SystemConfigView() {
  const { theme, setTheme, density, setDensity } = useTheme();

  const [activeTab, setActiveTab] = useState('general');
  const [manualRole, setManualRole] = useState('receptionist');
  const [config, setConfig] = useState<SystemConfig>({
    ...defaultConfig,
    theme: theme,
    density: density
  });

  useEffect(() => {
    fetchApi('/systemsetting')
      .then(_data => {
        // If an endpoint is created later, it would hydrate here.
      })
      .catch(err => console.error("Failed to fetch system config:", err));
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));

    // Immediately apply visual changes
    if (key === 'theme') {
      setTheme(value as Theme);
    }
    if (key === 'density') {
      setDensity(value as Density);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetchApi('/systemsetting', {
        method: 'POST',
        body: JSON.stringify({
          property: 'system.config',
          property_value: JSON.stringify(config),
          description: 'Global system configurations',
          creator: 1
        })
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Switch styles based on toggle state
  const Toggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
    <div className={`relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onChange(!checked)}>
      <div className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none transition-transform duration-200 ease-in-out ${checked ? 'border-primary translate-x-4' : 'border-muted translate-x-0'}`} />
      <div className={`block overflow-hidden h-6 rounded-full ${checked ? 'bg-primary' : 'bg-muted'}`} />
    </div>
  );

  return (
    <div className="w-full space-y-6 h-full flex flex-col relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 right-0 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-lg">
            <Check size={18} />
            <span className="text-sm font-medium">Configuration saved successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-sm">Global configurations and enterprise integrations</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70">
            {isSaving ? <span className="animate-spin text-xl leading-none">⟳</span> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Sidebar */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-max sticky top-6">
          <div className="p-2 space-y-1">
            {[
              { id: 'general', name: 'General Settings', icon: <Settings size={18} /> },
              { id: 'appearance', name: 'Appearance & UI', icon: <LayoutPanelLeft size={18} /> },
              { id: 'security', name: 'Enterprise Security', icon: <Shield size={18} /> },
              { id: 'infrastructure', name: 'Infrastructure', icon: <Server size={18} /> },
              { id: 'integrations', name: 'SSO & Integrations', icon: <Webhook size={18} /> },
              { id: 'manual', name: 'User Manual & Help', icon: <BookOpen size={18} /> },
            ].map((c) => (
              <button key={c.id} onClick={() => setActiveTab(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === c.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'}`}>
                {c.icon}
                <span className="text-sm">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col min-h-[600px]">
          <div className="p-5 border-b border-border bg-muted/20">
            <h3 className="font-semibold text-foreground text-lg capitalize">{activeTab.replace('-', ' ')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === 'general' && 'Core hospital identification and basic system toggles.'}
              {activeTab === 'appearance' && 'Customize the UI density, typography scaling, and theme.'}
              {activeTab === 'security' && 'Manage multi-factor authentication, session limits, and access controls.'}
              {activeTab === 'infrastructure' && 'Database connections, storage, and networking configuration.'}
              {activeTab === 'integrations' && 'Single Sign-On (SSO), active directory, and API webhooks.'}
            </p>
          </div>

          <div className="p-6 space-y-8 overflow-y-auto">
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Hospital Name</label>
                    <input type="text" value={config.hospitalName} onChange={e => update('hospitalName', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Primary Contact Email</label>
                    <input type="email" value={config.contactEmail} onChange={e => update('contactEmail', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                </div>

                <hr className="border-border" />

                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-lg text-amber-600 shrink-0"><Server size={24} /></div>
                  <div className="flex-1 space-y-1">
                    <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                      Maintenance Mode
                      <Toggle checked={config.maintenanceMode} onChange={v => update('maintenanceMode', v)} />
                    </label>
                    <p className="text-sm text-muted-foreground">When enabled, only Super Admins can access the system. A maintenance page is shown to other users.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* UI Density */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><LayoutPanelLeft size={16} /> UI Density</h4>
                  <p className="text-xs text-muted-foreground mb-4">Adjust the compactness of tables, lists, and forms.</p>
                  <div className="grid grid-cols-3 gap-4">
                    {(['small', 'medium', 'large'] as Density[]).map(d => (
                      <div key={d} onClick={() => update('density', d)} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${config.density === d ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold capitalize text-foreground">{d}</span>
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${config.density === d ? 'border-primary' : 'border-muted'}`}>
                            {config.density === d && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                        </div>
                        {/* Visual representation */}
                        <div className="space-y-2 opacity-70">
                          <div className={`bg-muted rounded w-full ${d === 'small' ? 'h-2' : d === 'medium' ? 'h-3' : 'h-4'}`} />
                          <div className={`bg-muted rounded w-3/4 ${d === 'small' ? 'h-2' : d === 'medium' ? 'h-3' : 'h-4'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-border" />

                {/* Theme Selection */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Eye size={16} /> Interface Theme</h4>
                  <p className="text-xs text-muted-foreground mb-4">Select or customize the visual theme.</p>
                  <div className="grid grid-cols-3 gap-4">
                    {(['light', 'dark', 'system'] as Theme[]).map(t => (
                      <div key={t} onClick={() => update('theme', t)} className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-center gap-3 ${config.theme === t ? 'border-primary bg-primary/5 text-primary font-bold' : 'border-border bg-card hover:border-primary/30 text-foreground font-medium'}`}>
                        <span className="capitalize">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enterprise Security Settings */}
            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-6">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2"><Key size={16} /> Multi-Factor Authentication</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground text-sm">Require 2FA (TOTP/SMS)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Enforces two-factor auth for all staff logins.</div>
                    </div>
                    <Toggle checked={config.require2FA} onChange={v => update('require2FA', v)} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                        Require 3FA (Hardware/Biometric)
                        <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Enterprise</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Enforces physical security keys (YubiKey) or biometric scans for high-privilege actions.</div>
                    </div>
                    <Toggle checked={config.require3FA} onChange={v => update('require3FA', v)} disabled={!config.require2FA} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Session Timeout (minutes)</label>
                    <input type="number" value={config.sessionTimeout} onChange={e => update('sessionTimeout', Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Password Expiry (days)</label>
                    <input type="number" value={config.passwordExpiry} onChange={e => update('passwordExpiry', Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Max Login Attempts</label>
                    <input type="number" value={config.maxLoginAttempts} onChange={e => update('maxLoginAttempts', Number(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">IP Whitelist (comma separated)</label>
                    <input type="text" value={config.ipWhitelist} onChange={e => update('ipWhitelist', e.target.value)} placeholder="e.g., 192.168.1.0/24" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors font-mono" />
                  </div>
                </div>

                <hr className="border-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground text-sm flex items-center gap-2"><Lock size={16} /> Comprehensive Audit Logging</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Log every read and write operation to comply with HIPAA/GDPR requirements.</div>
                  </div>
                  <Toggle checked={config.auditLogging} onChange={v => update('auditLogging', v)} />
                </div>
              </motion.div>
            )}

            {/* SSO & Integrations */}
            {activeTab === 'integrations' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between p-4 border border-border bg-card rounded-xl">
                  <div>
                    <div className="font-semibold text-foreground text-sm">Enable Single Sign-On (SSO)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Allow users to log in using external identity providers via SAML/OIDC.</div>
                  </div>
                  <Toggle checked={config.ssoEnabled} onChange={v => update('ssoEnabled', v)} />
                </div>

                {config.ssoEnabled && (
                  <div className="space-y-2 bg-muted/10 p-5 rounded-xl border border-border">
                    <label className="text-sm font-semibold text-foreground">Identity Provider (IdP)</label>
                    <select value={config.ssoProvider} onChange={e => update('ssoProvider', e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors">
                      <option>Azure AD</option>
                      <option>Okta</option>
                      <option>Google Workspace</option>
                      <option>Keycloak</option>
                    </select>

                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                      <button className="text-xs font-semibold text-primary hover:underline">Configure SAML Certificates →</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    HL7 Listener Port
                    <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-bold">Integration</span>
                  </label>
                  <input type="number" value={config.hl7ListenerPort} onChange={e => update('hl7ListenerPort', Number(e.target.value))} className="w-full md:w-1/2 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors font-mono" />
                </div>
              </motion.div>
            )}

            {activeTab === 'infrastructure' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-center">
                <Server size={48} className="text-muted-foreground/30 mb-4" />
                <h4 className="text-lg font-medium text-foreground">Infrastructure Managed via CLI</h4>
                <p className="text-muted-foreground text-sm max-w-sm mt-2">Database and storage parameters are loaded from environmental variables to maintain security in this environment.</p>
              </motion.div>
            )}

            {/* User Manual & Help */}
            {activeTab === 'manual' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col -m-6 border-t-0">
                <div className="flex flex-col md:flex-row min-h-[600px]">
                  {/* Roles Sidebar */}
                  <div className="w-full md:w-1/3 border-r border-border bg-muted/30">
                    <div className="p-4 font-semibold text-xs text-muted-foreground uppercase tracking-wider bg-muted/50 border-b border-border">Select Role</div>
                    <div className="p-2 space-y-1">
                      {[
                        { id: 'workflow', name: 'Patient Journeys', icon: <Activity size={16} />, desc: 'End-to-End Workflows' },
                        { id: 'receptionist', name: 'Receptionist / Front Desk', icon: <User size={16} />, desc: 'Registration & Admissions' },
                        { id: 'doctor', name: 'Doctor / Provider', icon: <Stethoscope size={16} />, desc: 'Clinical & Prescribing' },
                        { id: 'pharmacist', name: 'Pharmacist', icon: <BriefcaseMedical size={16} />, desc: 'Dispensing & Inventory' },
                        { id: 'lab_tech', name: 'Lab Technician', icon: <FlaskConical size={16} />, desc: 'Diagnostics & Results' },
                        { id: 'admin', name: 'System Administrator', icon: <Users size={16} />, desc: 'Config & Security' }
                      ].map(role => (
                        <div
                          key={role.id}
                          onClick={() => setManualRole(role.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all border ${manualRole === role.id ? 'bg-card border-primary/20 shadow-sm' : 'border-transparent hover:bg-muted/50'}`}
                        >
                          <div className={`flex items-center gap-2 font-medium text-sm ${manualRole === role.id ? 'text-primary' : 'text-foreground'}`}>
                            {role.icon}
                            {role.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 ml-6">{role.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Content Area */}
                  <div className="w-full md:w-2/3 bg-card p-6 md:p-8 overflow-y-auto">
                    {manualRole === 'workflow' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                            <Activity size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">End-to-End Patient Journeys</h2>
                            <p className="text-sm text-muted-foreground">How patients move through the system sequentially from arrival to discharge.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                          {/* Case 1: Scheduled Visit */}
                          <div className="p-5 border border-border rounded-xl bg-purple-500/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                            <h3 className="font-bold text-foreground text-lg mb-4 text-purple-700 dark:text-purple-400">Case 1: Scheduled Doctor Appointment</h3>
                            
                            <div className="space-y-4 pl-4 border-l-2 border-purple-500/20 ml-2">
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">1. Booking (Reception/Call Center)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Patient calls the hospital. The receptionist checks the <strong>Provider Directory</strong> for doctor availability, selects an open slot, and books a Scheduled Encounter for a future date.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">2. Check-In & Copay (Reception)</h4>
                                <p className="text-xs text-muted-foreground mt-1">On the day of the visit, the patient arrives. Receptionist finds their booking in <strong>Encounters & ADT</strong>, marks them as "Arrived", and processes the upfront consultation fee in <strong>Billing</strong>.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">3. Triage & Vitals (Nurse)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Nurse pulls the patient into the triage room, uses <strong>Clinical Observations</strong> to log standard vitals against their record, and sends them to the Doctor's waiting room.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">4. Consultation (Doctor)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Doctor opens the scheduled encounter, reviews vitals, writes clinical notes, and uses <strong>CPOE</strong> to prescribe treatments.</p>
                              </div>
                            </div>
                          </div>

                          {/* Standard Workflow */}
                          <div className="p-5 border border-border rounded-xl bg-muted/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="font-bold text-foreground text-lg mb-4">Case 2: Standard Walk-in Outpatient</h3>
                            
                            <div className="space-y-4 pl-4 border-l-2 border-border/50 ml-2">
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">1. Arrival & Registration (Reception)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Walk-in patient arrives. Receptionist registers them in <strong>Patients Hub</strong>, creates an MRN, verifies insurance, and queues them for General Outpatient.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">2. Triage & Consultation (Nurse & Doctor)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Patient undergoes triage (vitals recorded in <strong>Clinical Observations</strong>) and sees the doctor who prescribes meds via <strong>CPOE</strong>.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">3. Fulfillment (Lab & Pharmacy)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Lab Tech receives orders in the <strong>Laboratory</strong> tab, processes samples, and returns results. Pharmacist prepares meds in <strong>Pharmacy Dispense</strong>.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">4. Checkout & Billing (Reception)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Patient stops at the front desk. The receptionist uses <strong>Billing & Insurance</strong> to process copays for the consultation, labs, and pharmacy items before discharge.</p>
                              </div>
                            </div>
                          </div>

                          {/* Emergency Workflow */}
                          <div className="p-5 border border-border rounded-xl bg-red-500/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            <h3 className="font-bold text-foreground text-lg mb-4 text-red-600 dark:text-red-400">Case 3: Emergency (ER) Arrival</h3>
                            
                            <div className="space-y-4 pl-4 border-l-2 border-red-500/20 ml-2">
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">1. Immediate Clinical Care (Doctor/ER Nurse)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Patient bypasses reception. ER Nurse immediately opens <strong>Encounters & ADT</strong> and clicks <span className="px-1 py-0.5 bg-red-500 text-white rounded font-bold text-[10px]">Fast-Track ER Admission</span> to create an anonymous "John Doe" emergency record.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">2. Emergency Orders (Doctor)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Doctor uses the <strong>CPOE Engine</strong> to push stat (urgent) labs and life-saving meds. These orders bypass standard billing checks and appear at the top of Pharmacy/Lab queues with a red urgent flag.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">3. Urgent Fulfillment (Lab & Pharmacy)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Lab and Pharmacy immediately dispense and process the flagged orders directly to the ER without waiting for invoice generation.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">4. Retrospective Registration (Reception)</h4>
                                <p className="text-xs text-muted-foreground mt-1">Once stabilized, a family member goes to the front desk. The receptionist opens the "John Doe" record in <strong>Patients Hub</strong> and updates it with real demographic and insurance data.</p>
                              </div>
                              <div className="relative">
                                <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-red-500 ring-4 ring-card"></div>
                                <h4 className="font-semibold text-sm text-foreground">5. Consolidated Billing</h4>
                                <p className="text-xs text-muted-foreground mt-1">The system retroactively compiles all stat medications, imaging, and ER fees into a single invoice under <strong>Billing & Insurance</strong> for the payer to resolve.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {manualRole === 'receptionist' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Receptionist Quick Guide</h2>
                            <p className="text-sm text-muted-foreground">Manage patient flow, registrations, scheduling, and basic billing.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-sm">1</div> Patient Registration</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Click on <strong>Patients Hub</strong> in the left sidebar.</li>
                              <li>Click the <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[11px] font-bold">New Patient</span> button.</li>
                              <li>Fill in demographics, scan National ID, and capture biometrics if enabled.</li>
                              <li>Click <strong>Save & Generate MRN</strong> to create the record.</li>
                            </ul>
                          </div>

                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-sm">2</div> Doctor Appointments & Booking</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Navigate to <strong>Provider Directory</strong> via the sidebar.</li>
                              <li>Find a provider and click <strong>View Schedule</strong> on their card.</li>
                              <li>In the schedule modal, click the <strong><Plus size={12} className="inline"/> Book Appointment</strong> button.</li>
                              <li>Enter the <strong>Patient Name or ID</strong>, and select the <strong>Date</strong>, <strong>Time Slot</strong>, and <strong>Service Type</strong>.</li>
                              <li>Click <strong>Confirm Booking</strong> to finalize the appointment.</li>
                            </ul>
                          </div>

                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-sm">3</div> Managing Admissions (ADT)</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Navigate to <strong>Encounters & ADT</strong>.</li>
                              <li>Select a patient from the waiting list.</li>
                              <li>Click <strong>Admit Patient</strong> and select the target Ward/Bed.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs shadow-sm">4</div> Billing & Insurance</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Billing & Insurance</strong>.</li>
                              <li>Enter the Patient's MRN to pull up unbilled encounters.</li>
                              <li>Select the active Payer (e.g., National Health Insurance).</li>
                              <li>Generate Invoice and process the co-pay via the POS integration.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {manualRole === 'doctor' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <Stethoscope size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Doctor / Provider Quick Guide</h2>
                            <p className="text-sm text-muted-foreground">Clinical workflows, CPOE, programs, and patient care management.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">1</div> Starting an Encounter</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Encounters & ADT</strong> and view your active patient list.</li>
                              <li>Click on a patient to open their active encounter dashboard.</li>
                              <li>Review the Triage vitals (Pulse, BP, Temp) entered by nurses.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">2</div> Clinical Observations</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Open <strong>Clinical Observations</strong> to chart the patient's condition.</li>
                              <li>Select a standard flowsheet (e.g., Diabetic Assessment, Antenatal).</li>
                              <li>Data entered here is structured using the Concept Dictionary, feeding directly into CDS alerts.</li>
                            </ul>
                          </div>

                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">3</div> Using CPOE (Prescriptions)</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Navigate to the <strong>CPOE Engine</strong> tab while in a patient context.</li>
                              <li>Search for Medications or Lab Panels in the smart search bar.</li>
                              <li>Set dosages, frequency, and duration.</li>
                              <li>Click <strong>Sign & Route Orders</strong> to send to Pharmacy/Lab.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">4</div> Programs & Cohorts</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>If a patient has a chronic illness (e.g., HIV, Diabetes), go to <strong>Patient Programs</strong> and enroll them.</li>
                              <li>Use <strong>Patient Cohorts</strong> to view aggregate data of all patients under your care for a specific condition.</li>
                            </ul>
                          </div>

                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors xl:col-span-2">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-emerald-500 text-white flex items-center justify-center text-xs shadow-sm">5</div> Managing Your Schedule</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to the <strong>Provider Directory</strong> from the main dashboard.</li>
                              <li>Search for your own name and click the <strong>View Schedule</strong> button on your provider card.</li>
                              <li>This opens a modal showing your <strong>Weekly Overview</strong> (days off, working hours).</li>
                              <li>Below that, review your <strong>Upcoming Appointments</strong> list to see scheduled patients, appointment types (Consultation, Follow-up, Procedure), and their confirmation status.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {manualRole === 'pharmacist' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <BriefcaseMedical size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Pharmacist Quick Guide</h2>
                            <p className="text-sm text-muted-foreground">Order fulfillment, dispensing, and inventory tracking.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm">1</div> Dispensing Medications</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Open <strong>Pharmacy Dispense</strong> to see the real-time queue of signed orders.</li>
                              <li>Click an order to view dosage instructions and verify stock.</li>
                              <li>Scan the medication barcode to verify the physical item.</li>
                              <li>Click <strong>Dispense & Complete</strong> to fulfill the order.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-blue-500 text-white flex items-center justify-center text-xs shadow-sm">2</div> Handling CDS Alerts</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>If a prescription has an active <strong className="text-amber-500">CDS Warning</strong> (e.g., contraindication), it will be flagged red.</li>
                              <li>Review the warning. You have the authority to <strong>Reject</strong> the order back to the provider with comments.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {manualRole === 'lab_tech' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                            <FlaskConical size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">Lab & Radiology Tech Quick Guide</h2>
                            <p className="text-sm text-muted-foreground">Processing samples, imaging, and diagnostic results.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-purple-500 text-white flex items-center justify-center text-xs shadow-sm">1</div> Laboratory Samples</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Navigate to the <strong>Laboratory</strong> dashboard.</li>
                              <li>Locate the incoming order and print the specimen barcode label.</li>
                              <li>Once testing is complete, click <strong>Enter Results</strong>.</li>
                              <li>Click <strong>Verify & Release</strong> to send results to the provider.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-purple-500 text-white flex items-center justify-center text-xs shadow-sm">2</div> Radiology & Imaging</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Navigate to the <strong>Radiology</strong> dashboard for imaging orders.</li>
                              <li>Perform the X-Ray/MRI/CT Scan.</li>
                              <li>Upload the DICOM files or link the PACS study reference.</li>
                              <li>Type your radiologist interpretation notes and click <strong>Finalize Report</strong>.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {manualRole === 'admin' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                          <div className="h-10 w-10 rounded-lg bg-slate-700/10 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                            <Users size={20} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-foreground">System Admin Quick Guide</h2>
                            <p className="text-sm text-muted-foreground">Security, system dictionaries, rules, and overarching configurations.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs shadow-sm">1</div> Managing Users (RBAC)</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Users & RBAC</strong>.</li>
                              <li>Create new staff accounts and assign Roles (e.g., Clinical, Admin).</li>
                              <li>Manage department access matrices for strict data segregation.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs shadow-sm">2</div> Concept Dictionary</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Concept Dictionary</strong> to manage the hospital's core ontology (ICD-10, SNOMED).</li>
                              <li>Map local diagnostic terms to standard reference terms here to ensure interoperability and billing accuracy.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs shadow-sm">3</div> Form Builder</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Form Builder</strong> to create custom clinical forms.</li>
                              <li>Drag and drop fields (text, dropdowns, vitals).</li>
                              <li>Map every field to a Concept from the Concept Dictionary so the data is structured and reportable, not just flat text.</li>
                            </ul>
                          </div>

                          <div className="p-5 border border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><div className="h-6 w-6 rounded bg-slate-700 text-white flex items-center justify-center text-xs shadow-sm">4</div> CDS Rules & Facilities</h3>
                            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground list-disc list-inside ml-2">
                              <li>Go to <strong>Decision Support (CDS)</strong> to define logic rules (e.g., "Alert if prescribing Penicillin to allergic patient").</li>
                              <li>Use <strong>Facility Management</strong> to map out clinic rooms, wards, and beds across different physical hospital locations.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

