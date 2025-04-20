// src/app/signin/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './signin.module.css';
import { useToast } from '@/context/toastContext';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('Starting login process...');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setDebugInfo(prev => `${prev}\nSending login request...`);
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }
      
      setDebugInfo(prev => `${prev}\nLogin successful. User role: ${data.user.role}`);
      
      // Show success toast
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      
      // Check for callback URL or use default dashboard
      const callbackUrl = searchParams.get('callbackUrl');
      const dashboardPath = 
        callbackUrl || (
          data.user.role === 'admin' ? '/admin/dashboard' : 
          data.user.role === 'teacher' ? '/teacher/dashboard' : 
          '/student/dashboard'
        );
      
      setDebugInfo(prev => `${prev}\nAttempting to navigate to: ${dashboardPath}`);
      
      // Add a small delay to ensure cookie is set before navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        window.location.href = dashboardPath;
      } catch (navError) {
        setDebugInfo(prev => `${prev}\nNavigation error: ${navError.message}`);
        setLoading(false);
      }
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setDebugInfo(prev => `${prev}\nError: ${error.message}`);
      showToast(error.message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password">Forgot password?</Link>
          </div>
          
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Don't have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: '10px',
            padding: '10px', 
            background: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            <strong>Debug Info:</strong>
            <br />
            {debugInfo || 'No debug information yet'}
          </div>
        )}
      </div>
    </div>
  );
}