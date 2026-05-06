import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import Card from '../../ui/Card.jsx';
import Button from '../../ui/Button.jsx';
import OverviewChart from '../../analytics/OverviewChart.jsx';

const visitsData = [
  { name: 'Jan', visits: 4000, unique: 3200 },
  { name: 'Feb', visits: 3000, unique: 2400 },
  { name: 'Mar', visits: 5000, unique: 4200 },
  { name: 'Apr', visits: 4500, unique: 3800 },
  { name: 'May', visits: 6000, unique: 5100 },
  { name: 'Jun', visits: 5500, unique: 4600 }
];

const blogPerformanceData = [
  { name: 'Week 1', views: 1200, likes: 45, shares: 12 },
  { name: 'Week 2', views: 1800, likes: 67, shares: 23 },
  { name: 'Week 3', views: 1400, likes: 52, shares: 18 },
  { name: 'Week 4', views: 2200, likes: 89, shares: 34 }
];

const testimonialsData = [
  { name: 'Jan', positive: 85, neutral: 12, negative: 3 },
  { name: 'Feb', positive: 78, neutral: 18, negative: 4 },
  { name: 'Mar', positive: 92, neutral: 6, negative: 2 },
  { name: 'Apr', positive: 88, neutral: 10, negative: 2 },
  { name: 'May', positive: 94, neutral: 5, negative: 1 },
  { name: 'Jun', positive: 91, neutral: 7, negative: 2 }
];

const overviewData = [
  { name: 'This Month', visitors: 15847, blogs: 256, testimonials: 89, likes: 2456 },
  { name: 'Last Month', visitors: 12340, blogs: 234, testimonials: 78, likes: 1890 }
];

function Analytics() {
  const [timeFilter, setTimeFilter] = useState('30d');

  const downloadReport = () => {
    alert('Downloading analytics report...');
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your website performance and engagement</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden min-h-[44px] w-full sm:w-auto">
            {['7d', '30d', 'all'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTimeFilter(filter)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-sm font-medium min-h-[44px] ${
                  timeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
          <Button className="w-full sm:w-auto shrink-0" onClick={downloadReport}>
            Download Report
          </Button>
        </div>
      </div>

      {/* Overview Chart */}
      <Card>
        <div className="min-w-0 w-full overflow-x-auto">
          <OverviewChart data={overviewData} />
        </div>
      </Card>

      {/* Website Visits & Blog Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Website Visits</h3>
          <div className="h-[240px] sm:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="visits" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="unique" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Performance</h3>
          <div className="h-[240px] sm:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={blogPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="shares" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Testimonials Engagement */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Testimonials Engagement</h3>
        <div className="h-[280px] sm:h-[400px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={testimonialsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="positive" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            <Area type="monotone" dataKey="neutral" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
            <Area type="monotone" dataKey="negative" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
