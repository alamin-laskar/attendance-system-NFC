// ./src/app/layout.js
import { ToastProvider } from '@/context/toastContext';
import { AuthProvider } from '@/context/authContext';
import './globals.css';

export const metadata = {
  title: 'NFC Attendance System',
  description: 'Modern attendance tracking with NFC technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}