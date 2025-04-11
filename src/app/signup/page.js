'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Something went wrong.');
    } else {
      setSuccess('Signup successful! Redirecting...');
      setTimeout(() => {
        router.push('/signin');
      }, 100); // waits for 1 second
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Account</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="name"
          type="text"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          name="rollNo"
          type="text"
          placeholder="Roll Number"
          value={form.rollNo}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button className={styles.btn} type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}
