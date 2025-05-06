// /src/app/teacher/attendance/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import TakeAttendance from '@/components/TakeAttendance';
import Link from 'next/link';
import styles from './attendance.module.css';

export default function AttendancePage() {
  const { user, loading, checkAuth } = useAuth();
  
  useEffect(() => {
    if (!user) {
      checkAuth(true);
    }
  }, [checkAuth, user]);

  if (loading && !user) {
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

  if (user.role !== 'teacher') {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          You need teacher privileges to access this page
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Attendance Management</h1>
        <Link href="/teacher/dashboard" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </header>

      <div className={styles.mainContent}>
        <TakeAttendance teacher={user} />
      </div>
    </div>
  );
}