import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/main.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chart Outliner",
  description: "A Next.js app for creating charts with custom templates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
