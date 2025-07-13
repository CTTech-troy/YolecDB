import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const OverviewChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
  );
};

export default OverviewChart;
