import { ChartWithDropdown } from '@/components';

export default function Home() {
  // Sample data for our charts
  const data = [
    { x: 'Jan', y: 50, color: '#8884d8' },
    { x: 'Feb', y: 35, color: '#83a6ed' },
    { x: 'Mar', y: 90, color: '#8dd1e1' },
    { x: 'Apr', y: 65, color: '#82ca9d' },
    { x: 'May', y: 75, color: '#a4de6c' },
    { x: 'Jun', y: 45, color: '#d0ed57' }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Chart Outliner Demo</h1>
        
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-semibold mb-6 text-center">Line Chart</h2>
            <p className="text-center text-gray-600 mb-4">Use the "Fill Area" checkbox to toggle between line and area style</p>
            <div className="flex flex-col items-center">
              <ChartWithDropdown data={data} chartType="line" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6 text-center">Bar Chart</h2>
            <div className="flex flex-col items-center">
              <ChartWithDropdown data={data} chartType="bar" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
