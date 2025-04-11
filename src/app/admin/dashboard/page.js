'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/adminDashboard.module.css';
import RegisterStudentForm from '@/app/components/RegisterStudentForm';

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState('register');
  const [adminInfo, setAdminInfo] = useState({ username: '', department: '' });
  const [showRegisterForm, setShowRegisterForm] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch('/api/admin/me');
        if (res.ok) {
          const data = await res.json();
          setAdminInfo({
            username: data.admin.username,
            department: data.admin.department,
          });
        } else {
          // If not authenticated, redirect to signin
          router.push('/admin/signin');
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
        router.push('/admin/signin');
      }
    };

    fetchAdmin();
  }, [router]);

  // Return null or loading state while checking authentication
  if (!adminInfo.username) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div>
          <h2>Admin Panel</h2>
          <p><strong>Name:</strong> {adminInfo.username}</p>
          <p><strong>Dept:</strong> {adminInfo.department}</p>
        </div>

        <div className={styles.navButtons}>
          <button onClick={() => setSelectedSection("register")}>Register Student</button>
          <button onClick={() => setSelectedSection("suspend")}>Suspend Student</button>
          <button onClick={() => setSelectedSection("delete")}>Delete Student</button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {selectedSection === "register" && (
          <div className={styles.formCard}>
            <h2>Register a New Student</h2>
            <p>Please fill out the student's details after scanning their RFID card.</p>

            <button
              className={styles.button}
              onClick={() => setShowRegisterForm(!showRegisterForm)}
            >
              {showRegisterForm ? 'Hide Register Form' : 'Show Register Form'}
            </button>

            {showRegisterForm && <RegisterStudentForm />}
          </div>
        )}

        {selectedSection === "suspend" && (
          <div className={styles.formCard}>
            <p>Suspend student functionality coming soon...</p>
          </div>
        )}
        {selectedSection === "delete" && (
          <div className={styles.formCard}>
            <p>Delete student functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
