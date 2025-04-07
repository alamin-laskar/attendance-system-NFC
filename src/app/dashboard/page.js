'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import styles from '@/styles/dashboard.module.css';

function capitalizeName(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }
    console.log('Decoded Token:', user);

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
    <div className={styles.dashboardWrapper}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Dashboard</h2>
        <div className={styles.profileSection}>
          <span>Hello, {user.name.split(' ')[0]}</span>
          <button className={styles.editBtn} onClick={() => setShowEditModal(true)}>Edit</button>
        </div>

        <div className={styles.statusBox}>
          <h3>Current Status</h3>
          <p><strong>Semester:</strong> 6</p>
          <p><strong>Subjects:</strong> DSP, CN, ES, MP</p>
        </div>

        <div className={styles.semesters}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i + 1} className={styles.semButton}>
              Sem {i + 1}
            </button>
          ))}
        </div>

        <nav className={styles.nav}>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className={styles.main}>
        <div className={styles.studentDetails}>
          <h2>Student Details</h2>
          <div className={styles.detailItem}><strong>Name:</strong> {capitalizeName(user.name)}</div>
          <div className={styles.detailItem}><strong>Roll No:</strong> {user.rollNo}</div>
          <div className={styles.detailItem}><strong>Registration No:</strong> 2021ETE001</div>
          <div className={styles.detailItem}><strong>Semester:</strong> 6</div>
          <div className={styles.detailItem}>
            <strong>Subjects:</strong>
            <ul className={styles.subjectList}>
              <li>DSP - 85%</li>
              <li>CN - 78%</li>
              <li>ES - 92%</li>
              <li>MP - 88%</li>
            </ul>
          </div>
        </div>

        {showEditModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Edit Profile</h3>
              <form>
                <label>
                  Name:
                  <input type="text" defaultValue={user.name} />
                </label>
                <label>
                  Roll No:
                  <input type="text" defaultValue={user.rollNo} />
                </label>
                <label>
                  Registration No:
                  <input type="text" defaultValue="2021ETE001" />
                </label>
                <div className={styles.modalButtons}>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
