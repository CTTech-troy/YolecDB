import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OverviewChart = ({ data }) => {
  return (
    <div className="h-[240px] sm:h-[300px] w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="visitors" fill="#8884d8" />
        <Bar dataKey="blogs" fill="#82ca9d" />
        <Bar dataKey="testimonials" fill="#ffc658" />
        <Bar dataKey="likes" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default OverviewChart;
