'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartWidgetProps {
  data: ChartData<'bar'>;
  height?: number;
  stacked?: boolean;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ data, height = 90, stacked = false }) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: stacked,
        position: 'bottom',
        labels: {
          color: '#475569',
          boxWidth: 11,
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        stacked,
        grid: { display: false },
        ticks: { color: '#64748B', font: { size: 11 } },
      },
      y: {
        stacked,
        grid: { color: '#E2E8F0' },
        ticks: { color: '#64748B', font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
