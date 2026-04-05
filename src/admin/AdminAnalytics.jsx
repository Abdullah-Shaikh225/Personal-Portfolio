import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function AdminAnalytics() {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
            .from('analytics')
            .select('*')
            .gte('timestamp', thirtyDaysAgo)
            .order('timestamp', { ascending: true });
        if (data) setAnalytics(data);
        setLoading(false);
    };

    // Daily traffic data (last 30 days)
    const dailyTraffic = useMemo(() => {
        const days = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            days[key] = 0;
        }
        analytics.filter(a => a.event_type === 'page_visit').forEach(a => {
            const key = new Date(a.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            if (days[key] !== undefined) days[key]++;
        });
        return {
            labels: Object.keys(days),
            datasets: [{
                label: 'Page Visits',
                data: Object.values(days),
                borderColor: '#4f8ef7',
                backgroundColor: 'rgba(79, 142, 247, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: '#4f8ef7'
            }]
        };
    }, [analytics]);

    // Device breakdown
    const deviceData = useMemo(() => {
        const devices = {};
        analytics.filter(a => a.event_type === 'page_visit').forEach(a => {
            const d = a.device_type || 'unknown';
            devices[d] = (devices[d] || 0) + 1;
        });
        return {
            labels: Object.keys(devices).map(d => d.charAt(0).toUpperCase() + d.slice(1)),
            datasets: [{
                data: Object.values(devices),
                backgroundColor: ['#4f8ef7', '#8b5cf6', '#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        };
    }, [analytics]);

    // Traffic sources
    const sourceData = useMemo(() => {
        const sources = {};
        analytics.filter(a => a.event_type === 'page_visit').forEach(a => {
            const s = a.referrer || 'direct';
            sources[s] = (sources[s] || 0) + 1;
        });
        const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 8);
        return {
            labels: sorted.map(([k]) => k),
            datasets: [{
                label: 'Visits',
                data: sorted.map(([, v]) => v),
                backgroundColor: '#4f8ef7',
                borderRadius: 8,
                barThickness: 30
            }]
        };
    }, [analytics]);

    // Most viewed projects
    const projectClicks = useMemo(() => {
        const clicks = {};
        analytics.filter(a => a.event_type === 'project_click').forEach(a => {
            const pid = a.project_id || 'unknown';
            clicks[pid] = (clicks[pid] || 0) + 1;
        });
        return Object.entries(clicks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [analytics]);

    // Section engagement
    const sectionViews = useMemo(() => {
        const sections = {};
        analytics.filter(a => a.event_type === 'section_view').forEach(a => {
            const s = a.section || 'unknown';
            sections[s] = (sections[s] || 0) + 1;
        });
        return Object.entries(sections).sort((a, b) => b[1] - a[1]);
    }, [analytics]);

    // Country/city data
    const locationData = useMemo(() => {
        const locations = {};
        analytics.filter(a => a.event_type === 'page_visit' && a.country).forEach(a => {
            const key = `${a.city || 'Unknown'}, ${a.country}`;
            locations[key] = (locations[key] || 0) + 1;
        });
        return Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 15);
    }, [analytics]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1a2e',
                titleFont: { family: 'Inter' },
                bodyFont: { family: 'Inter' },
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, maxTicksLimit: 10 } },
            y: { grid: { color: '#f0f0f5' }, ticks: { font: { family: 'Inter', size: 11 } }, beginAtZero: true }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner w-8 h-8" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">Analytics Dashboard</h1>
                <p className="text-text-light text-sm mt-1">Last 30 days of visitor data — powered by Supabase</p>
            </div>

            {/* Daily Traffic Chart */}
            <div className="admin-card mb-6 p-6">
                <h3 className="font-bold text-base mb-4">📈 Daily Traffic (Last 30 Days)</h3>
                <div className="h-[300px]">
                    <Line data={dailyTraffic} options={chartOptions} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Device Breakdown */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-base mb-4">📱 Device Breakdown</h3>
                    <div className="h-[250px] flex items-center justify-center">
                        <Doughnut data={deviceData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, padding: 16, usePointStyle: true } },
                                tooltip: { backgroundColor: '#1a1a2e', padding: 12, cornerRadius: 8 }
                            },
                            cutout: '65%'
                        }} />
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-base mb-4">🔗 Traffic Sources</h3>
                    <div className="h-[250px]">
                        <Bar data={sourceData} options={{
                            ...chartOptions,
                            indexAxis: 'y',
                            scales: {
                                ...chartOptions.scales,
                                x: { ...chartOptions.scales.x, grid: { color: '#f0f0f5' } },
                                y: { ...chartOptions.scales.y, grid: { display: false } }
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Most Viewed Projects */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-base mb-4">🚀 Project Clicks</h3>
                    {projectClicks.length === 0 ? (
                        <p className="text-text-light text-sm">No project clicks yet</p>
                    ) : (
                        <div className="space-y-3">
                            {projectClicks.map(([id, count], i) => (
                                <div key={id} className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                                    <span className="text-sm font-medium">Project #{i + 1}</span>
                                    <span className="text-primary font-bold text-sm">{count} clicks</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section Engagement */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-base mb-4">📍 Section Engagement</h3>
                    {sectionViews.length === 0 ? (
                        <p className="text-text-light text-sm">No section data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {sectionViews.map(([section, count]) => (
                                <div key={section} className="flex items-center justify-between p-3 rounded-xl bg-background/50">
                                    <span className="text-sm font-medium capitalize">{section}</span>
                                    <span className="text-secondary font-bold text-sm">{count} views</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Visitor Locations */}
                <div className="admin-card p-6">
                    <h3 className="font-bold text-base mb-4">🌍 Visitor Locations</h3>
                    {locationData.length === 0 ? (
                        <p className="text-text-light text-sm">No location data yet</p>
                    ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {locationData.map(([location, count]) => (
                                <div key={location} className="flex items-center justify-between p-2.5 rounded-lg bg-background/50">
                                    <span className="text-xs font-medium">{location}</span>
                                    <span className="text-primary font-bold text-xs">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
