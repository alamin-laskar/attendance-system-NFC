import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <h1>Welcome to My App</h1>
      <p>Your one-stop place for cool stuff. Please sign in or sign up to continue.</p>
      <div className={styles.buttonGroup}>
        <Link href="./signin">
          <button className={styles.btn}>Sign In</button>
        </Link>
        <Link href="./signup">
          <button className={styles.btnOutline}>Sign Up</button>
        </Link>
      </div>
    </main>
  );
}
