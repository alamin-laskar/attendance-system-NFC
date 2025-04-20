// ./src/components/StudentRegistrationForm.js
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/toastContext';
import styles from './styles/StudentRegistrationForm.module.css';

export default function StudentRegistrationForm() {
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    regNo: '',
    department: '',
    semester: '',
    email: '',
    phone: '',
    nfcId: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [nfcDetected, setNfcDetected] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'update'

  // Poll for NFC data when scanning is active
  useEffect(() => {
    let pollInterval;
    
    if (isScanning) {
      showToast('Please tap your NFC card on the reader...', 'info');
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/connect-esp');
          const data = await response.json();
          
          // Increment poll count to show we're actively polling
          setPollCount(prev => prev + 1);
          
          // Check if we have a UID in the response
          if (data && data.uid) {
            setFormData(prev => ({
              ...prev,
              nfcId: data.uid
            }));
            setIsScanning(false);
            setNfcDetected(true);
            
            // Check if this NFC ID is already associated with a user
            checkExistingNfcUser(data.uid);
            
            showToast(`NFC card detected: ${data.uid}!`, 'success');
          }
        } catch (error) {
          console.error('Error polling NFC:', error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isScanning, showToast]);

  // Check if the NFC card is already associated with a user
  const checkExistingNfcUser = async (nfcId) => {
    try {
      const response = await fetch(`/api/users/check-nfc?nfcId=${nfcId}`);
      const data = await response.json();
      
      if (data.exists && data.user) {
        // If the user exists, pre-fill the form with their data
        setFormData({
          name: data.user.name || '',
          studentId: data.user.studentId || '',
          regNo: data.user.regNo || '',
          department: data.user.department || '',
          semester: data.user.semester || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          nfcId: nfcId
        });
        setFormMode('update');
        showToast(`This card belongs to ${data.user.name}. You can update their information.`, 'info');
      } else {
        setFormMode('create');
      }
    } catch (error) {
      console.error('Error checking NFC user:', error);
      // Continue with registration as new user
      setFormMode('create');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startNFCScan = () => {
    setNfcDetected(false);
    setIsScanning(true);
    setPollCount(0);
    setFormData({
      name: '',
      studentId: '',
      regNo: '',
      department: '',
      semester: '',
      email: '',
      phone: '',
      nfcId: ''
    });
    setFormMode('create');
    showToast('Please tap your NFC card on the reader...', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Student registration failed');
      }

      if (data.student?.updated) {
        showToast(`Student information updated successfully!`, 'success');
      } else {
        showToast('Student registered successfully!', 'success');
      }
      
      // Reset form and start scanning for next student
      setFormData({
        name: '',
        studentId: '',
        regNo: '',
        department: '',
        semester: '',
        email: '',
        phone: '',
        nfcId: '',
      });
      setNfcDetected(false);
      setIsScanning(true);
      setPollCount(0);
      setFormMode('create');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    'Computer Science & Engineering',
    'Computer Engineering',
    'Computer Applications',
    'Cyber Security',
    'Electronics & Telecommunication Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{formMode === 'create' ? 'Add New Student' : 'Update Student Information'}</h2>

        {/* NFC Scanning Section at the top */}
        <div className={`${styles.formGroup} ${styles.nfcSection}`}>
          <label htmlFor="nfcId">NFC Card ID</label>
          <div className={styles.nfcInputGroup}>
            <input
              type="text"
              id="nfcId"
              name="nfcId"
              value={formData.nfcId}
              onChange={handleChange}
              required
              className={nfcDetected ? styles.nfcDetected : ''}
            />
            <button
              type="button"
              onClick={startNFCScan}
              disabled={isScanning}
              className={styles.scanButton}
            >
              {isScanning ? 'Scanning...' : 'Scan Again'}
            </button>
          </div>
          {isScanning && (
            <p className={styles.scanningMessage}>
              Waiting for NFC card... (Polls: {pollCount})
              <br />
              Please tap your card on the ESP8266 reader.
            </p>
          )}
          {formMode === 'update' && (
            <p className={styles.updateMessage}>
              This card is already registered. You can update the student's information.
            </p>
          )}
        </div>
        
        {/* Rest of the form fields */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={!nfcDetected}
            readOnly={formMode === 'update'} // Make read-only in update mode
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="studentId">Student ID / Roll No</label>
          <input
            type="text"
            id="studentId"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            required
            disabled={!nfcDetected}
            readOnly={formMode === 'update'} // Make read-only in update mode
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="regNo">University Registration No</label>
          <input
            type="text"
            id="regNo"
            name="regNo"
            value={formData.regNo}
            onChange={handleChange}
            required
            disabled={!nfcDetected}
            readOnly={formMode === 'update'} // Make read-only in update mode
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="department">Department</label>
          <select
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className={styles.select}
            disabled={!nfcDetected}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className={styles.select}
            disabled={!nfcDetected}
          >
            <option value="">Select Semester</option>
            {semesters.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={!nfcDetected}
            readOnly={formMode === 'update'} // Make read-only in update mode
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="+91-xxxxxxxxxx"
            disabled={!nfcDetected}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isScanning || !nfcDetected}
          className={styles.submitButton}
        >
          {isLoading 
            ? (formMode === 'update' ? 'Updating Student...' : 'Registering Student...') 
            : (formMode === 'update' ? 'Update Student' : 'Register Student')
          }
        </button>
      </form>
    </div>
  );
}