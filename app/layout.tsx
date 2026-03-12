import type { ReactNode } from 'react';
import './globals.css';
export const metadata = {
  title: 'Voucher Chatbot',
  description: 'Life4Cuts voucher chatbot',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans text-slate-900">{children}</body>
    </html>
  );
}