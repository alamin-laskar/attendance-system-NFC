'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import TeacherProfileUpdateForm from '@/components/TeacherProfileUpdateForm';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const { user, loading, checkAuth, clearAuth } = useAuth();
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      checkAuth(true);
    }
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 60000);

    setCurrentTime(new Date().toLocaleTimeString());

    return () => clearInterval(timer);
  }, [checkAuth, user]);

  const handleProfileUpdate = async (updatedUser) => {
    await checkAuth(true);
  };

  const handleTakeAttendance = () => {
    router.push('/teacher/attendance');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        clearAuth();
        router.push('/signin');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.welcomeText}>
            Welcome back, {user.name}
          </h1>
          <p className={styles.subtitle}>
            <span className={styles.statusIndicator}></span>
            Active • Last login: {currentTime}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          Logout
        </button>
      </header>

      <div className={styles.attendanceButtonContainer}>
        <button 
          className={styles.attendanceButton}
          onClick={handleTakeAttendance}
        >
          Take Attendance
        </button>
      </div>

      <div className={styles.mainContent}>
        <TeacherProfileUpdateForm 
          initialData={user} 
          onSuccess={handleProfileUpdate}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Your Subjects</div>
          <div className={styles.infoValue}>
            {user.subjects && user.subjects.length > 0 ? (
              <ul className={styles.subjectList}>
                {user.subjects.map((subject, index) => (
                  <li key={index}>
                    {subject.name} ({subject.code}) - Semester {subject.semester}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No subjects assigned yet</p>
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Today's Schedule</div>
          <div className={styles.infoValue}>
            {user.subjects && user.subjects.length > 0 ? (
              <ul className={styles.scheduleList}>
                {user.subjects.slice(0, 3).map((subject, index) => (
                  <li key={index}>{subject.name} - {subject.code}</li>
                ))}
              </ul>
            ) : (
              'No classes scheduled for today'
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Department</div>
          <div className={styles.infoValue}>
            {user.department || 'Not set'}
          </div>
        </div>
      </div>
    </div>
  );
}