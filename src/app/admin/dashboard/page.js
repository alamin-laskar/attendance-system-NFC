// src/app/admin/dashboard/page.js
'use client';

import styles from './dashboard.module.css';
import { useState, useEffect } from 'react';
import StudentRegistrationForm from '@/components/StudentRegistrationForm';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
    averageAttendance: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // In a real app, you would fetch actual statistics
  useEffect(() => {
    // Simulating API call
    const fetchStats = async () => {
      try {
        // In a real app, replace with actual API call
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        // setStats(data);
        
        // For now, using mock data
        setStats({
          totalStudents: 156,
          totalTeachers: 12,
          todayAttendance: 134,
          averageAttendance: 87
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <p>Welcome to the attendance system admin panel</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Students</h3>
          {loading ? (
            <div className={styles.skeleton}></div>
          ) : (
            <p className={styles.statValue}>{stats.totalStudents}</p>
          )}
        </div>
        
        <div className={styles.statCard}>
          <h3>Total Teachers</h3>
          {loading ? (
            <div className={styles.skeleton}></div>
          ) : (
            <p className={styles.statValue}>{stats.totalTeachers}</p>
          )}
        </div>
        
        <div className={styles.statCard}>
          <h3>Today's Attendance</h3>
          {loading ? (
            <div className={styles.skeleton}></div>
          ) : (
            <p className={styles.statValue}>{stats.todayAttendance} <span className={styles.statPercent}>({Math.round((stats.todayAttendance / stats.totalStudents) * 100)}%)</span></p>
          )}
        </div>
        
        <div className={styles.statCard}>
          <h3>Average Attendance</h3>
          {loading ? (
            <div className={styles.skeleton}></div>
          ) : (
            <p className={styles.statValue}>{stats.averageAttendance}%</p>
          )}
        </div>
      </div>

      <div className={styles.quickAccess}>
        <h2>Quick Access</h2>
        <div className={styles.quickLinksGrid}>
          <button 
            className={styles.registerButton}
            onClick={() => setShowRegistrationModal(true)}
          >
            Register a Student
          </button>
          <a href="/admin/users/create" className={styles.quickLink}>
            Create Admin User
          </a>
          <a href="/admin/users" className={styles.quickLink}>
            Manage Users
          </a>
          <a href="/admin/attendance/report" className={styles.quickLink}>
            Attendance Reports
          </a>
          <a href="/admin/settings" className={styles.quickLink}>
            System Settings
          </a>
        </div>
      </div>

      {showRegistrationModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowRegistrationModal(false)}
            >
              ×
            </button>
            <StudentRegistrationForm />
          </div>
        </div>
      )}
    </div>
  );
}