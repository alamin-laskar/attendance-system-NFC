'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwtDecode from 'jwt-decode';
import styles from '@/styles/dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error('Invalid token');
      localStorage.removeItem('token');
      router.push('/signin');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome, {user.name} 🎉</h1>
      <div className={styles.info}>
        <p><strong>Roll No:</strong> {user.rollNo}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <button className={styles.logout} onClick={handleLogout}>Logout</button>
    </div>
  );
}
