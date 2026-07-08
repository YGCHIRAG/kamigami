import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, change, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-600" />
      </div>
      {change && (
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: '$0.00',
    revenueChange: null,
    revenueTrend: 'up',
    ordersChange: null,
    ordersTrend: 'up',
    activeDrops: 0,
    lowStock: 0,
    recentOrders: [],
    chartData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          fill: true,
          label: 'Sales Revenue',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.4,
        },
      ],
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from real aggregated stats endpoint
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/admin/stats');
        const data = response.data || response;
        
        setStats({
          totalOrders: data.totalOrders ?? 0,
          totalRevenue: data.totalRevenue ?? '$0.00',
          revenueChange: data.revenueChange ?? null,
          revenueTrend: data.revenueTrend ?? 'up',
          ordersChange: data.ordersChange ?? null,
          ordersTrend: data.ordersTrend ?? 'up',
          activeDrops: data.activeDrops ?? 0,
          lowStock: data.lowStock ?? 0,
          recentOrders: data.recentOrders ?? [],
          chartData: data.chartData ?? {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
              {
                fill: true,
                label: 'Sales Revenue',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                tension: 0.4,
              },
            ],
          }
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { display: false }, ticks: { display: false } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Console Overview</h1>
        <p className="text-slate-500 text-sm">Real-time performance metrics and alerts.</p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
          <p className="text-slate-400 text-xs mt-3 font-semibold">Aggregating checkout metrics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={stats.totalRevenue} 
              change={stats.revenueChange} 
              trend={stats.revenueTrend} 
              icon={TrendingUp} 
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              change={stats.ordersChange} 
              trend={stats.ordersTrend} 
              icon={ShoppingCart} 
            />
            <StatCard title="Active Drops" value={stats.activeDrops} icon={Flame} />
            <StatCard title="Low Stock Alerts" value={stats.lowStock} icon={AlertTriangle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-900">Sales Trend</h2>
                <select className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none">
                  <option>Last 7 Days</option>
                </select>
              </div>
              <div className="h-64">
                <Line data={stats.chartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">${parseFloat(order.totalAmount).toFixed(2)}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">{order.status}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-400 py-8">No recent orders</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
