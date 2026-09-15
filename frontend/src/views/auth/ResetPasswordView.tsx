import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';

export default function ResetPasswordView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If no token is present, we shouldn't really be here, but for UI demo purposes we'll allow it.
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      });
      setIsSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full flex flex-col space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Password Reset Successfully</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been updated. You will be redirected to the login page momentarily.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="text-center sm:text-left space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create New Password</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Please enter your new password below to regain access to your account.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !password || !confirmPassword}
          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2.5 rounded font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>
    </div>
  );
}
