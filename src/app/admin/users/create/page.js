// src/app/admin/users/create/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './create.module.css';
import { useToast } from '@/context/toastContext';

export default function CreateAdminUser() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (response.ok && data.user && data.user.role === 'admin') {
          setIsAuthorized(true);
        } else {
          showToast('Unauthorized access. Redirecting to dashboard...', 'error');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        showToast('Authentication failed. Please sign in again.', 'error');
        router.push('/signin');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, [router, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Show success toast
      showToast('Admin user created successfully!', 'success');
      
      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // Redirect to admin user list
      router.push('/admin/users');
      
    } catch (error) {
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Checking authorization...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.header}>
          <h1>Create Admin User</h1>
          <p>Add a new administrator to the system</p>
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address *</label>
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
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <Link href="/admin/users" className={styles.cancelButton}>
              Cancel
            </Link>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Creating User...' : 'Create Admin User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}