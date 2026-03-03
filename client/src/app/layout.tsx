import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import DashboardWrapper from './dashboardWrapper';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Inventory Management Dashboard',
  description:
    'Full-stack inventory management system with dashboard analytics, product tracking, and expense monitoring.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body suppressHydrationWarning className={inter.className}>
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}
