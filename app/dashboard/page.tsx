import DashboardCharts from '@/components/DashboardChart';
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Petty Cash</h1>
      
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }>
        <DashboardCharts />
      </Suspense>
    </div>
  );
}