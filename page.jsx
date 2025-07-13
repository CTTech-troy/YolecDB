'use client';

import CountUpCard from './src/component/CountUpCard.jsx';
import OverviewChart from './src/analytics/OverviewChart.jsx';

const statsData = [
	{
		title: 'Total Visitors',
		value: 15847,
		change: 12.5,
		icon: 'ri-user-line',
		color: 'bg-blue-600',
	},
	{
		title: 'Total Blogs',
		value: 256,
		change: 8.2,
		icon: 'ri-article-line',
		color: 'bg-green-600',
	},
	{
		title: 'Total Testimonials',
		value: 89,
		change: -2.3,
		icon: 'ri-chat-quote-line',
		color: 'bg-yellow-600',
	},
	{
		title: 'Total Likes',
		value: 2456,
		change: 15.7,
		icon: 'ri-heart-line',
		color: 'bg-red-600',
	},
];

const chartData = [
	{
		name: 'Jan',
		visitors: 4000,
		blogs: 24,
		testimonials: 8,
		likes: 240,
	},
	{
		name: 'Feb',
		visitors: 3000,
		blogs: 18,
		testimonials: 12,
		likes: 180,
	},
	{
		name: 'Mar',
		visitors: 5000,
		blogs: 32,
		testimonials: 15,
		likes: 320,
	},
	{
		name: 'Apr',
		visitors: 4500,
		blogs: 28,
		testimonials: 10,
		likes: 280,
	},
	{
		name: 'May',
		visitors: 6000,
		blogs: 36,
		testimonials: 18,
		likes: 360,
	},
	{
		name: 'Jun',
		visitors: 5500,
		blogs: 30,
		testimonials: 14,
		likes: 340,
	},
];

export default function AdminDashboard() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					Dashboard Overview
				</h1>
				<p className="text-gray-600">
					Welcome back! Here&apos;s what&apos;s happening with your site.
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{statsData.map((stat, index) => (
					<CountUpCard
						key={index}
						title={stat.title}
						value={stat.value}
						change={stat.change}
						icon={stat.icon}
						color={stat.color}
					/>
				))}
			</div>
			<OverviewChart data={chartData} />
		</div>
	);
}