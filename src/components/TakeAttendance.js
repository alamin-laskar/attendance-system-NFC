// /src/components/TakeAttendance.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './styles/TakeAttendance.module.css';

export default function TakeAttendance({ teacher }) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const pollIntervalRef = useRef(null);

  // Generate a unique session ID when the component mounts
  useEffect(() => {
    setSessionId(generateSessionId());
    
    // Cleanup polling on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Generate a unique session ID
  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Handle subject selection
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  // Generate QR code with attendance data
  const generateQRCode = () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find the selected subject from teacher's subjects
      const subject = teacher.subjects.find(sub => `${sub.code}-${sub.semester}` === selectedSubject);
      
      if (!subject) {
        setError('Subject not found');
        setLoading(false);
        return;
      }

      // Create QR code data
      const attendanceData = {
        sessionId,
        teacherId: teacher._id,
        teacherName: teacher.name,
        department: teacher.department,
        subject: subject.name,
        subjectCode: subject.code,
        semester: subject.semester,
        timestamp: new Date().toISOString(),
      };

      // Convert to JSON string
      const qrData = JSON.stringify(attendanceData);
      setQrCodeData(qrData);
      
      // Start polling for attendance updates
      startPollingAttendance();
    } catch (error) {
      console.error("Error generating QR code:", error);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Start polling for attendance updates
  const startPollingAttendance = () => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Poll every 5 seconds to check how many students have scanned the QR code
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/attendance/count?sessionId=${sessionId}`);
        const data = await response.json();
        
        if (response.ok) {
          setAttendanceCount(data.count);
        }
      } catch (error) {
        console.error("Error polling attendance:", error);
      }
    }, 5000);
  };

  // End the attendance session
  const endAttendanceSession = async () => {
    try {
      setLoading(true);
      
      // Clear the polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      
      // Call API to end the session
      const response = await fetch('/api/attendance/end-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        // Navigate to attendance report page
        router.push(`/teacher/attendance/report?sessionId=${sessionId}`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to end attendance session');
      }
    } catch (error) {
      console.error("Error ending attendance session:", error);
      setError('Failed to end attendance session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.takeAttendanceContainer}>
      <h2 className={styles.title}>Take Attendance</h2>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
      
      <div className={styles.subjectSelector}>
        <label htmlFor="subject" className={styles.label}>Select Subject:</label>
        <select 
          id="subject" 
          value={selectedSubject} 
          onChange={handleSubjectChange}
          className={styles.select}
          disabled={loading || qrCodeData !== null}
        >
          <option value="">-- Select a Subject --</option>
          {teacher.subjects && teacher.subjects.map((subject, index) => (
            <option key={index} value={`${subject.code}-${subject.semester}`}>
              {subject.name} ({subject.code}) - Semester {subject.semester}
            </option>
          ))}
        </select>
      </div>
      
      {!qrCodeData ? (
        <button 
          onClick={generateQRCode} 
          className={styles.generateButton}
          disabled={loading || !selectedSubject}
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      ) : (
        <div className={styles.qrCodeContainer}>
          <div className={styles.qrWrapper}>
            <QRCodeCanvas 
              value={qrCodeData} 
              size={250}
              level="H"
              includeMargin={true}
              className={styles.qrCode}
            />
          </div>
          
          <div className={styles.attendanceInfo}>
            <p className={styles.attendanceCount}>
              Students Scanned: <span className={styles.count}>{attendanceCount}</span>
            </p>
            <p className={styles.attendanceNote}>
              Ask students to scan this QR code using the attendance app
            </p>
            
            <button 
              onClick={endAttendanceSession} 
              className={styles.endButton}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'End Session'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}