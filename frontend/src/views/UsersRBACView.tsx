import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, ShieldCheck, UserCog, Edit, Trash2, X, Lock, CheckSquare, Shield } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SystemUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  systemId: string;
  status: string;
}

interface Role {
  uuid: string;
  role: string;
  description: string;
  privileges?: string[];
}

interface Privilege {
  privilege: string;
  description: string;
}

export default function UsersRBACView() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('Super Admin');
  
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allPrivileges, setAllPrivileges] = useState<Privilege[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [rolePrivileges, setRolePrivileges] = useState<Set<string>>(new Set());

  const loadUsers = () => {
    fetchApi('/user')
      .then(data => {
        if (data && data.length >= 0) setUsers(data.map((u: any) => ({ ...u, status: 'Active' })));
      })
      .catch(err => console.error("Failed to fetch users:", err));
  };

  const loadRoles = () => {
    fetchApi('/role')
      .then(data => {
        if (data && data.length >= 0) {
          setRoles(data);
          if (data.length > 0 && !data.find((r: any) => r.role === selectedRole)) {
            setSelectedRole(data[0].role);
          }
        }
      })
      .catch(err => console.error("Failed to fetch roles:", err));

    fetchApi('/role/privileges')
      .then(data => {
        if (data && data.length >= 0) setAllPrivileges(data);
      })
      .catch(err => console.error("Failed to fetch privileges:", err));
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // New User Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');

  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Derived state
  const filteredUsers = useMemo(() => users.filter(u => u.role === selectedRole), [users, selectedRole]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    roles.forEach(r => counts[r.role] = 0);
    users.forEach(u => {
      if (counts[u.role] !== undefined) {
        counts[u.role]++;
      }
    });
    return counts;
  }, [users, roles]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newFirstName || !newLastName || !newRole) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi('/user', {
        method: 'POST',
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          role: newRole
        })
      });
      setIsAddUserOpen(false);
      setNewFirstName(''); setNewLastName(''); setNewEmail(''); 
      setNewUsername(''); setNewPassword(''); setNewRole('');
      setSelectedRole(newRole);
      loadUsers();
      toast.success('User created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetchApi(`/user/${id}`, { method: 'DELETE' });
      loadUsers();
      toast.success('User deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    setIsSubmitting(true);
    try {
      await fetchApi('/role', {
        method: 'POST',
        body: JSON.stringify({
          role: newRoleName,
          description: newRoleDesc
        })
      });
      setIsAddRoleOpen(false);
      setNewRoleName(''); setNewRoleDesc('');
      loadRoles();
      toast.success('Role created successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await fetchApi(`/role/${roleName}`, { method: 'DELETE' });
      loadRoles();
      toast.success('Role deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete role');
    }
  };

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Users & RBAC</h1>
          <p className="text-muted-foreground text-sm">Manage system access, roles, and permissions</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'roles' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Roles
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[500px]">
          {/* Left Sidebar: Roles */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary"/> Filter by Role
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {roles.map((r) => (
                <button 
                  key={r.uuid}
                  onClick={() => setSelectedRole(r.role)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${selectedRole === r.role ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted border border-transparent'}`}
                >
                  <span className={`font-medium text-sm ${selectedRole === r.role ? 'text-primary' : 'text-foreground'}`}>{r.role}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{roleCounts[r.role] || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content: Users Table */}
          <div className="lg:col-span-3 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserCog size={16} className="text-primary"/> Users in Role: {selectedRole}
              </h3>
              <button 
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus size={16} /> Add User
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground font-medium uppercase tracking-wider text-[11px]">
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3">Full Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground text-sm">
                  <AnimatePresence>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground text-sm">
                          No users found with role {selectedRole}.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((row) => (
                        <motion.tr 
                          key={row.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          layout
                          className="hover:bg-muted/50 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-3.5 font-bold text-foreground">{row.username}</td>
                          <td className="px-5 py-3.5">{row.firstName} {row.lastName}</td>
                          <td className="px-5 py-3.5 text-muted-foreground">{row.email || '-'}</td>
                          <td className="px-5 py-3.5">
                            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                              {row.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDeleteUser(row.id)}
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden flex-1 min-h-[500px]">
          <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary"/> System Roles
            </h3>
            <button 
              onClick={() => setIsAddRoleOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} /> Add Role
            </button>
          </div>
          <div className="overflow-x-auto flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(r => (
                <div key={r.uuid} className="p-4 border border-border rounded-lg bg-background shadow-sm hover:border-primary/30 transition-colors relative group">
                  <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRole(r);
                        setRolePrivileges(new Set(r.privileges || []));
                      }}
                      className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
                      title="Manage Privileges"
                    >
                      <CheckSquare size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteRole(r.role)}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{r.role}</h4>
                      <p className="text-xs text-muted-foreground">{roleCounts[r.role] || 0} users assigned</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{r.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <AnimatePresence>
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <UserCog size={18} className="text-primary" /> Create New User
                </h3>
                <button 
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">First Name *</label>
                    <input 
                      type="text" 
                      value={newFirstName}
                      onChange={e => setNewFirstName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Last Name *</label>
                    <input 
                      type="text" 
                      value={newLastName}
                      onChange={e => setNewLastName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Username *</label>
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Initial Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                  >
                    <option value="" disabled>Select a role...</option>
                    {roles.map(r => (
                      <option key={r.uuid} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Role Modal */}
      <AnimatePresence>
        {isAddRoleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary" /> Create New Role
                </h3>
                <button 
                  onClick={() => setIsAddRoleOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateRole} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Role Name *</label>
                  <input 
                    type="text" 
                    value={newRoleName}
                    onChange={e => setNewRoleName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground"
                    placeholder="e.g. Pharmacy Admin"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea 
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary transition-colors text-foreground resize-none"
                    placeholder="Brief description of this role's access..."
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddRoleOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Role'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Privileges Modal */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Shield size={18} className="text-primary" /> Edit Privileges: {editingRole.role}
                </h3>
                <button 
                  onClick={() => setEditingRole(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allPrivileges.map(priv => (
                    <label key={priv.privilege} className="flex items-start gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex-shrink-0 mt-0.5">
                        <input 
                          type="checkbox"
                          checked={rolePrivileges.has(priv.privilege)}
                          onChange={(e) => {
                            const newSet = new Set(rolePrivileges);
                            if (e.target.checked) newSet.add(priv.privilege);
                            else newSet.delete(priv.privilege);
                            setRolePrivileges(newSet);
                          }}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{priv.privilege}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{priv.description || 'No description.'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
                <button 
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await fetchApi(`/role/${editingRole.role}/privileges`, {
                        method: 'POST',
                        body: JSON.stringify({ privileges: Array.from(rolePrivileges) })
                      });
                      toast.success('Privileges updated');
                      setEditingRole(null);
                      loadRoles();
                    } catch (e: any) {
                      toast.error(e.message || 'Failed to update privileges');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Privileges'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
