// ./src/app/admin/layout.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';
import { useToast } from '@/context/toastContext';
import { useAuth } from '@/context/authContext';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading: authLoading, checkAuth, clearAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    let isActive = true;

    const verifyAdmin = async () => {
      try {
        const authUser = await checkAuth();
        if (isActive) {
          if (!authUser || authUser.role !== 'admin') {
            showToast('Access denied. Admin privileges required.', 'error');
            router.push('/dashboard');
          }
          setLoading(false);
        }
      } catch (error) {
        if (isActive) {
          console.error('Auth check failed:', error);
          showToast('Please sign in to continue', 'error');
          router.push('/signin');
          setLoading(false);
        }
      }
    };

    verifyAdmin();
    return () => { isActive = false; };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // optional backend call
    } catch (err) {
      console.error('Logout request failed', err);
    }
    clearAuth();
    showToast('Logged out successfully', 'success');
    router.push('/signin');
  };

  if (loading || authLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className={styles.adminLayout}>
      <div className={`${styles.sidebar} ${!isSidebarOpen ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
          <button
            className={styles.toggleButton}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '←' : '→'}
          </button>
        </div>

        <div className={styles.adminInfo}>
          <div className={styles.adminAvatar}>{user?.name?.[0] || 'A'}</div>
          <div className={styles.adminDetails}>
            <h3>{user?.name || 'Admin User'}</h3>
            <p>{user?.email || 'admin@example.com'}</p>
          </div>
        </div>

        <div className={styles.sidebarNav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            <div className={styles.navIcon}>📊</div>
            <span className={styles.navText}>Dashboard</span>
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            <div className={styles.navIcon}>👥</div>
            <span className={styles.navText}>Manage Users</span>
          </Link>
          <Link href="/admin/users/create" className={styles.navLink}>
            <div className={styles.navIcon}>➕</div>
            <span className={styles.navText}>Create Admin</span>
          </Link>
        </div>

        <div className={styles.sidebarFooter}>
          {/* <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userEmail}>{user?.email}</p>
          </div> */}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.expanded : ''}`}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}

