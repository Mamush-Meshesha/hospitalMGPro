import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Bed, Users, FileText, Pill, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchApi } from '../utils/api';

export default function ReportsView() {
  const [loading, setLoading] = useState(true);
  const [census, setCensus] = useState<any>(null);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [occupancy, setOccupancy] = useState<any[]>([]);
  const [consumption, setConsumption] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [census, diagnoses, beds, pharmacy] = await Promise.all([
        fetchApi('/reports/daily-census'),
        fetchApi('/reports/top-diagnoses'),
        fetchApi('/reports/bed-occupancy'),
        fetchApi('/reports/pharmacy-consumption')
      ]);
      setCensus(census);
      setDiagnoses(diagnoses);
      setOccupancy(beds);
      setConsumption(pharmacy);
    } catch (e) {
      console.error('Failed to fetch reports', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="w-full space-y-6 relative h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="text-primary" /> Hospital Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-sm">Real-time clinical and operational metrics</p>
        </div>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {loading && !census ? (
        <div className="flex flex-col items-center justify-center flex-1 space-y-4">
          <Activity size={48} className="text-primary animate-pulse" />
          <p className="text-muted-foreground">Aggregating hospital data...</p>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admissions Today</p>
                <h3 className="text-2xl font-bold text-foreground">{census?.admissions || 0}</h3>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Discharges Today</p>
                <h3 className="text-2xl font-bold text-foreground">{census?.discharges || 0}</h3>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Bed size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bed Occupancy</p>
                <h3 className="text-2xl font-bold text-foreground">{census?.occupancyRate || 0}%</h3>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inpatients</p>
                <h3 className="text-2xl font-bold text-foreground">{census?.activeInpatients || 0}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Diagnoses Chart */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <AlertCircle className="text-pink-500" /> Top Diagnoses (30 Days)
              </h3>
              <div className="h-[300px] w-full">
                {diagnoses.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diagnoses} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">No diagnosis data available.</div>
                )}
              </div>
            </div>

            {/* Bed Occupancy by Ward */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <Bed className="text-orange-500" /> Occupancy by Ward
              </h3>
              <div className="h-[300px] w-full flex items-center justify-center">
                {occupancy.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancy.filter(o => o.occupied > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="occupied"
                        nameKey="wardName"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {occupancy.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-muted-foreground">No occupancy data available.</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pharmacy Consumption List */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Pill className="text-indigo-500" /> High-Consumption Medications (30 Days)
              </h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-3">Medication Name</th>
                    <th className="px-6 py-3 text-right">Total Dispensed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground text-sm">
                  {consumption.length > 0 ? (
                    consumption.sort((a,b) => b.total - a.total).slice(0, 5).map((item, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400">{item.total} units</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">No recent pharmacy consumption data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
