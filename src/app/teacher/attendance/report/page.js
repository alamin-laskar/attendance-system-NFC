'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { useSearchParams } from 'next/navigation';
import styles from '../attendance.module.css';
import { useToast } from '@/context/toastContext';
import Link from 'next/link';

export default function AttendanceReport() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const endpoint = sessionId 
          ? `/api/attendance/session/${sessionId}`
          : '/api/attendance/all';
        
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (response.ok) {
          setAttendanceData(data);
        } else {
          showToast(data.error || 'Failed to fetch attendance data', 'error');
        }
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
        showToast('Failed to fetch attendance data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAttendanceData();
    }
  }, [user, sessionId, showToast]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className={styles.reportContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {sessionId ? 'Session Attendance Report' : 'All Attendance Records'}
        </h2>
        <Link href="/teacher/dashboard" className={styles.backLink}>
          Back to Dashboard
        </Link>
      </header>
      
      {attendanceData.length === 0 ? (
        <p className={styles.noData}>No attendance records found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr key={record._id}>
                  <td>{record.studentName}</td>
                  <td>{record.subject}</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{new Date(record.createdAt).toLocaleTimeString()}</td>
                  <td>
                    <span className={`${styles.status} ${styles[record.status.toLowerCase()]}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}