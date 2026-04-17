import React from "react";
import type { ReactNode } from "react";
import "./soft-ui.css";
import "./globals.css";

export const metadata = {
  title: "Voucher Chatbot",
  description: "life4Cuts voucher chatbot",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: ReactNode;
})
 {
  return (
    <html lang="vi">
           <body className="font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}