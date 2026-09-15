import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../utils/api';

export default function LoginView() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!identifier || !password) {
      setError('Please enter your username/email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password })
      });
      
      login(data.token, data.user, data.subscriptions);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="text-center sm:text-left space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground text-sm">Sign in to your hospital account to continue</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email or Username</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin or dr.house@openmrs.local"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Link to="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input type="checkbox" id="remember" className="rounded border-border text-primary focus:ring-primary h-4 w-4" />
          <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
            Remember me on this device
          </label>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2.5 rounded font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn size={18} />
              Sign In to Portal
            </>
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-border mt-6 text-center text-sm text-muted-foreground">
        Need technical assistance? <a href="#" className="text-primary hover:underline font-medium">Contact IT Support</a>
      </div>
    </div>
  );
}
