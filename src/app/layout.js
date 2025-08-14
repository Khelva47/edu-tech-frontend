import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata = {
  title: 'Student Tracking App',
  description: 'A Next.js app for tracking students',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}