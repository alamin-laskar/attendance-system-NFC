'use client';

import { useState, useEffect } from 'react';

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
        <div style={{
            maxWidth: '600px',
            margin: '30px auto',
            padding: '20px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '10px'
        }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Student Registration</h2>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>RFID UID:</label>
                <div style={{
                    padding: '6px 10px',
                    background: '#f0f0f0',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                }}>
                    {uid || 'Waiting for card...'}
                </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            {!isRegistered && (
                <form onSubmit={handleSubmit}>
                    <input name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="rollNo" placeholder="Roll Number" value={formData.rollNo} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="regNo" placeholder="Registration Number" value={formData.regNo} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="admissionYear" type="number" placeholder="Admission Year" value={formData.admissionYear} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="semester" placeholder="Semester" value={formData.semester} onChange={handleChange} required disabled={!uid} style={inputStyle} />
                    <input name="branch" placeholder="Branch" value={formData.branch} onChange={handleChange} required disabled={!uid} style={inputStyle} />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" disabled={loading || !uid} style={buttonStyle}>
                            {loading ? 'Registering...' : 'Register Student'}
                        </button>
                        <button type="button" onClick={clearForm} disabled={!uid} style={{ ...buttonStyle, backgroundColor: '#6c757d' }}>
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
                }} style={{ ...buttonStyle, backgroundColor: '#f44336', marginTop: '10px' }}>
                    Register a New Student
                </button>
            )}
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '8px',
    margin: '6px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
};

const buttonStyle = {
    padding: '10px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
};
