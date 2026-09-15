import React, { useState, useEffect } from 'react';
import { Activity, Users, BedDouble, AlertCircle, TrendingUp, Beaker, CheckCircle2, Clock, TestTube, Pill, AlertTriangle, Package, Layers, MapPin, ShoppingCart, Truck, FileText, HeartPulse, UserPlus, CreditCard } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, trendColor = 'emerald' }: { title: string, value: string, icon: any, trend?: string, trendColor?: string }) => (
  <div className="bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon size={20} />
      </div>
      {trend && (
        <span className={`text-xs font-medium text-${trendColor}-600 bg-${trendColor}-500/10 px-2 py-1 rounded-full flex items-center gap-1`}>
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-card-foreground">{value}</span>
      <span className="text-muted-foreground font-medium">{title}</span>
    </div>
  </div>
);

// --- Admin Dashboard ---
function AdminDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchApi(`/analytics/dashboard?type=admin`)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to fetch admin analytics:", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Hospital Overview</h1>
        <p className="text-muted-foreground">Live operational metrics and active clinical alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Inpatients" value={data.activeVisitsCount?.toString() || "0"} icon={BedDouble} trend="Live" />
        <StatCard title="Total Admissions" value={data.totalAdmissions?.toString() || "0"} icon={Users} trend="Live" />
        <StatCard title="Avg Length of Stay" value={data.avgLoS || "N/A"} icon={AlertCircle} trend="0%" trendColor="amber" />
        <StatCard title="Staff on Duty" value={data.staffOnDuty?.toString() || "0"} icon={AlertCircle} trend="0" trendColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Patient Flow (Admissions vs Discharges)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDischarges" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }} itemStyle={{ color: 'var(--foreground)' }} />
                <Legend />
                <Area type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAdmissions)" />
                <Area type="monotone" dataKey="discharges" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDischarges)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">CDS Alerts Severity</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.pieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Department Occupancy (%)</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Bar dataKey="occupancy" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recent ADT Activity</h2>
            <button className="text-primary font-medium hover:text-primary/80">View All</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Patient MRN</th>
                  <th className="px-5 py-3">Event</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {data.recentActivity && data.recentActivity.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary">{row.mrn}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        row.event === 'Admission' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        row.event === 'Discharge' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>{row.event}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground/70">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=lab')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load lab stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Laboratory Dashboard</h1>
        <p className="text-muted-foreground">Live metrics for specimen tracking and turnaround times.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders Today" value={data.totalOrdersTodayCount?.toString() || "0"} icon={Clock} trend="Live" trendColor="amber" />
        <StatCard title="Pending Results" value={data.pendingResultsCount?.toString() || "0"} icon={Beaker} trend="Live" trendColor="blue" />
        <StatCard title="Critical Results" value={data.criticalResultsCount?.toString() || "0"} icon={CheckCircle2} trend="Live" />
        <StatCard title="Avg Turnaround" value={data.avgTurnaroundStr || "0"} icon={Activity} trend="Live" trendColor="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Lab Volume Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Today's Volume by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.labBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Bar dataKey="tests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Tests by Priority</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.labPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.labPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Labs Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recent Laboratory Activity</h2>
            <button onClick={() => navigate('/lab')} className="text-primary font-medium hover:text-primary/80">View Lab Hub</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Accession #</th>
                  <th className="px-5 py-3">Test</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {stats.recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No recent lab orders found.</td>
                  </tr>
                ) : stats.recent.map((row, i) => (
                  <tr key={i} onClick={() => navigate(`/lab/${row.uuid}`)} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <td className="px-5 py-3 font-medium text-primary">
                      <div className="flex items-center gap-2 group-hover:underline">
                        <TestTube size={14} className="text-muted-foreground" />
                        {row.order_number}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground/90">
                       {row.concept?.reverse_concept_name_name_for_concept?.[0]?.name || row.concept?.short_name || `Concept ID: ${row.concept_id}`}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        (row.fulfiller_status || 'PENDING') === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        (row.fulfiller_status || 'PENDING') === 'PROCESSING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {row.fulfiller_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground/70">{new Date(row.date_created).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function PharmacyDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=pharmacy')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load pharmacy stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Pharmacy Dashboard</h1>
        <p className="text-muted-foreground">Live metrics for medication dispensing and inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Prescriptions Today" value={data.prescriptionsTodayCount?.toString() || "0"} icon={Clock} trend="Live" trendColor="amber" />
        <StatCard title="Pending Fills" value={data.pendingFillsCount?.toString() || "0"} icon={Pill} trend="Live" trendColor="blue" />
        <StatCard title="Low Stock Alerts" value={data.lowStockAlertsCount?.toString() || "0"} icon={AlertTriangle} trend="Live" trendColor="red" />
        <StatCard title="Avg Wait Time" value={data.avgWaitTimeStr || "0"} icon={Activity} trend="Live" trendColor="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Top Dispensed Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Top Dispensed Medications Today</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.pharmacyBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Orders by Priority</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.pharmacyPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.pharmacyPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Pharmacy Activity Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recent Pharmacy Activity</h2>
            <button onClick={() => navigate('/pharmacy')} className="text-primary font-medium hover:text-primary/80">View Pharmacy Queue</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Patient MRN</th>
                  <th className="px-5 py-3">Medication</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {data.recentDispensations && data.recentDispensations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No recent pharmacy orders found.</td>
                  </tr>
                ) : (data.recentDispensations || []).map((row: any, i: number) => {
                  return (
                    <tr key={i} onClick={() => navigate(`/pharmacy`)} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-3 font-medium text-primary">
                        <div className="flex items-center gap-2 group-hover:underline">
                          {row.patient}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/90 font-medium flex items-center gap-2">
                         <Pill size={14} className="text-muted-foreground" />
                         {row.drug}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          row.status === 'Dispensed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          row.status === 'PREPARING' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/70">{row.time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Storekeeper Dashboard (New) ---
function StorekeeperDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=storekeeper')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load storekeeper stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Storekeeper Dashboard</h1>
        <p className="text-muted-foreground">Live inventory levels and warehouse operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Items in Stock" value={data.totalItemsInStock?.toString() || "0"} icon={Package} trend="Live" trendColor="blue" />
        <StatCard title="Low Stock Alerts" value={data.lowStockAlertsCount?.toString() || "0"} icon={AlertTriangle} trend="Live" trendColor="amber" />
        <StatCard title="Expiring Soon" value={data.expiringSoonCount?.toString() || "0"} icon={Clock} trend="Live" trendColor="red" />
        <StatCard title="Pending Requests" value={data.pendingRequestsCount?.toString() || "0"} icon={AlertCircle} trend="Live" trendColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Inventory Value by Location Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Inventory Value by Location</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.storekeeperBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} formatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Status Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Overall Stock Health</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.storekeeperPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.storekeeperPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Recent Inventory Batches Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recent Inventory Batches</h2>
            <button onClick={() => navigate('/inventory')} className="text-primary font-medium hover:text-primary/80">View Full Inventory</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Batch Number</th>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {data.lowStockItems && data.lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No low stock items found.</td>
                  </tr>
                ) : (data.lowStockItems || []).map((batch: any, i: number) => {
                  const qty = Number(batch.current || 0);
                  const isLow = batch.status === 'Low';
                  const isOut = batch.status === 'Critical';

                  return (
                    <tr key={i} onClick={() => navigate(`/inventory`)} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-3 font-mono text-primary font-medium">
                        <div className="flex items-center gap-2 group-hover:underline">
                          -
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/90 font-medium flex items-center gap-2">
                         <Package size={14} className="text-muted-foreground" />
                         {batch.item}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOut ? 'bg-destructive/10 text-destructive' :
                          isLow ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {qty}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/70 flex items-center gap-1.5">
                        <MapPin size={14} />
                        Main Location
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Procurement Dashboard (New) ---
function ProcurementDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=procurement')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load procurement stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Procurement Dashboard</h1>
        <p className="text-muted-foreground">Supplier relations and purchase order management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Suppliers" value={data.activeSuppliersCount?.toString() || "0"} icon={Truck} trend="Live" trendColor="blue" />
        <StatCard title="Pending POs" value={data.pendingPosCount?.toString() || "0"} icon={Clock} trend="Live" trendColor="amber" />
        <StatCard title="Approved POs" value={data.approvedPosCount?.toString() || "0"} icon={CheckCircle2} trend="Live" trendColor="emerald" />
        <StatCard title="Total PO Spend (MTD)" value={data.totalSpend ? `$${data.totalSpend}` : "N/A"} icon={FileText} trend="Live" trendColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Spend by Category Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Spend by Category</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.procurementPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.procurementPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} formatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Suppliers Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Top Suppliers by Spend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.procurementBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} formatter={(val) => `$${Number(val).toLocaleString()}`} />
                <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent POs Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recent Purchase Orders</h2>
            <button onClick={() => navigate('/po')} className="text-primary font-medium hover:text-primary/80">View All POs</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">PO Number</th>
                  <th className="px-5 py-3">Supplier</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {data.recentPurchaseOrders && data.recentPurchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No recent purchase orders found.</td>
                  </tr>
                ) : (data.recentPurchaseOrders || []).map((po: any, i: number) => {
                  return (
                    <tr key={i} onClick={() => navigate(`/po`)} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-3 font-mono text-primary font-medium">
                        <div className="flex items-center gap-2 group-hover:underline">
                          {po.poNumber}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/90 font-medium flex items-center gap-2">
                         <Truck size={14} className="text-muted-foreground" />
                         {po.supplier}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          po.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          po.status === 'Draft' ? 'bg-muted text-muted-foreground' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground font-medium">
                        {po.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NurseDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=clinical')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load clinical stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Clinical Dashboard</h1>
        <p className="text-muted-foreground">Patient care, ward activity, and clinical orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Inpatients" value={data.activeVisitsCount?.toString() || "0"} icon={BedDouble} trend="Live" trendColor="blue" />
        <StatCard title="Pending Orders" value={data.pendingOrdersCount?.toString() || "0"} icon={TestTube} trend="-0" trendColor="amber" />
        <StatCard title="Obs/Vitals Today" value={data.obsTodayCount?.toString() || "0"} icon={HeartPulse} trend="+0%" trendColor="emerald" />
        <StatCard title="Critical Alerts" value={data.criticalAlertsCount?.toString() || "0"} icon={AlertCircle} trend="Requires Action" trendColor="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Pending Orders Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Pending Orders Breakdown</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.clinicalPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.clinicalPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Ward Activity Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Ward Activity (Vitals Recorded)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.clinicalBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Bar dataKey="alerts" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Patients Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">My Ward - Active Patients</h2>
            <button onClick={() => navigate('/visits')} className="text-primary font-medium hover:text-primary/80">View All Patients</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Visit Type</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {data.recent && data.recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">No active patients in your ward.</td>
                  </tr>
                ) : (data.recent || []).map((visit: any, i: number) => {
                  return (
                    <tr key={i} onClick={() => navigate('/visits')} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                          <Users size={14} className="text-muted-foreground" />
                          {visit.patient?.person?.names?.[0]?.given_name} {visit.patient?.person?.names?.[0]?.family_name}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          visit.visit_type?.name?.toLowerCase().includes('inpatient') ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {visit.visit_type?.name || 'Visit'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground/90 font-medium flex items-center gap-2">
                         <MapPin size={12} className="text-muted-foreground" />
                         {visit.location?.name || 'Unknown Location'}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(visit.date_started).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function FrontDeskDashboard() {
  const { locationId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchApi('/analytics/dashboard?type=frontdesk')
      .then(res => {
        setData(res);
      })
      .catch(err => {
        console.error("Failed to load front desk stats", err);
      })
      .finally(() => setLoading(false));
  }, [locationId]);

  if (loading || !data) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Live Analytics...</div>;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Front Desk Dashboard</h1>
        <p className="text-muted-foreground">Patient registration, queues, and billing operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visits" value={data.todayAdmissions?.toString() || "0"} icon={Users} trend="Live" trendColor="blue" />
        <StatCard title="Patients in Queue" value={data.totalPatientsWaiting?.toString() || "0"} icon={Clock} trend="Live" trendColor="amber" />
        <StatCard title="Avg Wait Time" value={data.averageWaitTime || "0"} icon={Activity} trend="Live" trendColor="emerald" />
        <StatCard title="Active Doctors" value={data.activeDoctors?.toString() || "0"} icon={UserPlus} trend="Live" trendColor="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Queues Pie Chart */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Current Queues Breakdown</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.frontDeskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {data.frontDeskPieData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Visit Volume Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-card-foreground mb-4">Patient Arrival Volume Today</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.frontDeskBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" opacity={0.5} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }} />
                <Bar dataKey="arrivals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/50">
            <h2 className="font-semibold text-card-foreground">Recently Registered Patients</h2>
            <button onClick={() => navigate('/patients')} className="text-primary font-medium hover:text-primary/80">View Patient Hub</button>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3">Patient Name</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Identifier</th>
                  <th className="px-5 py-3">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground text-xs">
                {/* Temporarily empty registrations since it requires a real endpoint to fetch this efficiently */}
                <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">Recent registrations will appear here.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Dashboard Router ---
export default function DashboardView() {
  const { user } = useAuth();
  
  // High-level role checks
  const isSystemAdmin = user?.privileges.includes('VIEW_SYSTEM_CONFIG');
  const isPharmacyAdmin = user?.privileges.includes('VIEW_PHARMACY') && user?.privileges.includes('MANAGE_PURCHASE_ORDERS');
  
  if (isSystemAdmin || isPharmacyAdmin) {
    // Pharmacy Admin has cross-domain access (Pharmacy + Supply Chain), so they get the overarching Admin Dashboard
    return <AdminDashboard />;
  }

  // Clinical user (Nurse/Doctor)
  if (user?.privileges.includes('VIEW_OBS') && !user?.privileges.includes('MANAGE_LAB')) {
    return <NurseDashboard />;
  }

  // Front Desk user (Clerk/Receptionist)
  if (user?.privileges.includes('VIEW_QUEUES') && user?.privileges.includes('MANAGE_BILLING')) {
    return <FrontDeskDashboard />;
  }
  
  // Dedicated Lab Tech
  if (user?.privileges.includes('MANAGE_LAB')) {
    return <LabDashboard />;
  }
  
  // Dedicated Pharmacist
  if (user?.privileges.includes('VIEW_PHARMACY')) {
    return <PharmacyDashboard />;
  }

  // Dedicated Storekeeper
  if (user?.privileges.includes('RECEIVE_STOCK')) {
    return <StorekeeperDashboard />;
  }

  // Dedicated Procurement Officer
  if (user?.privileges.includes('MANAGE_PURCHASE_ORDERS')) {
    return <ProcurementDashboard />;
  }
  
  return <AdminDashboard />;
}
