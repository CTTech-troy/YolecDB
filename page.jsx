import { useState, useEffect } from "react";
import CountUpCard from './src/component/CountUpCard.jsx';
import OverviewChart from './src/analytics/OverviewChart.jsx';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebase.js";

// You can replace with real data when ready
const chartData = [
    { date: '2025-07-01', visitors: 120, blogs: 5, testimonials: 2, likes: 30 },
    { date: '2025-07-02', visitors: 150, blogs: 4, testimonials: 3, likes: 40 },
    { date: '2025-07-03', visitors: 170, blogs: 6, testimonials: 1, likes: 35 },
    { date: '2025-07-04', visitors: 130, blogs: 3, testimonials: 2, likes: 45 },
    { date: '2025-07-05', visitors: 200, blogs: 7, testimonials: 4, likes: 50 },
    { date: '2025-07-06', visitors: 180, blogs: 5, testimonials: 3, likes: 60 },
    { date: '2025-07-07', visitors: 220, blogs: 6, testimonials: 5, likes: 55 },
];

export default function AdminDashboard() {
    const [visitorCount, setVisitorCount] = useState(0);
    const [blogCount, setBlogCount] = useState(0);
    const [testimonialCount, setTestimonialCount] = useState(0);
    const [modelCount, setModelCount] = useState(0);
    const [totalDataCount, setTotalDataCount] = useState(0);

    useEffect(() => {
        async function fetchCounts() {
            try {
                console.log("[Firestore] Fetching counts...");

                const visitorsSnapshot = await getDocs(collection(firestore, "visitors"));
                const blogsSnapshot = await getDocs(collection(firestore, "blogs"));
                const testimonialsSnapshot = await getDocs(collection(firestore, "testimonials"));
                const likesSnapshot = await getDocs(collection(firestore, "likes"));
                const modelsSnapshot = await getDocs(collection(firestore, "models"));

                const visitorsSize = visitorsSnapshot.size;
                const blogsSize = blogsSnapshot.size;
                const testimonialsSize = testimonialsSnapshot.size;
                const likesSize = likesSnapshot.size;
                const modelsSize = modelsSnapshot.size;

                setVisitorCount(visitorsSize);
                setBlogCount(blogsSize);
                setTestimonialCount(testimonialsSize);
                setModelCount(modelsSize);

                // Calculate total data count:
                const totalData = visitorsSize + blogsSize + testimonialsSize + likesSize + modelsSize;
                setTotalDataCount(totalData);

                console.log("[Firestore] All counts fetched:", {
                    visitors: visitorsSize,
                    blogs: blogsSize,
                    testimonials: testimonialsSize,
                    likes: likesSize,
                    models: modelsSize,
                    totalData,
                });
            } catch (error) {
                console.error("[Firestore] Error fetching counts:", error);
            }
        }

        fetchCounts();
    }, []);

    const statsData = [
        {
            title: 'Total Visitors',
            value: visitorCount,
            change: 19.5,
            icon: 'ri-user-line',
            color: 'bg-blue-600',
        },
        {
            title: 'Total Blogs',
            value: blogCount,
            change: 8.2,
            icon: 'ri-article-line',
            color: 'bg-green-600',
        },
        {
            title: 'Total Testimonials',
            value: testimonialCount,
            change: -2.3,
            icon: 'ri-chat-quote-line',
            color: 'bg-yellow-600',
        },
        {
            title: 'Total Models',
            value: modelCount,
            change: 10.1,
            icon: 'ri-shapes-line',
            color: 'bg-purple-600',
        },
        {
            title: 'Total Data Entries',
            value: totalDataCount,
            change: 12.5,
            icon: 'ri-database-2-line',
            color: 'bg-indigo-600',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dashboard Overview
                </h1>
                <p className="text-gray-600">
                    Welcome back! Here's what&apos;s happening with your site.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
