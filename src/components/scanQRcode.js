'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/context/toastContext';
import styles from './styles/TakeAttendance.module.css';

export default function QRCodeScanner() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5Qrcode("reader");

    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setScanning(true);
      setError('');

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleScanSuccess,
        handleScanError
      );
    } catch (err) {
      setError('Failed to start camera: ' + err.message);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scanning) {
      await scannerRef.current.stop();
      setScanning(false);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    try {
      // Parse QR code data
      const qrData = JSON.parse(decodedText);
      
      // Mark attendance
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: qrData.sessionId,
          studentId: user._id,
          subject: qrData.subject,
          teacherId: qrData.teacherId
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        showToast('Attendance marked successfully!', 'success');
        await stopScanning();
      } else {
        throw new Error(result.error || 'Failed to mark attendance');
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    }
  };

  const handleScanError = (err) => {
    // Only log scan errors, don't show to user unless it's a permission error
    if (err.includes('permission')) {
      setError('Camera permission denied');
      showToast('Camera permission denied', 'error');
    }
  };

  return (
    <div className={styles.scannerContainer}>
      <h2 className={styles.title}>Scan Attendance QR Code</h2>
      
      {error && (
        <p className={styles.errorMessage}>{error}</p>
      )}
      
      <div id="reader" className={styles.qrScanner}></div>
      
      {!scanning ? (
        <button 
          onClick={startScanning}
          className={styles.generateButton}
          disabled={scanning}
        >
          Start Scanner
        </button>
      ) : (
        <button 
          onClick={stopScanning}
          className={styles.endButton}
        >
          Stop Scanner
        </button>
      )}
    </div>
  );
}