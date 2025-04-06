import './globals.css';

export const metadata = {
  title: 'Home',
  description: 'Simple Next.js homepage without Tailwind',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
