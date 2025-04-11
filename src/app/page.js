import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>BVEC Attendance System</h1>
      <h2 className={styles.subtitle}>Department of Electronics and Telecommunication Engineering</h2>
      <p className={styles.description}>
        Welcome to the UnOfficial BVEC Attendance Portal. Please sign in to mark your attendance or sign up if you're new.
      </p>
      <div className={styles.buttonGroup}>
        <Link href="/signin">
          <button className={styles.btn}>Sign In</button>
        </Link>
        <Link href="/signup">
          <button className={styles.btnOutline}>Sign Up</button>
        </Link>
      </div>
    </main>
  );
}
