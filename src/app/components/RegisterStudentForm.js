'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/registerStudentForm.module.css'; 

export default function RegisterPage() {
    const initialFormState = {
        fullName: '',
        rollNo: '',
        regNo: '',
        admissionYear: '',
        age: '',
        semester: '',
        branch: '',
    };

    const [uid, setUID] = useState('');
    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/connectESP');
                const data = await res.json();
                if (data.uid && data.uid !== uid) {
                    setUID(data.uid);
                    setError(null);
                    setSuccess(null);
                    setFormData(initialFormState);

                    const checkRes = await fetch(`/api/checkUID?uid=${data.uid}`);
                    const checkData = await checkRes.json();
                    if (checkData.exists) {
                        setIsRegistered(true);
                        setError('This RFID card is already registered.');
                    } else {
                        setIsRegistered(false);
                        setError(null);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch UID:', err);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [uid]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!uid) {
            setError('No UID detected. Please scan an RFID card.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const res = await fetch('/api/registerStudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid, ...formData }),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
            if (res.status === 409) {
                setError('This RFID card is already registered.');
                setIsRegistered(true);
            } else {
                setError(data.error || 'An error occurred during registration.');
            }
        } else {
            setSuccess('Student registered successfully!');
            setIsRegistered(false);
            setUID('');
            setFormData(initialFormState);
        }
    };

    const clearForm = () => {
        setFormData(initialFormState);
        setError(null);
        setSuccess(null);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Student Registration</h2>

            <div className={styles.uidRow}>
                <label className={styles.uidLabel}>RFID UID:</label>
                <div className={styles.uidBox}>
                    {uid || 'Waiting for card...'}
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            {!isRegistered && (
                <form onSubmit={handleSubmit}>
                    <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="rollNo" placeholder="Roll Number" value={formData.rollNo} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="regNo" placeholder="Registration Number" value={formData.regNo} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="admissionYear" type="number" placeholder="Admission Year" value={formData.admissionYear} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} required disabled={!uid} className={styles.input} />
                    <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} required disabled={!uid} className={styles.input} />

                    <div className={styles.buttonGroup}>
                        <button type="submit" disabled={loading || !uid} className={styles.button}>
                            {loading ? 'Registering...' : 'Register Student'}
                        </button>
                        <button type="button" onClick={clearForm} disabled={!uid} className={`${styles.button} ${styles.secondaryButton}`}>
                            Clear Form
                        </button>
                    </div>
                </form>
            )}

            {isRegistered && (
                <button onClick={() => {
                    setUID('');
                    setError(null);
                    setIsRegistered(false);
                    setFormData(initialFormState);
                }} className={`${styles.button} ${styles.dangerButton}`}>
                    Register a New Student
                </button>
            )}
        </div>
    );
}
