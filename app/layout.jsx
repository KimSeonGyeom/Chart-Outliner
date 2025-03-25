  export const metadata = {
  title: "Chart Outliner",
  description: "A Next.js app for creating charts with custom templates",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
