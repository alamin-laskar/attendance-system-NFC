// ./src/app/student/dashboard/page.js
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import QRCodeScanner from '@/components/scanQRcode';
import styles from './dashboard.module.css';

export default function StudentDashboard() {
  const { user, loading, checkAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      checkAuth(true);
    }
  }, [checkAuth, user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          Please sign in to access this page
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.welcomeText}>
          Welcome, {user.name}
        </h1>
        <p className={styles.subtitle}>
          <span className={styles.statusIndicator}></span>
          {user.department} - Semester {user.semester}
        </p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.attendanceSection}>
          <QRCodeScanner />
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Your Details</div>
            <div className={styles.infoValue}>
              <p>Roll Number: {user.rollNumber}</p>
              <p>Department: {user.department}</p>
              <p>Semester: {user.semester}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}